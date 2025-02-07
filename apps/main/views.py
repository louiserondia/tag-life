import os, json
from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from django.http import JsonResponse
from .models import ImageModel, TagModel
from .utils import clear_all
from .json_manager import write_to_json_file, parse_json_from_file, printDico, format_images_to_json
from .tag_manager import add_tags

def delete_missing_images_tags(dico):
    for image in ImageModel.objects.all():
        if image.title not in dico:
            image.delete()
        else:
            for tag in image.tags.all():
                if tag.title not in dico[image.title]:
                    image.tags.remove(tag)
    for tag in TagModel.objects.all():
        if tag.images.count() == 0:
            tag.delete()

def add_image_to_db(dico):
    for image, tags in dico.items():
        src_path = os.path.join(settings.MEDIA_ROOT, 'images', image)
        upload_path = os.path.join(settings.MEDIA_ROOT, 'uploads', image)
        if ImageModel.objects.filter(title=image).exists() and os.path.exists(upload_path):
            image_model = ImageModel.objects.get(title=image)
            add_tags(image_model, tags)
            continue
        
        upload_path = settings.MEDIA_URL + 'uploads/' + image;
        image_model = ImageModel(src_path=src_path, upload_path=upload_path, title=image)

        with open(src_path, 'rb') as file:
            django_file = File(file)
            image_model.image_field.save(image, django_file, save=False)

        image_model.save()
        add_tags(image_model, tags)

# Clears, update images in db from json and update tags.json
def initiate_database():
    clear_all()
    dico = parse_json_from_file('media/images.json')
    tags = set()
    for tag in dico.values():
        tags.update(tag)
    write_to_json_file({'tags': list(tags)}, 'media/tags.json')
    add_image_to_db(dico)
    # delete_missing_images_tags(dico)
    return tags, dico


# Send all images to frontend formated to json
def fetch_images_data(_):
    images = ImageModel.objects.all()
    return JsonResponse({
        'images_data': format_images_to_json(images),
    })

# Sends images filtered by tag(s)
def fetch_images(request):
    checked_tags = request.GET.getlist('tag')
    images = ImageModel.objects.all()

    if checked_tags:
        for tag in checked_tags:
            images = images.filter(tags__title=tag).distinct()
    images = format_images_to_json(images)
    return JsonResponse({'images': images})

# uncomment line 1 and comment line 2 to initiate database, 
def images(request):
    tags, dico = initiate_database()
    tags = TagModel.objects.values_list('title', flat=True)
    
    checked_tags = set(request.GET.getlist('tag')) or set()
    images = ImageModel.objects.all()

    if len(checked_tags):
        for tag in checked_tags:
            images = images.filter(tags__title=tag)

    context = { 'tags': tags,
               'checked_tags': json.dumps(list(checked_tags)) }
    return render(request, 'images.html', context)


def home(request):
    return render(request, 'home.html')
