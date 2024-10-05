import json
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse

def write_to_json_file(content, file):
    with (open(file, 'w') as file):
        json.dump(content, file, indent=4)

def parse_json_from_file(file):
    m = {}
    with open(file, 'r') as json_file:
        m = json.load(json_file)
    return m

def printDico(dico):
    print("")
    print("------ dicoooo ------")
    print(json.dumps(dico, indent=4))
    print("---------------------")
    print("")
    
def format_images_to_json(images):    
    data = []
    
    for image in images:
        tags = [tag.title for tag in image.tags.all()]
        image_data = {
            'title': image.title,
            'path': image.upload_path,
            'tags': tags
        }
        data.append(image_data)
    return data