from django.contrib import admin
from .models import ImageModel, TagModel

@admin.register(ImageModel)
class ImageModelAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title',)
    list_filter = ('tags',)

@admin.register(TagModel)
class TagModelAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title',)
