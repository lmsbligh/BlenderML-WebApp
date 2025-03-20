import json
import os
def target_loader(directory):
    """Loads material properties from JSON files.

    targets_json : list
        List of raw JSON.
    targets : list
        List of materials, each is a list of floats
        representing material parameters.
    """
    targets_json = []
    targets=[]
    with open(os.path.join(directory, "props", "params.json"), 'r+') as file:

        targets_json = json.load(file)
    
    for material in targets_json:
        targets.append([
            material["name"],
            material["nodes['Principled BSDF'].inputs[0].default_value"][0],
            material["nodes['Principled BSDF'].inputs[0].default_value"][1],
            material["nodes['Principled BSDF'].inputs[0].default_value"][2],
            material["nodes['Principled BSDF'].inputs[0].default_value"][3],
            material["nodes['Principled BSDF'].inputs[6].default_value"],
            material["nodes['Principled BSDF'].inputs[9].default_value"] 
        ])
    return targets