from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from .models import ImageModel, TagModel
from .utils import clear_all
import json, os
from .jsonManager import write_dico_to_json, parse_json, printDico


dico = {}

#------------------------
#       ADD IMAGES
#------------------------

def add_image_to_db(dico):
    for image, tags in dico.items():
        if ImageModel.objects.filter(title=image).exists():
            print(f"{image} already exists. Skipping...")
            continue

        image_path = os.path.join(settings.MEDIA_ROOT, 'images', image)
        image_model = ImageModel(path=image_path, title=image)

        with open(image_path, 'rb') as file:
            django_file = File(file)
            image_model.image_field.save(image, django_file, save=True)

        image_model.save()

def import_images(request):
    # clear_all()
    dico = parse_json()
    add_image_to_db(dico)
    
    tag_filter = request.GET.get('tag', None)
    if tag_filter:
        images = ImageModel.objects.filter(tags__title=tag_filter)
    else:
        images = ImageModel.objects.all()

    write_dico_to_json(dico)

    context = {
        'dico': json.dumps(dico),
        'images': images,
    }
    return render(request, 'images.html', context)
