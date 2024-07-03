import os
from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from .models import ImageModel, TagModel
from .utils import clear_all
from .jsonManager import write_dico_to_json, parse_json, printDico
from .tagManager import add_tags

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
        image_path = os.path.join(settings.MEDIA_ROOT, 'images', image)
        image_path_dest = os.path.join(settings.MEDIA_ROOT, 'uploads', image)
        if ImageModel.objects.filter(title=image).exists() and os.path.exists(image_path_dest):
            image_model = ImageModel.objects.get(title=image)
            add_tags(image_model, tags)
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
    delete_missing_images_tags(dico)
    
    tag_filter = request.GET.get('tag', None)
    if tag_filter:
        images = ImageModel.objects.filter(tags__title__istartswith=tag_filter).distinct()
    else:
        images = ImageModel.objects.all()

    context = { 'images': images }
    return render(request, 'images.html', context)
