from django.urls import path
from . import views
from . import jsonManager
from . import tagManager

urlpatterns = [
    path('', views.import_images, name='import_images'),
    path('add_random_tag/<str:imageId>/', tagManager.add_random_tag, name='add_random_tag'),
]
