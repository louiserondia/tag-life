from django.shortcuts import render
from django.http import JsonResponse
from .json_manager import write_to_json_file, parse_json_from_file, printDico

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
