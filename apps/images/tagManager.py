from django.http import JsonResponse
from django.views.decorators.http import require_POST
import random
from .jsonManager import parse_json, write_to_json, printDico
from .models import TagModel, ImageModel

def add_tag(image, tag_name):
        tag, created = TagModel.objects.get_or_create(title=tag_name)
        image.tags.add(tag)
        if created:
            tag.save()
        return tag

def add_tags(image, tags):
    tag_list = []
    for tag in tags:
        tag_list.append(add_tag(image, tag))
    return tag_list

@require_POST
def add_random_tag(_, imageId):
    try:
        dico = parse_json('media/images.json')
        image = ImageModel.objects.get(title=imageId)
        random_tag = f"tag{random.randint(1, 10)}"
        if not image.tags.filter(title=random_tag).exists():
            tag = add_tag(image, random_tag)
            dico[image.title].append(tag.title)
            write_to_json(dico, 'media/images.json')
        tags = list(image.tags.values_list('title', flat=True))
        return JsonResponse({'tags': tags})
    except ImageModel.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Image not found'}, status=404)
