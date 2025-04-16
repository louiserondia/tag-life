import os
import json
from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from django.http import JsonResponse
from .models import ImageModel, TagModel
from .utils import clear_all
from .json_manager import write_to_json_file, parse_json_from_file, printDico, format_images_to_json
from .tag_manager import add_tags

# Send all images to frontend formated to json


def fetch_images_data(_):
    return JsonResponse(parse_json_from_file('media/images.json'))

# Sends images filtered by tag(s)


def fetch_images(request):
    checked_tags = request.GET.getlist('tag')
    images = parse_json_from_file('media/images.json')

    selecta = []
    for k, v in images.items():
        if all(e in v for e in checked_tags):
            selecta.append(k)
            
    return JsonResponse({'images': selecta})


def images(request):
    tags = parse_json_from_file('media/tags.json')['tags']
    checked_tags = set(request.GET.getlist('tag')) or set()
    return render(request, 'images.html', locals())


def home(request):
    return render(request, 'home.html')


def webcam(request):
    return render(request, 'webcam.html')


def projection(request):
    return render(request, 'projection.html')
