import json

def write_dico_to_json(dico):
    json_file = "media/images.json"
    with (open(json_file, 'w') as file):
        json.dump(dico, file, indent=4)

def parse_json():
    dico = {}
    with open('media/images.json', 'r') as json_file:
        dico = json.load(json_file)
    return dico

def printDico(dico):
    print("")
    print("------ dicoooo ------")
    print(json.dumps(dico, indent=4))
    print("---------------------")
    print("")