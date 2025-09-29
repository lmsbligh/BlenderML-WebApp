import os
import json
import bpy
import random
import argparse
import sys
print("=== BLENDER SCRIPT ENTRY ===")
sys.stdout.flush()
material_props = []

def parse_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_path", type=str, required=True, help="Path to data")
    parser.add_argument("--scene_props", type=str, help="Scene properties JSON or directory")
    parser.add_argument("--render_path", type=str, help="Directory in which to save renders")
    args, unknown = parser.parse_known_args()
    return args, unknown



def setup_scene(scene_path):
    """
    Sets up scene variables.
    
    Props:  scene_path
    
    Returns:
        - obj: bpy.data.object
        - mat: bpy.data.material
        - mat_nodes: bpy node tree.
    """
    bpy.ops.wm.open_mainfile(filepath=scene_path)
    obj = bpy.data.objects["Cube"]
    env_node = bpy.data.worlds["World"].node_tree.nodes["Environment Texture"]
    mat = bpy.data.materials['mat_name']
    mat_nodes = mat.node_tree.nodes
    return obj, env_node, mat_nodes


def render_loop(obj, env_node, mat_nodes, scene_path, render_path, scene_props):
    """
    Iterates through the material props object, applying the props to the current material then rendering the scene. It saves the file then moves on to the next set of props.
    """
    print("material_props: ", material_props)
    sys.stdout.flush()

    sys.stdout.flush()
    for ind, material_prop in enumerate(material_props):
        mat_nodes['Principled BSDF'].inputs[0].default_value = tuple(material_prop["nodes['Principled BSDF'].inputs[0].default_value"])  # Base Color
        mat_nodes['Principled BSDF'].inputs[1].default_value = float(material_prop["nodes['Principled BSDF'].inputs[1].default_value"])  # Metallic
        mat_nodes['Principled BSDF'].inputs[2].default_value = float(material_prop["nodes['Principled BSDF'].inputs[2].default_value"])  # Roughness
        bpy.data.scenes["Scene"].render.filepath = os.path.join(os.getcwd(), render_path, f"{material_prop['name']}.jpg")
        print("Render Path: ", os.path.join(os.getcwd(), render_path, f"{material_prop['name']}.jpg"))
        bpy.data.scenes["Scene"].render.resolution_x = int(scene_props['imageWidth'])
        bpy.data.scenes["Scene"].render.resolution_y = int(scene_props['imageHeight'])
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


def main():
    global material_props
    args, unknown = parse_arguments()
    print("args.data_path: ", args.data_path)
    sys.stdout.flush()
    print("args.render_path: ", args.render_path)
    sys.stdout.flush()
    print()
    sys.stdout.flush()

    data_path = args.data_path
    render_path = args.render_path if args.render_path else args.data_path
    scene_path = os.path.join(os.getcwd(),"MLApp", "blender_files","scene.blend")
    
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
        
    if os.path.isdir(data_path):
        with open(os.path.join(data_path, "params.json"), 'r+') as file:
            file_data = json.load(file)
            material_props = [file_data] if type(file_data) == dict else file_data
    obj, env_node, mat_nodes = setup_scene(scene_path)
    render_loop(obj, env_node, mat_nodes, scene_path, render_path, scene_props)        

if __name__ == "__main__":
    main()


