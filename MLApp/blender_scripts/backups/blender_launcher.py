import subprocess
from MLApp.parameters import blender_executable
import os
import time

def launch_blender(data="train", script="", render_dir=""):
    """Simple function to launch blender passing in data_dir and a script
    as argv.

    data_dir : str
        Location of the directory containing material parameters.

    script : str
        Location of the script to run in Blender on launch.

    """
    
    script_path = f"{os.getcwd()}"+ script
    # unique_path_component = f"\\{data}\\renders\\render-{time.strftime('%d-%m-%Y-%H%M-%S')}"
    # unique_path_component = data
    render_path = f"{os.getcwd()}\\{data}" if not render_dir else render_dir
    command = [blender_executable, "-P", script_path] + [os.getcwd() + "\\" + data] + [render_path]
    print(f"{command=}")
    # Run the command using subprocess
    try:
        print(subprocess.run(command, check=True))
        print("Blender script executed successfully.")
    except subprocess.CalledProcessError as e:
        print("Error running Blender script:", e)
    sample_scandir = os.scandir(render_path)
    sample_URLs = []
    for file in sample_scandir:
            sample_URLs.append(f"{data}\\{file.name}".replace("\\", "/"))
    if len(sample_URLs) > 9:
        return sample_URLs[:9]
    elif len(sample_URLs) >= 1:
        return sample_URLs[0]
    else:
        return "null"