from typing import List, Optional
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max, Count, F, Prefetch
from django.db import transaction
from ninja import Router, Schema, Query, File, UploadedFile
from ninja.errors import HttpError
from pydantic import BaseModel

from messaging.models import Conversation, Message, MessageReadStatus, ConversationRequest
from users.models import User
from api.auth import jwt_auth

router = Router()


class UserInfo(BaseModel):
    id: int
    username: str
    first_name: str
    last_name: str
    profile_picture: Optional[str] = None
    user_type: str
    is_online: bool = False


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender: UserInfo
    content: str
    created_at: datetime
    is_read: bool
    read_at: Optional[datetime] = None
    attachment: Optional[str] = None
    attachment_name: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    subject: str
    is_group: bool
    participants: List[UserInfo]
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime


class CreateMessageRequest(BaseModel):
    content: str


class CreateConversationRequest(BaseModel):
    participant_ids: List[int]
    subject: Optional[str] = ""
    initial_message: str


class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    has_more: bool


@router.get("/conversations", response=ConversationListResponse, auth=jwt_auth)
def list_conversations(request, page: int = 1, search: Optional[str] = None):
    """List user's conversations with pagination and search"""
    user = request.auth
    
    # Get conversations where user is a participant
    conversations = Conversation.objects.filter(
        participants=user
    ).prefetch_related(
        'participants',
        Prefetch(
            'messages',
            queryset=Message.objects.select_related('sender').order_by('-created_at')
        )
    )
    
    # Apply search filter
    if search:
        conversations = conversations.filter(
            Q(subject__icontains=search) |
            Q(participants__username__icontains=search) |
            Q(participants__first_name__icontains=search) |
            Q(participants__last_name__icontains=search)
        ).distinct()
    
    # Add last message and unread count annotation
    conversations = conversations.annotate(
        last_message_time=Max('messages__created_at')
    ).order_by('-last_message_time')
    
    # Paginate
    page_size = 20
    start = (page - 1) * page_size
    end = start + page_size
    
    total = conversations.count()
    conversations = conversations[start:end]
    
    # Build response
    conversation_list = []
    for conv in conversations:
        # Get last message
        last_msg = conv.messages.first() if conv.messages.exists() else None
        
        # Get unread count
        unread_count = conv.messages.filter(
            is_read=False
        ).exclude(sender=user).count()
        
        # Build participant list
        participants = []
        for p in conv.participants.all():
            participants.append(UserInfo(
                id=p.id,
                username=p.username,
                first_name=p.first_name,
                last_name=p.last_name,
                profile_picture=p.profile_picture.url if p.profile_picture else None,
                user_type=p.user_type,
                is_online=False  # TODO: Implement online status
            ))
        
        # Build last message response
        last_message_resp = None
        if last_msg:
            sender_info = UserInfo(
                id=last_msg.sender.id,
                username=last_msg.sender.username,
                first_name=last_msg.sender.first_name,
                last_name=last_msg.sender.last_name,
                profile_picture=last_msg.sender.profile_picture.url if last_msg.sender.profile_picture else None,
                user_type=last_msg.sender.user_type
            )
            last_message_resp = MessageResponse(
                id=last_msg.id,
                conversation_id=conv.id,
                sender=sender_info,
                content=last_msg.content,
                created_at=last_msg.created_at,
                is_read=last_msg.is_read,
                read_at=last_msg.read_at,
                attachment=last_msg.attachment.url if last_msg.attachment else None,
                attachment_name=last_msg.attachment_name
            )
        
        conversation_list.append(ConversationResponse(
            id=conv.id,
            subject=conv.subject or conv.__str__(),
            is_group=conv.is_group,
            participants=participants,
            last_message=last_message_resp,
            unread_count=unread_count,
            created_at=conv.created_at,
            updated_at=conv.updated_at
        ))
    
    return ConversationListResponse(
        conversations=conversation_list,
        total=total
    )


@router.get("/conversations/{conversation_id}/messages", response=MessageListResponse, auth=jwt_auth)
def get_messages(request, conversation_id: int, before_id: Optional[int] = None, limit: int = 50):
    """Get messages for a conversation with pagination"""
    user = request.auth
    
    # Verify user is participant
    conversation = get_object_or_404(
        Conversation.objects.prefetch_related('participants'),
        id=conversation_id,
        participants=user
    )
    
    # Mark messages as read
    conversation.mark_read_by(user)
    
    # Get messages
    messages = conversation.messages.select_related('sender').order_by('-created_at')
    
    # Apply pagination cursor
    if before_id:
        messages = messages.filter(id__lt=before_id)
    
    messages = messages[:limit + 1]  # Get one extra to check if there's more
    has_more = len(messages) > limit
    messages = messages[:limit]
    
    # Build response
    message_list = []
    for msg in messages:
        sender_info = UserInfo(
            id=msg.sender.id,
            username=msg.sender.username,
            first_name=msg.sender.first_name,
            last_name=msg.sender.last_name,
            profile_picture=msg.sender.profile_picture.url if msg.sender.profile_picture else None,
            user_type=msg.sender.user_type
        )
        
        message_list.append(MessageResponse(
            id=msg.id,
            conversation_id=conversation_id,
            sender=sender_info,
            content=msg.content,
            created_at=msg.created_at,
            is_read=msg.is_read,
            read_at=msg.read_at,
            attachment=msg.attachment.url if msg.attachment else None,
            attachment_name=msg.attachment_name
        ))
    
    # Reverse to get chronological order
    message_list.reverse()
    
    return MessageListResponse(
        messages=message_list,
        total=conversation.messages.count(),
        has_more=has_more
    )


@router.post("/conversations/{conversation_id}/messages", response=MessageResponse, auth=jwt_auth)
def send_message(request, conversation_id: int, data: CreateMessageRequest):
    """Send a message in a conversation"""
    user = request.auth
    
    # Verify user is participant
    conversation = get_object_or_404(
        Conversation.objects.prefetch_related('participants'),
        id=conversation_id,
        participants=user
    )
    
    # Create message
    with transaction.atomic():
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=data.content
        )
        
        # Update conversation timestamp
        conversation.updated_at = message.created_at
        conversation.save()
    
    # Build response
    sender_info = UserInfo(
        id=user.id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        profile_picture=user.profile_picture.url if user.profile_picture else None,
        user_type=user.user_type
    )
    
    return MessageResponse(
        id=message.id,
        conversation_id=conversation_id,
        sender=sender_info,
        content=message.content,
        created_at=message.created_at,
        is_read=False,
        read_at=None
    )


@router.post("/conversations", response=ConversationResponse, auth=jwt_auth)
def create_conversation(request, data: CreateConversationRequest):
    """Create a new conversation"""
    user = request.auth
    
    # Validate participants
    if not data.participant_ids:
        raise HttpError(400, "At least one participant is required")
    
    # Ensure user is not in participant list
    participant_ids = [pid for pid in data.participant_ids if pid != user.id]
    
    # Add current user to participants
    all_participant_ids = participant_ids + [user.id]
    
    # Check if conversation already exists between these participants
    if len(all_participant_ids) == 2 and not data.subject:
        # For 1-on-1 conversations, check if one already exists
        existing = Conversation.objects.filter(
            is_group=False,
            participants__in=all_participant_ids
        ).annotate(
            participant_count=Count('participants')
        ).filter(
            participant_count=2
        ).first()
        
        if existing:
            # Return existing conversation
            return get_conversation_response(existing, user)
    
    # Create new conversation
    with transaction.atomic():
        conversation = Conversation.objects.create(
            subject=data.subject,
            is_group=len(all_participant_ids) > 2
        )
        
        # Add participants
        participants = User.objects.filter(id__in=all_participant_ids)
        conversation.participants.set(participants)
        
        # Create initial message
        if data.initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=user,
                content=data.initial_message
            )
    
    return get_conversation_response(conversation, user)


def get_conversation_response(conversation, user):
    """Helper function to build conversation response"""
    # Get last message
    last_msg = conversation.messages.select_related('sender').order_by('-created_at').first()
    
    # Get unread count
    unread_count = conversation.messages.filter(
        is_read=False
    ).exclude(sender=user).count()
    
    # Build participant list
    participants = []
    for p in conversation.participants.all():
        participants.append(UserInfo(
            id=p.id,
            username=p.username,
            first_name=p.first_name,
            last_name=p.last_name,
            profile_picture=p.profile_picture.url if p.profile_picture else None,
            user_type=p.user_type,
            is_online=False
        ))
    
    # Build last message response
    last_message_resp = None
    if last_msg:
        sender_info = UserInfo(
            id=last_msg.sender.id,
            username=last_msg.sender.username,
            first_name=last_msg.sender.first_name,
            last_name=last_msg.sender.last_name,
            profile_picture=last_msg.sender.profile_picture.url if last_msg.sender.profile_picture else None,
            user_type=last_msg.sender.user_type
        )
        last_message_resp = MessageResponse(
            id=last_msg.id,
            conversation_id=conversation.id,
            sender=sender_info,
            content=last_msg.content,
            created_at=last_msg.created_at,
            is_read=last_msg.is_read,
            read_at=last_msg.read_at
        )
    
    return ConversationResponse(
        id=conversation.id,
        subject=conversation.subject or conversation.__str__(),
        is_group=conversation.is_group,
        participants=participants,
        last_message=last_message_resp,
        unread_count=unread_count,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.post("/conversations/{conversation_id}/read", auth=jwt_auth)
def mark_conversation_read(request, conversation_id: int):
    """Mark all messages in a conversation as read"""
    user = request.auth
    
    conversation = get_object_or_404(
        Conversation,
        id=conversation_id,
        participants=user
    )
    
    conversation.mark_read_by(user)
    
    return {"success": True, "marked_count": conversation.messages.filter(is_read=True).count()}


@router.get("/users/search", response=List[UserInfo], auth=jwt_auth)
def search_users(request, q: str):
    """Search for users to start a conversation with"""
    user = request.auth
    
    if len(q) < 2:
        return []
    
    # Search for users
    users = User.objects.filter(
        Q(username__icontains=q) |
        Q(first_name__icontains=q) |
        Q(last_name__icontains=q) |
        Q(email__icontains=q)
    ).exclude(id=user.id)[:10]
    
    # Build response
    user_list = []
    for u in users:
        user_list.append(UserInfo(
            id=u.id,
            username=u.username,
            first_name=u.first_name,
            last_name=u.last_name,
            profile_picture=u.profile_picture.url if u.profile_picture else None,
            user_type=u.user_type,
            is_online=False
        ))
    
    return user_list