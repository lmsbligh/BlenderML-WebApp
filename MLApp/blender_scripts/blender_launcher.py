import subprocess
from MLApp.parameters import blender_executable
import os
import re
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
    os.makedirs(render_dir, exist_ok=True)
    scene_path = os.path.join(os.getcwd(),"MLApp", "blender_files","scene.blend")
    script_path = os.path.join(os.getcwd(), script)
    print("scene_path:", scene_path)
    print("script_path:", script_path)
    data_path = os.path.join(os.getcwd(), data)
    print("data_path:", data_path)
    print("scene_props:", scene_props)
    print("render_dir: ", render_dir)

    command = []
    # if (scene_props):    
    #     command = [blender_executable, "-P", script_path, "--"] + ["--data_path", data_path] + ["--scene_props", scene_props] + [ "--render_path", render_dir]
            
    # else:
    #     command = [blender_executable, "-P", script_path, "--"] + [ "--data_path", data_path] + [ "--render_path", render_dir]
    if scene_props:
        command = [
            blender_executable,
            "-b", scene_path,
            "--python", script_path,
            "--data_path", data_path,
            "--scene_props", scene_props,
            "--render_path", render_dir
        ]
    else:
        command = [
            blender_executable,
            "-b", scene_path,
            "--python", script_path,
            "--data_path", data_path,
            "--render_path", render_dir
        ]        

    # Run the command using subprocess
    try:
        print("Running Blender command:", " ".join(command))
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        print(result.stdout, flush=True)
        print("Blender script executed successfully.")
    except subprocess.CalledProcessError as e:
        print("Error running Blender script:", e)
          
    sample_scandir = os.scandir(render_dir)
    sample_URLs = []
    
    match = re.search(r"(MLApp/.*)", render_dir)
    if match:
        relative_path = match.group(1)
    else:
        relative_path = render_dir  # fallback

    for file in sample_scandir:
            #sample_URLs.append(f"{render_dir}\\{file.name}".replace("\\", "/"))
            if file.is_file():
                sample_URLs.append(os.path.join(relative_path, file.name))
                
    print("sample_URLs: ", sample_URLs)
    if len(sample_URLs) > 5:
        return sample_URLs[:5]
    elif len(sample_URLs) >= 1:
        return [sample_URLs[0:len(sample_URLs)]]
    else:
        return "null"
