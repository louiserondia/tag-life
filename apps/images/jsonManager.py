import json

def write_to_json(content, file):
    with (open(file, 'w') as file):
        json.dump(content, file, indent=4)

def parse_json(file):
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