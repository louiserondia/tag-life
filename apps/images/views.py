import os
from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from .models import ImageModel
from .utils import clear_all
from .jsonManager import write_dico_to_json, parse_json, printDico
from .tagManager import add_tags

def add_image_to_db(dico):
    for image, tags in dico.items():
        image_path = os.path.join(settings.MEDIA_ROOT, 'images', image)

        if ImageModel.objects.filter(title=image).exists() and os.path.exists(image_path):
            print(f"{image} already exists. Skipping...")
            continue
        
        image_model = ImageModel(path=image_path, title=image)

        with open(image_path, 'rb') as file:
            django_file = File(file)
            image_model.image_field.save(image, django_file, save=False)

        image_model.save()
        add_tags(image_model, tags)

def import_images(request):
    # clear_all()
    dico = parse_json()
    add_image_to_db(dico)
    
    tag_filter = request.GET.get('tag', None)
    if tag_filter:
        images = ImageModel.objects.filter(tags__title=tag_filter)
    else:
        images = ImageModel.objects.all()

    # write_dico_to_json(dico)

    context = {
        'images': images,
    }
    return render(request, 'images.html', context)
