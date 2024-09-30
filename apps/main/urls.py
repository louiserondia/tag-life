from django.urls import path
from . import views
from . import tag_manager

urlpatterns = [
    # path('images', views.import_images, name='import_images'),
    path('add_random_tag/<str:imageId>/', tag_manager.add_random_tag, name='add_random_tag'),
    path('', views.import_images, name='import_images'),
     path('api/images/', views.fetch_images, name='fetch_images'),
]
