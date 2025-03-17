import os
import os.path
import json
import numpy as np
import uuid

from MLApp.data_generator.material_node import MaterialNode

def gen_props_json(directory,num=None,props=None):   
    """!Crude implementation! Randomly generates material parameters
    and dumps to JSON file.
    """
    num = int(num)
    num = len(props) if num is None else num
    print("gen_props_json, path: " + directory + "\\props\\params.json")

    file_exists = bool(os.path.isfile(directory + "\\props\\params.json"))
    os.makedirs(os.path.dirname(directory+"\\props\\"), exist_ok=True)
    print(f"file_exists? {file_exists=}")

    with open(directory + "\\props\\params.json", 'w+') as file:    
        # try:
        #     file_data = json.load(file) if file_exists and file.read().strip() else []
        # except json.JSONDecodeError:
        #     file_data = []  # If there's an error, just use an empty dictionary
        file_data = []
        for i in range(num if props is None else len(props)):
            #print(f"{len(props)}")
            nodes = []
            node = MaterialNode(str(uuid.uuid4())[:8])
            node.set_prop({"nodes['Principled BSDF'].inputs[0].default_value" : (tuple(np.random.uniform(0,1,4))) if props is None else tuple(props[i][:4])})#base colour
            node.set_prop({"nodes['Principled BSDF'].inputs[6].default_value" : np.random.uniform(0,1) if props is None else props[i][4]})#metallic
            node.set_prop({"nodes['Principled BSDF'].inputs[9].default_value" : np.random.uniform(0,1) if props is None else props[i][5]})#roughness
            nodes.append(node)
            #node.print_props
            for n in nodes:
                file_data.append(n.get_props())
                #file.seek(0)
            #
            #print("nodes: ", nodes)
        json.dump(file_data, file)
        print("writing to file: " + directory + "\\props\\params.json")
