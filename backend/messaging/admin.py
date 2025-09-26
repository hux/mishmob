from django.contrib import admin
from .models import Conversation, Message, MessageReadStatus, ConversationRequest


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'is_group', 'created_at', 'updated_at', 'participant_count']
    list_filter = ['is_group', 'created_at', 'updated_at']
    search_fields = ['subject', 'participants__username', 'participants__email']
    date_hierarchy = 'created_at'
    
    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'content_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['content', 'sender__username', 'sender__email']
    date_hierarchy = 'created_at'
    raw_id_fields = ['conversation', 'sender']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'user', 'last_read_at']
    list_filter = ['last_read_at']
    raw_id_fields = ['conversation', 'user', 'last_read_message']
    date_hierarchy = 'last_read_at'


@admin.register(ConversationRequest)
class ConversationRequestAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'status', 'created_at', 'responded_at']
    list_filter = ['status', 'created_at']
    search_fields = ['from_user__username', 'to_user__username', 'message']
    date_hierarchy = 'created_at'
    raw_id_fields = ['from_user', 'to_user']