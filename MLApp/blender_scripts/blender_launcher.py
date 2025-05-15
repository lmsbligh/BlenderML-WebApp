import subprocess
from MLApp.parameters import blender_executable
import os
import time

def launch_blender(data="train", script="", scene_props="", render_dir=""):
    """
    Simple function to launch blender passing in data_dir and a script
    as argv.

    data_dir : str
        Location of the directory containing material parameters.

    script : str
        Location of the script to run in Blender on launch.

    """
    script_path = os.path.join(os.getcwd(), script)
    print("script_path:", script_path)
    data_path = os.path.join(os.getcwd(), data)
    print("data_path:", data_path)
    print("!!!render_dir: ", render_dir)

    command = []
    if (scene_props):    
        command = [blender_executable, "-P", script_path] + ["--data_path", data_path] + ["--scene_props", scene_props] + [ "--render_path", render_dir]
            
    else:
        command = [blender_executable, "-P", script_path] + [ "--data_path", data_path] + [ "--render_path", render_dir]
            

    # Run the command using subprocess
    try:
        print(subprocess.run(command, check=True))
        print("Blender script executed successfully.")
    except subprocess.CalledProcessError as e:
        print("Error running Blender script:", e)
          
    sample_scandir = os.scandir(render_dir)
    sample_URLs = []
    for file in sample_scandir:
            sample_URLs.append(f"{render_dir}\\{file.name}".replace("\\", "/"))
    if len(sample_URLs) > 9:
        return sample_URLs[:9]
    elif len(sample_URLs) >= 1:
        return sample_URLs[0]
    else:
        return "null"