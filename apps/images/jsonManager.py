from django.shortcuts import render
import json


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
    dico = {}
    for img, tags in data.items():
        dico[img] = tags

    write_dico_to_json(dico)
    return dico

def printDico(dico):
    print("")
    print("------ dicoooo ------")
    print(json.dumps(dico, indent=4))
    print("---------------------")
    print("")