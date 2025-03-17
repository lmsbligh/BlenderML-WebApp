import os
import os.path
import json
import sys
import bpy
import random
import math
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
scene_props = {}
#fp = os.getcwd()+f"\\blender_files\\scene.blend"
#print(f"{fp=}")
bpy.ops.wm.open_mainfile(filepath=os.getcwd()+f"\\MLApp\\blender_files\\scene.blend")
mat = bpy.data.materials['mat_name']
nodes = mat.node_tree.nodes
print("Running prop_loader script")
BATCH_SIZE = 20
data = ""
obj = bpy.data.objects["Cube"]
env_node = bpy.data.worlds["World"].node_tree.nodes["Environment Texture"]
render_dir = ""
if isinstance(sys.argv[3], str):
      print("render_data os.getcwd(): ", os.getcwd())
      #data = os.getcwd()+"\\"+sys.argv[3]
      data = sys.argv[3]
      print("Data: ", data)
      if os.path.isfile(data):
            print("true")
            with open(data, 'r+') as file:
                  material_props = json.load(file)
      elif os.path.isfile(data + "\\props\\params.json"):
            print("true")
            with open(data + "\\props\\params.json", 'r+') as file:
                  material_props = list(json.load(file))
      else:
            print("Error: Prop file not found")
      if (os.path.isfile(sys.argv[4])):
            scene_props_path = sys.argv[4]
      else:
            render_dir = sys.argv[4]
      if os.path.isfile(scene_props_path):
            print("true")
            with open(scene_props_path, 'r+') as file:
                  scene_props = json.load(file)
      else:
            print("Error: Prop file not found")
      print("scene_props: ", scene_props)
      print("render_dir: ", render_dir)
      if type(material_props) is list:
            for ind, material_prop in enumerate(material_props):
                  nodes['Principled BSDF'].inputs[0].default_value = material_prop["nodes['Principled BSDF'].inputs[0].default_value"]
                  nodes['Principled BSDF'].inputs[6].default_value = material_prop["nodes['Principled BSDF'].inputs[6].default_value"]
                  nodes['Principled BSDF'].inputs[9].default_value = material_prop["nodes['Principled BSDF'].inputs[9].default_value"]
                  bpy.data.scenes["Scene"].render.filepath = f"{os.getcwd()}\\{scene_props['renderDir'] if not render_dir else render_dir}\\{material_prop['name']}.jpg"
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
      elif type(material_props) is dict:
            nodes['Principled BSDF'].inputs[0].default_value = material_props["nodes['Principled BSDF'].inputs[0].default_value"]
            nodes['Principled BSDF'].inputs[6].default_value = material_props["nodes['Principled BSDF'].inputs[6].default_value"]
            nodes['Principled BSDF'].inputs[9].default_value = material_props["nodes['Principled BSDF'].inputs[9].default_value"]
            bpy.data.scenes["Scene"].render.filepath = f"{os.getcwd()}\\{scene_props['renderDir'] if not render_dir else render_dir}\\{material_props['name']}.jpg"
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
            
elif isinstance(sys.argv[3], list):
      data = sys.argv[3]
      for ind, pred in enumerate(data):
            nodes['Principled BSDF'].inputs[0].default_value = tuple(data[:4])
            nodes['Principled BSDF'].inputs[6].default_value = data[4]
            nodes['Principled BSDF'].inputs[9].default_value = data[5]
            bpy.data.scenes["Scene"].render.filepath = f"data\\val\\renders\\{ind}.jpg"
            bpy.ops.render.render(use_viewport = True, write_still=True)

print(f"{data=}")





