from django.urls import path
from . import views
from . import tag_manager

urlpatterns = [
    path('', views.home, name='home'),
    path('add_new_tag/', tag_manager.add_new_tag, name='add_new_tag'),
    path('add_tag_list_to_image_list/', tag_manager.add_tag_list_to_image_list, name='add_tag_list_to_image_list'),
    path('api/images/', views.fetch_images, name='fetch_images'),
    path('api/images_data/', views.fetch_images_data, name='fetch_images_data'),
]
