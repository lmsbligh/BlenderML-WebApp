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
    props_dir = os.path.join(directory, "props")
    params_path = os.path.join(props_dir, "params.json")
    #print("gen_props_json, path: " + directory + "\\props\\params.json")
    print("gen_props_json, path: " + params_path)

    file_exists = os.path.isfile(params_path)
    os.makedirs(props_dir, exist_ok=True)
    print(f"file_exists? {file_exists=}")

    with open(params_path, 'w+') as file:    
        file_data = []
        for i in range(num if props is None else len(props)):
            nodes = []
            node = MaterialNode(str(uuid.uuid4())[:8])
            node.set_prop({"nodes['Principled BSDF'].inputs[0].default_value" : (tuple(np.random.uniform(0,1,4))) if props is None else tuple(props[i][:4])})#base colour
            node.set_prop({"nodes['Principled BSDF'].inputs[1].default_value" : np.random.uniform(0,1) if props is None else props[i][4]})#metallic
            node.set_prop({"nodes['Principled BSDF'].inputs[2].default_value" : np.random.uniform(0,1) if props is None else props[i][5]})#roughness
            nodes.append(node)
            for n in nodes:
                file_data.append(n.get_props())

        json.dump(file_data, file)
        print("writing to file: " + params_path)
