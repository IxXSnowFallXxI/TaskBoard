from django.contrib import admin
from .models import custom_user
@admin.register(custom_user)
class custom_user_admin(admin.ModelAdmin):
    list_display = ('username', 'score', 'level', 'is_active')
    search_fields = ('username',)
    list_filter = ("is_active", "level",)    
# Register your models here.
