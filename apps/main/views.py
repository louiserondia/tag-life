import os, json
from django.shortcuts import render
from django.core.files import File
from django.conf import settings
from django.http import JsonResponse
from .models import ImageModel, TagModel
from .utils import clear_all
from .json_manager import write_to_json, parse_json, printDico, format_images_to_json
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
        # ça pose pas un problème si je supprime un tag 
        # qui permet de faire le tri mais qui n'est dans aucune image ?


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

def fetch_images(request):
    checked_tags = request.GET.getlist('tag')
    images = ImageModel.objects.all()

    if checked_tags:
        for tag in checked_tags:
            images = images.filter(tags__title__icontains=tag).distinct()
    images = format_images_to_json(images)
    return JsonResponse({'images': images})

def initiate_database():
    # clear_all()
    dico = parse_json('media/images.json')
    tags = parse_json('media/tags.json')['tags']
    add_image_to_db(dico)
    delete_missing_images_tags(dico)
    return {'tags' : tags,  'dico' : dico}

def import_images(request):
    data = initiate_database()
    
    checked_tags = set(request.GET.getlist('tag')) or set()
    new_tag = request.GET.get('new_tag', None)
    if new_tag:
        if not data['tags'].count(new_tag):  # if new_tag doesn't exist in database yet
            tag, created = TagModel.objects.get_or_create(title=new_tag)
            if created:
                data['tags'].append(new_tag)
                write_to_json({'tags': data['tags']}, 'media/tags.json')
            checked_tags.add(new_tag)
    images = ImageModel.objects.all()

    if len(checked_tags):
        for tag in checked_tags:
            images = images.filter(tags__title__icontains=tag)

    images_json = format_images_to_json(images)
    context = { 'images': images, 
               'images_json': json.dumps(images_json),
               'tags': data['tags'], 
               'checked_tags': json.dumps(list(checked_tags)) }
    return render(request, 'home.html', context)