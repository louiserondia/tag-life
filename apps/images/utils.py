import json, os
from django.conf import settings
from .models import ImageModel, TagModel

def clear_all():
    ImageModel.objects.all().delete()
    TagModel.objects.all().delete()

def printMap(bmap):
    print("BigMap Contents:")
    for image, tags in bmap.data.items():
        print(f"Image: {image.title}")
        print("Tags:")
        for tag in tags:
            print(f" - {tag.title}")
        print("-" * 20) 

def uploadBmapToJSON(bmap):
    bmap_dict = {
        # Assurez-vous que key.pk et tag.pk sont des valeurs valides pour JSON
        str(key.pk): [tag.pk for tag in tags]  
        for key, tags in bmap.data.items()
    }

    # Écrire les données JSON dans un fichier
    json_file_path = os.path.join(settings.MEDIA_ROOT, 'bmap.json')

    with open(json_file_path, 'w') as json_file:
        json.dump(bmap_dict, json_file, indent=4)

    print(f"BigMap a été sauvegardé dans {json_file_path}")