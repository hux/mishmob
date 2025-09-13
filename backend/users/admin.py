from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Skill, UserSkill


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_verified', 'created_at']
    list_filter = ['user_type', 'is_verified', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    inlines = [UserProfileInline]
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('MishMob Fields', {
            'fields': ('user_type', 'profile_picture', 'zip_code', 'is_verified')
        }),
    )


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'proficiency_level', 'is_verified', 'created_at']
    list_filter = ['proficiency_level', 'is_verified']
    search_fields = ['user__username', 'skill__name']
    raw_id_fields = ['user', 'skill', 'verified_by']
