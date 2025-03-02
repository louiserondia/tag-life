from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST
from .json_manager import parse_json_from_file, write_to_json_file
from .models import TagModel, ImageModel
import json

# Adds tag to database if not there yet
def add_tag(image, tag_name):
    tag, created = TagModel.objects.get_or_create(title=tag_name)
    if image:
        image.tags.add(tag)
    if created:
        tag.save()
    return tag

def add_tags(image, tags):
    tag_list = []
    for tag in tags:
        tag_list.append(add_tag(image, tag))
    return tag_list

# Adds new tag to use as a filter from "add-new-tag-button"
@require_POST
def add_new_tag(request: HttpRequest):
    tags = TagModel.objects.values_list('title', flat=True)
    tag = json.loads(request.body)['tag']
    if (tag and not tag in tags):  # if new_tag doesn't exist in database yet
        add_tag(None, tag)
        tags = parse_json_from_file('media/tags.json')['tags']
        tags.append(tag)
        write_to_json_file({'tags': tags}, 'media/tags.json')
    return JsonResponse({'tag': tag})

# Adds tag(s) to image(s) from "edit-button"
@require_POST
def add_tag_list_to_image_list(request: HttpRequest):
    body = json.loads(request.body)
    images = body['images']
    tags = body['tags']
    dico = parse_json_from_file('media/images.json')
    for i in images:
        image = ImageModel.objects.get(title=i)
        if (not image):
            print(i)
        else:
            for t in tags:
                if not image.tags.filter(title=t).exists():
                    tag = add_tag(image, t)
                    dico[image.title].append(tag.title)
    write_to_json_file(dico, 'media/images.json')
    return JsonResponse({'images': images, 'tags': tags})


