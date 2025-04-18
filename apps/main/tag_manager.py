from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST
from .json_manager import parse_json_from_file, write_to_json_file
import json

# Adds new tag to use as a filter from "add-new-tag-button"
@require_POST
def add_new_tag(request: HttpRequest):
    tags = parse_json_from_file('media/tags.json')['tags']

    tag = json.loads(request.body)['tag']
    if (tag and not tag in tags):
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
    for image in images:
        for tag in tags:
            if not tag in dico[image]:
                dico[image].append(tag)
    write_to_json_file(dico, 'media/images.json')
    return JsonResponse({'images': images, 'tags': tags})


