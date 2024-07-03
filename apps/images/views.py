from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from .models import ImageModel, TagModel
from .utils import clear_all
import json, os
from .jsonManager import write_dico_to_json, parse_json, dico, printDico

#------------------------
#       ADD IMAGES
#------------------------


def new_image_to_db(image):
    title = image.split('.')[0]
    
    print(title)
    if ImageModel.objects.filter(title=title).exists():
        print(f"{title} already exists. Skipping...")
        return
    
    image_model = ImageModel(title=title)
    image_path = os.path.join(settings.MEDIA_ROOT, 'images', image)

    with open(image_path, 'rb') as file:
        django_file = File(file)
        image_model.image_field.save(image, django_file, save=True)

    image_model.save()
    
    if image_model.pk is not None:
        dico[image_model.title] = list(image_model.tags.values_list('title', flat=True))
    else:
        print(f"Erreur: {title} n'a pas pu être sauvegardé correctement.")


def save_images_from_json(path):
    with open(path, 'r') as json_file:
        data = json.load(json_file)

    images = data.get('images', [])

    for image in images:
        new_image_to_db(image)

def import_images(request):
    clear_all()
    dico = parse_json()
    # save_images_from_json('media/images.json')
    
    tag_filter = request.GET.get('tag', None)
    print(tag_filter)
    if tag_filter:
        images = ImageModel.objects.filter(tags__title=tag_filter)
    else:
        images = ImageModel.objects.all()

    write_dico_to_json(dico)

    return render(request, 'images.html', {'images': images, 'dico': dico})
