from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.postgres.indexes import GinIndex
from django.db.models import Q


class Conversation(models.Model):
    """Represents a conversation between two or more users"""
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subject = models.CharField(max_length=255, blank=True)
    is_group = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['-updated_at']),
        ]
    
    def __str__(self):
        if self.subject:
            return self.subject
        participants = self.participants.all()[:3]
        names = [p.get_full_name() or p.username for p in participants]
        return ', '.join(names)
    
    def get_other_participant(self, user):
        """For 1-on-1 conversations, get the other participant"""
        if not self.is_group:
            return self.participants.exclude(id=user.id).first()
        return None
    
    def mark_read_by(self, user):
        """Mark all messages in conversation as read by user"""
        self.messages.filter(is_read=False).exclude(sender=user).update(
            is_read=True,
            read_at=timezone.now()
        )


class Message(models.Model):
    """Represents a single message in a conversation"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Optional fields for rich messaging
    attachment = models.FileField(
        upload_to='message_attachments/',
        null=True,
        blank=True
    )
    attachment_name = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
            # GinIndex requires pg_trgm extension for text fields
        ]
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."


class MessageReadStatus(models.Model):
    """Track read status for each participant in a conversation"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='read_statuses'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='message_read_statuses'
    )
    last_read_message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    last_read_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['conversation', 'user']
        indexes = [
            models.Index(fields=['user', '-last_read_at']),
        ]


class ConversationRequest(models.Model):
    """For handling message requests from non-connected users"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('spam', 'Spam'),
    ]
    
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_requests'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_requests'
    )
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['from_user', 'to_user']
        indexes = [
            models.Index(fields=['to_user', 'status', '-created_at']),
        ]