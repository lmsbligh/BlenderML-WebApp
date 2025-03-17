import os
import os.path
import json
import numpy as np
import uuid
#BATCH_SIZE = 20

#directory= r"blender_files"
class material_node:
    """Basic object representation of a material node.

    name : str
        Stores unique material name, useful for writing material
        to JSON file. !!Redundant? Certainly can be made
        cleaner.!! This whole class needs reworking, naming is
        not consistent with the rest of the project.!!
    
    props : dict
        Dictionary that stores the parameters/properties
        of the material node.
    """
    def __init__(self, i):
        self.name = f"material_node_{i}_props"
        self.props = {"name" : i}
        
        
    def set_prop(self, prop):
        """Self explanatory, sets property value
        """
        self.props.update(prop)
    def get_props(self) -> dict:
        """Returns props.props"""
        return self.props
    def print_props(self):
        """Prints props"""
        print(f"{self.props=}")
 
    
class material:
    """Actual representation of a material; a list of material nodes."""
    def __init__(self):
        self.nodes = []
    def add_node(self, node_type):
        self.nodes.append(material_node())
    def get_nodes(self):
        return self.nodes


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
            node = material_node(str(uuid.uuid4())[:8])
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
    

def write_props_json(directory, mats):
    """Writes predicted material properties to a JSON file.
    """
    file_exists = bool(os.path.isfile(directory + "\\props\\params.json"))
    os.makedirs(os.path.dirname(directory+"\\props\\"), exist_ok=True)
    print(f"{file_exists=}")

    with open(directory + "\\props\\params.json", 'r+' if file_exists else 'w+') as file:
        file_data = json.load(file) if file_exists else {}
        nodes = []
        for i, mat in enumerate(mats):
            #print(f"{len(props)}")
            node = material_node(i)
            node.set_prop({"nodes['Principled BSDF'].inputs[0].default_value" : tuple(mat[:4])})#base colour
            node.set_prop({"nodes['Principled BSDF'].inputs[6].default_value" : mat[4]})#metallic
            node.set_prop({"nodes['Principled BSDF'].inputs[9].default_value" : mat[5]})#roughness
            nodes.append(node)
            for n in nodes:
                file_data.update(n.get_props())
                file.seek(0)
        json.dump(file_data, file)