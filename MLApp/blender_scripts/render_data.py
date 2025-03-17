import os
import os.path
import json
import sys
import bpy
import random
import argparse
import math
"""
!!! needs rewriting
This script is run by Blender, should take in the paths of param 
file and render dir which are read from sys.argv. This file
is very crude, it's mostly hardcoded. 

It loads the scene file and all the parameters, then iterates 
through each "material" applying the corresponding parameters 
to the scenes material.
It then renders the scene and saves the image. This was
used to generate the renders for the training and test data
and is also used to render predicted materials to manually 
compare them to test data. 


Variables
---------
!!!! needs rewriting
directory : str
      Retrieves the current working directory and appends
      to it the relevant argv, this allows us to render params
      with only the path to the directory containing param files.

mat : bpy.data.material
      !Currently hardcoded! Stores the material we are
      interested in.

nodes : bpy.types.Nodes
      Collection of Nodes, in this case we are only
      interested in the 'Principled BSDF'
      !may change if I increase functionality!


"""
parser = argparse.ArgumentParser()
parser.add_argument("--data_path", type=str, required=True, help="Path to data")
parser.add_argument("--scene_props", type=str, help="Scene properties JSON or directory")
parser.add_argument("--render_path", type=str, help="Directory in which to save renders")
args, unknown = parser.parse_known_args()

data_path = args.data_path
render_path = args.render_path if args.render_path else args.data_path
scene_props = args.scene_props if args.scene_props else  {
        "description": "",
        "datasetName": '',
        "datasetSize": 10,
        "skyboxPath": '',
        "imageWidth": 250,
        "imageHeight": 250,
        "meshes": {
            "cube": True,
            "sphere": False,
            "monkey": True,
            "car": False
        },
        "randomOrientation": False
    }

if type(scene_props) == str and os.path.isfile(scene_props):
    with open(scene_props, 'r+') as file:
        scene_props = json.load(file)
        
bpy.ops.wm.open_mainfile(filepath=os.getcwd()+f"\\MLApp\\blender_files\\scene.blend")
obj = bpy.data.objects["Cube"]
env_node = bpy.data.worlds["World"].node_tree.nodes["Environment Texture"]
mat = bpy.data.materials['mat_name']
mat_nodes = mat.node_tree.nodes

material_props = []



def render_loop():
    for ind, material_prop in enumerate(material_props):
        mat_nodes['Principled BSDF'].inputs[0].default_value = material_prop["nodes['Principled BSDF'].inputs[0].default_value"]
        mat_nodes['Principled BSDF'].inputs[6].default_value = material_prop["nodes['Principled BSDF'].inputs[6].default_value"]
        mat_nodes['Principled BSDF'].inputs[9].default_value = material_prop["nodes['Principled BSDF'].inputs[9].default_value"]
        bpy.data.scenes["Scene"].render.filepath = os.path.join(os.getcwd(), render_path, f"{material_prop['name']}.jpg")
        print("Render Path: ", os.path.join(os.getcwd(), render_path, f"{material_prop['name']}.jpg"))
        bpy.data.scenes["Scene"].render.resolution_x = scene_props['imageWidth']
        bpy.data.scenes["Scene"].render.resolution_y = scene_props['imageHeight']
        if (scene_props['randomOrientation']):
                obj.location = (random.uniform(-5,5), random.uniform(-5,5), random.uniform(-5,5))
                obj.rotation_euler = ((random.uniform(0,360), random.uniform(0,360), random.uniform(0,360)))
                
                img_ind = int(random.uniform(0, len(bpy.data.images)))
                while (bpy.data.images[img_ind].name == 'Render Result'):
                    img_ind = int(random.uniform(0, len(bpy.data.images)))
                    
                env_node.image = bpy.data.images[img_ind]
                env_node.texture_mapping.rotation = (random.uniform(0,2*3.141), random.uniform(0,2*3.141), random.uniform(0,2*3.141))
                #bpy.ops.scene.light_cache_free()
        bpy.ops.render.render(use_viewport = True, write_still=True)

if os.path.isdir(data_path):
    with open(os.path.join(data_path, "params.json"), 'r+') as file:
        file_data = json.load(file)
        material_props = [file_data] if type(file_data) == dict else file_data

render_loop()        
