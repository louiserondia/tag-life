from django.shortcuts import render
import json

dico = {}

#------------------
#   PARSE JSON
#------------------

def write_dico_to_json(dico):
    json_file = "media/res.json"
    with (open(json_file, 'w') as file):
        json.dump(dico, file, indent=4)

def parse_json():
    with open('media/test.json', 'r') as json_file:
        data = json.load(json_file)

    for img, tags in data.items():
        dico[img] = tags

    write_dico_to_json(dico)
    printDico()
    return dico
    # return render(request, 'test.html', {'dico': res})

def printDico():
    print(json.dumps(dico, indent=4))