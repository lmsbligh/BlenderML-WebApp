import subprocess
from MLApp.parameters import blender_executable
import os
import time

def launch_blender(data="train", script="", scene_props="", render_dir=""):
    """Simple function to launch blender passing in data_dir and a script
    as argv.

    data_dir : str
        Location of the directory containing material parameters.

    script : str
        Location of the script to run in Blender on launch.

    """
    print("launch_blender os.getcwd(): ", os.getcwd())
    script_path = f"{os.getcwd()}"+ script
    # unique_path_component = f"\\{data}\\renders\\render-{time.strftime('%d-%m-%Y-%H%M-%S')}"
    # unique_path_component = data
    scene_props = f"{os.getcwd()}\\{data}" if not scene_props else scene_props
    command = [blender_executable, "-P", script_path] + [os.getcwd() + "\\" + data] + [scene_props if scene_props else render_dir]
    print(f"{command=}")
    # Run the command using subprocess
    try:
        print(subprocess.run(command, check=True))
        print("Blender script executed successfully.")
    except subprocess.CalledProcessError as e:
        print("Error running Blender script:", e)
    sample_scandir = os.scandir(data)
    sample_URLs = []
    for file in sample_scandir:
            sample_URLs.append(f"{data}\\{file.name}".replace("\\", "/"))
    if len(sample_URLs) > 9:
        return sample_URLs[:9]
    elif len(sample_URLs) >= 1:
        return sample_URLs[0]
    else:
        return "null"