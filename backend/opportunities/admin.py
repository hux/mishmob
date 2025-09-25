from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.db.models import Q

from .models import (
    OpportunityHost, Opportunity, Role, RoleSkill, 
    Application, ProjectParticipant, CrawlerSource, CrawledOpportunity
)


@admin.register(OpportunityHost)
class OpportunityHostAdmin(admin.ModelAdmin):
    list_display = ['organization_name', 'user', 'is_verified', 'rating_average', 'created_at']
    list_filter = ['is_verified', 'organization_type', 'state']
    search_fields = ['organization_name', 'description', 'website']
    readonly_fields = ['created_at', 'updated_at', 'rating_average', 'rating_count']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'organization_name', 'organization_type', 'tax_id')
        }),
        ('Details', {
            'fields': ('website', 'description', 'logo')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'zip_code')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verified_date')
        }),
        ('Ratings', {
            'fields': ('rating_average', 'rating_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'host', 'status', 'start_date', 'featured', 'view_count', 'is_crawled']
    list_filter = ['status', 'featured', 'is_crawled', 'cause_area', 'is_remote']
    search_fields = ['title', 'description', 'location_name']
    date_hierarchy = 'start_date'
    readonly_fields = ['id', 'slug', 'view_count', 'created_at', 'updated_at', 'published_at']
    
    fieldsets = (
        (None, {
            'fields': ('id', 'host', 'title', 'slug', 'cause_area')
        }),
        ('Description', {
            'fields': ('description', 'impact_statement', 'requirements')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'recurring', 'recurring_schedule', 'time_commitment')
        }),
        ('Location', {
            'fields': ('location_name', 'location_address', 'location_zip', 'is_remote')
        }),
        ('Status', {
            'fields': ('status', 'current_phase', 'featured')
        }),
        ('Crawler Info', {
            'fields': ('is_crawled', 'external_source_url', 'last_verified_date'),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': ('view_count', 'created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('host')


@admin.register(CrawlerSource)
class CrawlerSourceAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'source_type', 'is_active', 'last_crawl_time', 
        'last_crawl_status', 'total_opportunities_found', 'crawler_class'
    ]
    list_filter = ['source_type', 'is_active', 'last_crawl_status']
    search_fields = ['name', 'base_url', 'crawler_class']
    readonly_fields = [
        'last_crawl_time', 'last_crawl_status', 'last_crawl_error',
        'total_opportunities_found', 'total_opportunities_imported',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'source_type', 'base_url', 'crawler_class', 'is_active')
        }),
        ('Configuration', {
            'fields': ('crawl_frequency_hours', 'rate_limit_delay_seconds', 'max_pages_per_crawl'),
        }),
        ('Advanced Configuration', {
            'fields': ('config', 'headers'),
            'classes': ('collapse',),
            'description': 'JSON configuration for crawler-specific settings'
        }),
        ('Crawl Statistics', {
            'fields': (
                'last_crawl_time', 'last_crawl_status', 'last_crawl_error',
                'total_opportunities_found', 'total_opportunities_imported'
            ),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['crawl_now']
    
    def crawl_now(self, request, queryset):
        """Action to trigger immediate crawl"""
        for source in queryset:
            # In a real implementation, this would trigger the crawler
            self.message_user(
                request,
                f"Crawl triggered for {source.name}. Check logs for progress."
            )
    crawl_now.short_description = "Crawl selected sources now"


@admin.register(CrawledOpportunity)
class CrawledOpportunityAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'organization_name', 'source', 'status', 
        'quality_score', 'crawled_at', 'action_buttons'
    ]
    list_filter = [
        'status', 'source', 'quality_score', 
        ('crawled_at', admin.DateFieldListFilter),
        'is_remote'
    ]
    search_fields = ['title', 'organization_name', 'description', 'source_url']
    readonly_fields = [
        'source_url', 'external_id', 'crawled_at', 'reviewed_at', 
        'reviewed_by', 'quality_score', 'raw_data_pretty'
    ]
    date_hierarchy = 'crawled_at'
    
    fieldsets = (
        (None, {
            'fields': ('source', 'source_url', 'external_id', 'status')
        }),
        ('Extracted Information', {
            'fields': (
                'title', 'organization_name', 'organization_url', 'description',
                'location_text', 'city', 'state', 'zip_code', 'is_remote'
            )
        }),
        ('Time Information', {
            'fields': (
                'start_date_text', 'end_date_text', 'parsed_start_date', 
                'parsed_end_date', 'is_ongoing', 'time_commitment_text'
            ),
            'classes': ('collapse',)
        }),
        ('Additional Details', {
            'fields': ('skills_text', 'cause_areas_text'),
            'classes': ('collapse',)
        }),
        ('Quality & Validation', {
            'fields': ('quality_score', 'validation_errors'),
        }),
        ('Import Information', {
            'fields': ('imported_opportunity', 'duplicate_of'),
            'classes': ('collapse',)
        }),
        ('Review Information', {
            'fields': ('crawled_at', 'reviewed_at', 'reviewed_by'),
        }),
        ('Raw Data', {
            'fields': ('raw_data_pretty',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_opportunities', 'reject_opportunities', 'mark_as_duplicate']
    
    def raw_data_pretty(self, obj):
        """Pretty print raw JSON data"""
        import json
        return format_html(
            '<pre style="width: 600px; overflow-x: auto;">{}</pre>',
            json.dumps(obj.raw_data, indent=2)
        )
    raw_data_pretty.short_description = 'Raw Data (JSON)'
    
    def action_buttons(self, obj):
        """Action buttons for quick review"""
        if obj.status == 'pending':
            return format_html(
                '<a class="button" href="{}">Review</a>',
                reverse('admin:opportunities_crawledopportunity_change', args=[obj.pk])
            )
        elif obj.status == 'approved':
            return format_html('<span style="color: green;">✓ Approved</span>')
        elif obj.status == 'rejected':
            return format_html('<span style="color: red;">✗ Rejected</span>')
        elif obj.status == 'duplicate':
            return format_html('<span style="color: orange;">⚠ Duplicate</span>')
        else:
            return obj.status
    action_buttons.short_description = 'Actions'
    action_buttons.allow_tags = True
    
    def approve_opportunities(self, request, queryset):
        """Approve selected opportunities"""
        count = queryset.filter(status='pending').update(
            status='approved',
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f"{count} opportunities approved.")
    approve_opportunities.short_description = "Approve selected opportunities"
    
    def reject_opportunities(self, request, queryset):
        """Reject selected opportunities"""
        count = queryset.filter(status='pending').update(
            status='rejected',
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f"{count} opportunities rejected.")
    reject_opportunities.short_description = "Reject selected opportunities"
    
    def mark_as_duplicate(self, request, queryset):
        """Mark selected opportunities as duplicate"""
        count = queryset.filter(status='pending').update(
            status='duplicate',
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f"{count} opportunities marked as duplicate.")
    mark_as_duplicate.short_description = "Mark as duplicate"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'source', 'imported_opportunity', 'reviewed_by'
        )
    
    def has_import_permission(self, request, obj=None):
        """Check if user can import opportunities"""
        return request.user.is_superuser or request.user.groups.filter(
            name='Opportunity Reviewers'
        ).exists()


# Also register other existing models
admin.site.register(Role)
admin.site.register(RoleSkill)
admin.site.register(Application)
admin.site.register(ProjectParticipant)