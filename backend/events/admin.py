from django.contrib import admin
from django.utils import timezone
from django.db.models import Count, Q
from .models import Event, EventTicket, DeviceRegistration, CheckIn


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'opportunity_title',
        'check_in_status',
        'attendee_count',
        'max_attendees',
        'check_in_opens_at',
        'check_in_closes_at',
        'created_at'
    ]
    list_filter = [
        'require_device_registration',
        'allow_multiple_devices',
        'check_in_opens_at',
    ]
    search_fields = [
        'opportunity__title',
        'opportunity__host__organization_name',
    ]
    readonly_fields = ['created_at', 'updated_at', 'get_checked_in_count']
    
    fieldsets = (
        ('Event Details', {
            'fields': ('opportunity', 'max_attendees')
        }),
        ('Check-in Settings', {
            'fields': (
                'check_in_opens_at',
                'check_in_closes_at',
                'allow_early_check_in_minutes',
                'allow_late_check_in_minutes',
            )
        }),
        ('Security Settings', {
            'fields': (
                'require_device_registration',
                'allow_multiple_devices',
                'qr_rotation_seconds',
            )
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'get_checked_in_count'),
            'classes': ('collapse',)
        }),
    )
    
    def opportunity_title(self, obj):
        return obj.opportunity.title
    opportunity_title.short_description = 'Event'
    opportunity_title.admin_order_field = 'opportunity__title'
    
    def check_in_status(self, obj):
        if obj.is_check_in_open():
            return '🟢 Open'
        elif timezone.now() < obj.check_in_opens_at:
            return '🟡 Not Open Yet'
        else:
            return '🔴 Closed'
    check_in_status.short_description = 'Check-in Status'
    
    def attendee_count(self, obj):
        total = obj.tickets.filter(status='active').count()
        checked_in = obj.get_checked_in_count()
        return f"{checked_in}/{total}"
    attendee_count.short_description = 'Attendance'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('opportunity')


@admin.register(EventTicket)
class EventTicketAdmin(admin.ModelAdmin):
    list_display = [
        'ticket_id_short',
        'user_name',
        'event_title',
        'status',
        'is_checked_in',
        'checked_in_at',
        'registered_at',
    ]
    list_filter = [
        'status',
        ('checked_in_at', admin.EmptyFieldListFilter),
        'event',
        'registered_at',
    ]
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'event__opportunity__title',
        'id',
    ]
    readonly_fields = [
        'id',
        'server_token',
        'registered_at',
        'checked_in_at',
        'check_in_device',
        'checked_in_by',
    ]
    raw_id_fields = ['user', 'event', 'registered_device']
    
    actions = ['mark_as_cancelled', 'mark_as_active']
    
    fieldsets = (
        ('Ticket Information', {
            'fields': ('id', 'event', 'user', 'status')
        }),
        ('Registration Details', {
            'fields': ('registered_at', 'registered_device')
        }),
        ('Check-in Details', {
            'fields': ('checked_in_at', 'check_in_device', 'checked_in_by'),
            'classes': ('collapse',)
        }),
        ('Security', {
            'fields': ('server_token',),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    
    def ticket_id_short(self, obj):
        return str(obj.id)[:8]
    ticket_id_short.short_description = 'Ticket ID'
    
    def user_name(self, obj):
        return f"{obj.user.get_full_name() or obj.user.username}"
    user_name.short_description = 'Attendee'
    user_name.admin_order_field = 'user__username'
    
    def event_title(self, obj):
        return obj.event.opportunity.title
    event_title.short_description = 'Event'
    event_title.admin_order_field = 'event__opportunity__title'
    
    def is_checked_in(self, obj):
        return '✓' if obj.checked_in_at else '✗'
    is_checked_in.short_description = 'Checked In'
    is_checked_in.admin_order_field = 'checked_in_at'
    
    def mark_as_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
        self.message_user(request, f"{queryset.count()} tickets marked as cancelled.")
    mark_as_cancelled.short_description = "Mark selected tickets as cancelled"
    
    def mark_as_active(self, request, queryset):
        queryset.update(status='active')
        self.message_user(request, f"{queryset.count()} tickets marked as active.")
    mark_as_active.short_description = "Mark selected tickets as active"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'event__opportunity',
            'user',
            'registered_device',
            'checked_in_by'
        )


@admin.register(DeviceRegistration)
class DeviceRegistrationAdmin(admin.ModelAdmin):
    list_display = [
        'user_name',
        'device_name',
        'device_type',
        'is_trusted',
        'is_active',
        'registered_at',
        'last_seen_at',
    ]
    list_filter = [
        'device_type',
        'is_trusted',
        'is_active',
        'registered_at',
    ]
    search_fields = [
        'user__username',
        'user__email',
        'device_name',
    ]
    readonly_fields = [
        'id',
        'device_fingerprint_hash',
        'registered_at',
        'last_seen_at',
    ]
    raw_id_fields = ['user']
    
    actions = ['mark_as_trusted', 'mark_as_untrusted', 'deactivate_devices']
    
    def user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    user_name.short_description = 'User'
    user_name.admin_order_field = 'user__username'
    
    def mark_as_trusted(self, request, queryset):
        queryset.update(is_trusted=True, trust_established_at=timezone.now())
        self.message_user(request, f"{queryset.count()} devices marked as trusted.")
    mark_as_trusted.short_description = "Mark selected devices as trusted"
    
    def mark_as_untrusted(self, request, queryset):
        queryset.update(is_trusted=False, trust_established_at=None)
        self.message_user(request, f"{queryset.count()} devices marked as untrusted.")
    mark_as_untrusted.short_description = "Mark selected devices as untrusted"
    
    def deactivate_devices(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} devices deactivated.")
    deactivate_devices.short_description = "Deactivate selected devices"


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = [
        'created_at',
        'event_title',
        'result',
        'scanner_name',
        'ticket_user',
        'ip_address',
    ]
    list_filter = [
        'result',
        'created_at',
        'event',
    ]
    search_fields = [
        'event__opportunity__title',
        'scanner_user__username',
        'ticket__user__username',
        'ticket__user__email',
        'ip_address',
    ]
    readonly_fields = [
        'id',
        'created_at',
        'scanned_data',
        'result_message',
        'latitude',
        'longitude',
        'user_agent',
    ]
    raw_id_fields = ['scanner_user', 'scanner_device', 'ticket', 'event']
    
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Check-in Information', {
            'fields': ('id', 'created_at', 'event', 'result', 'result_message')
        }),
        ('Scanner Details', {
            'fields': ('scanner_user', 'scanner_device')
        }),
        ('Ticket Details', {
            'fields': ('ticket', 'scanned_data'),
        }),
        ('Location & Metadata', {
            'fields': ('latitude', 'longitude', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    def event_title(self, obj):
        return obj.event.opportunity.title
    event_title.short_description = 'Event'
    event_title.admin_order_field = 'event__opportunity__title'
    
    def scanner_name(self, obj):
        if obj.scanner_user:
            return obj.scanner_user.get_full_name() or obj.scanner_user.username
        return 'Unknown'
    scanner_name.short_description = 'Scanner'
    scanner_name.admin_order_field = 'scanner_user__username'
    
    def ticket_user(self, obj):
        if obj.ticket:
            return obj.ticket.user.get_full_name() or obj.ticket.user.username
        return 'N/A'
    ticket_user.short_description = 'Attendee'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'event__opportunity',
            'scanner_user',
            'ticket__user'
        )
    
    def has_add_permission(self, request):
        # Check-ins are created automatically, not manually
        return False
    
    def has_change_permission(self, request, obj=None):
        # Check-ins are immutable audit logs
        return False