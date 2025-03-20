import os
import os.path
import json
import sys
import bpy
"""This script is run by Blender, should take in the paths of param 
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
material_props = []
bpy.ops.wm.open_mainfile(filepath=os.getcwd()+f"\\MLApp\\blender_files\\scene.blend")
mat = bpy.data.materials['mat_name']
nodes = mat.node_tree.nodes
print("Running prop_loader script")
BATCH_SIZE = 20
data = ""

if isinstance(sys.argv[3], str):
      data = sys.argv[3]

      print("Data: ", data)
      if os.path.isfile(data):
            with open(data, 'r+') as file:
                  material_props = json.load(file)
      elif os.path.isfile(data + "\\props\\params.json"):
            with open(data + "\\props\\params.json", 'r+') as file:
                  material_props = list(json.load(file))
      else:
            print("Error: Prop file not found")
      if type(material_props) is list:
            for ind, material_prop in enumerate(material_props):
                  nodes['Principled BSDF'].inputs[0].default_value = material_prop["nodes['Principled BSDF'].inputs[0].default_value"]
                  nodes['Principled BSDF'].inputs[6].default_value = material_prop["nodes['Principled BSDF'].inputs[6].default_value"]
                  nodes['Principled BSDF'].inputs[9].default_value = material_prop["nodes['Principled BSDF'].inputs[9].default_value"]
                  bpy.data.scenes["Scene"].render.filepath = f"{sys.argv[4]}\\{material_prop['name']}.jpg"
                  bpy.ops.render.render(use_viewport = True, write_still=True)
      elif type(material_props) is dict:
            nodes['Principled BSDF'].inputs[0].default_value = material_props["nodes['Principled BSDF'].inputs[0].default_value"]
            nodes['Principled BSDF'].inputs[6].default_value = material_props["nodes['Principled BSDF'].inputs[6].default_value"]
            nodes['Principled BSDF'].inputs[9].default_value = material_props["nodes['Principled BSDF'].inputs[9].default_value"]
            bpy.data.scenes["Scene"].render.filepath = f"{sys.argv[4]}\\{material_props['name']}.jpg"
            bpy.ops.render.render(use_viewport = True, write_still=True)
            
elif isinstance(sys.argv[3], list):
      data = sys.argv[3]
      for ind, pred in enumerate(data):
            nodes['Principled BSDF'].inputs[0].default_value = tuple(data[:4])
            nodes['Principled BSDF'].inputs[6].default_value = data[4]
            nodes['Principled BSDF'].inputs[9].default_value = data[5]
            bpy.data.scenes["Scene"].render.filepath = f"data\\val\\renders\\{ind}.jpg"
            bpy.ops.render.render(use_viewport = True, write_still=True)






