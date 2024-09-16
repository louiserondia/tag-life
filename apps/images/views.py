import os
from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from django.db.models import Q
from .models import ImageModel, TagModel
from .utils import clear_all
from .jsonManager import write_to_json, parse_json, printDico
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
        # ça pose pas un problème si je supprime un tag 
        # qui permet de faire le tri mais qui n'est dans aucune image ?


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
    print(request)
    # clear_all()
    dico = parse_json('media/images.json')
    tags = parse_json('media/tags.json')['tags']
    add_image_to_db(dico)
    delete_missing_images_tags(dico)
    
    checked_tags = request.GET.getlist('checked_tags')
    custom_tag = request.GET.get('new_tag', None)
    if custom_tag:
        if not tags.count(custom_tag):
            tag, created = TagModel.objects.get_or_create(title=custom_tag)
            if created:
                tags.append(custom_tag)
                write_to_json({'tags': tags}, 'media/tags.json')
        checked_tags.append(custom_tag)
    images = ImageModel.objects.all()

    if checked_tags:
        for tag in checked_tags:
            images = images.filter(tags__title__icontains=tag).distinct()
    print(images)
    context = { 'images': images, 'tags': tags, 'checked_tags': checked_tags }
    return render(request, 'images.html', context)