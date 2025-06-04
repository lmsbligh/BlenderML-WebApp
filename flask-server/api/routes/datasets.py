import json
import os
import shutil
import sqlite3
import time
import uuid
from flask import Blueprint, abort, current_app, jsonify, request, send_from_directory
from MLApp.parameters import render_data_script
from MLApp.blender_scripts.blender_launcher import launch_blender
from MLApp.data_generator.prop_generator import gen_props_json
from ..forms.dataset_forms import DATASET_PROFILE_FORM
from ..utils import validate_form

bp = Blueprint('datasets', __name__)


@bp.route("/dataset_profiles")
def get_dataset_profiles():
    """
    Fetches available dataset profiles.
    
    Route: /dataset_profiles.
    
    Returns: List of profile in JSON.
    """
    
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    global DATASET_PROFILES_LIST

    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()
    
    try:
        cur.execute("SELECT * FROM profiles")
        rows = cur.fetchall()
        data = []
        for row in rows:
            row_dict = dict(row)
            if 'meshes' in row_dict and row_dict['meshes']:
                row_dict['meshes'] = json.loads(row_dict['meshes'])
            data.append(row_dict)
        DATASET_PROFILES_LIST = data
        #print(data)
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        # Close the connection
        con.close()
        
@bp.route('/datasets')
@bp.route('/datasets/<profile_id>')
def get_datasets(profile_id=None):
    """
    Fetches all available datasets.
    
    Route: /datasets.
    
    Returns: List of datasets in JSON.
    """
    DATABASE_PATH = current_app.config["DATABASE_PATH"]    
    global DATASET_LIST

    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()
    
    try:
        if profile_id:
            query = "SELECT * FROM datasets WHERE value LIKE ?"
            cur.execute(query, (f"{profile_id}-%",))
        else: 
            cur.execute("SELECT * FROM datasets")
        rows = cur.fetchall()
        data = []
        for row in rows:
            row_dict = dict(row)
            if 'meshes' in row_dict and row_dict['meshes']:
                row_dict['meshes'] = json.loads(row_dict['meshes'])
            data.append(row_dict)
        DATASET_LIST = data
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        # Close the connection
        con.close()
                
@bp.route('/submit_dataset_profile', methods=["POST"])
def submit_dataset_profile():
    """
    POSTs dataset profile to server.
    
    Route: /submit_dataset_profile
    
    returns:
        - 200 - Success
        - 400 - Error
    """
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    print("POST req received, dataset profile submission")
    
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    
    profile_to_save = json.loads(request.data.decode('utf-8'))
    print("profile_to_save: ", profile_to_save)
    try:
        validate_form(profile_to_save, DATASET_PROFILE_FORM)
    except ValueError as ve:
        print(jsonify({"error": str(ve)}), 400)
        return jsonify({"error": str(ve)}), 400
    if ("value" not in profile_to_save):
        profile_to_save["value"] = str(uuid.uuid4())[:8]
    ind, profile = next(
        ((ind, prof) for ind, prof in enumerate(DATASET_PROFILES_LIST) 
        if (prof["value"] == profile_to_save["value"] or prof["datasetName"] == profile_to_save["datasetName"] )),
        (None, None))
    if (ind != None):
        DATASET_PROFILES_LIST[ind] = profile_to_save
    else:
        DATASET_PROFILES_LIST.append(profile_to_save)
    cur.execute('INSERT INTO profiles (value, datasetName, datasetSize, CVPercentage, TrainingSetPercentage, description, imageHeight, imageWidth, meshes, randomOrientation, skyboxPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET datasetName = excluded.datasetName, datasetSize = excluded.datasetSize, description = excluded.description, CVPercentage = excluded.CVPercentage, TrainingSetPercentage = excluded.TrainingSetPercentage, imageHeight = excluded.imageHeight, imageWidth = excluded.imageWidth, meshes = excluded.meshes, randomOrientation = excluded.randomOrientation, skyboxPath = excluded.skyboxPath;', (profile_to_save['value'], profile_to_save['datasetName'], profile_to_save['datasetSize'], profile_to_save['CVPercentage'], profile_to_save['TrainingSetPercentage'], profile_to_save['description'], profile_to_save['imageHeight'], profile_to_save['imageWidth'], json.dumps(profile_to_save['meshes']), profile_to_save['randomOrientation'], profile_to_save['skyboxPath']))
    con.commit()
    con.close()
    print(jsonify({"value": profile_to_save['value'], "body": "success!"}), 200)  
    return jsonify({"value": profile_to_save['value'], "body": "success!"}), 200

@bp.route('/delete_dataset/<dataset_ID>', methods=["POST"])
def delete_dataset(dataset_ID):
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    DATASETS_DIR_PATH = current_app.config["DATASETS_DIR_PATH"]
    dataset_profile_id = dataset_ID[:8]
    dataset_dir = dataset_ID[9:]
    dataset_full_path = os.path.realpath(os.path.join(DATASETS_DIR_PATH, dataset_profile_id, dataset_dir))
    
    try:
        con = sqlite3.connect(DATABASE_PATH)
        cur = con.cursor()
        cur.execute('DELETE FROM datasets WHERE value = ?', (dataset_ID,))
        con.commit()
        con.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    try:
        if not dataset_full_path.startswith(DATASETS_DIR_PATH):
            print(f"error, path {dataset_full_path} is not within datasets folder!!")
            abort(403)
        else:
            print(f"deleting dir: {dataset_full_path}")
            shutil.rmtree(dataset_full_path)
    except Exception as e:
        return jsonify({"error": f"Deleted from database but not from filesytem: {str(e)}"})
    #del DATASET_PROFILES_LIST[ind]

    return jsonify({"body": "Profile deleted successfully!"}), 200
    
@bp.route('/delete_dataset_profile', methods=["POST"])
def delete_dataset_profile():
    """
    POSTs profile JSON for deletion to server.
    
    Route: /delete_dataset_profile
    
    returns:
        - 200 - Success
        - 400 - Error
    """
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    profile_to_del = json.loads(request.data.decode('utf-8'))
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    DATASETS_DIR_PATH = current_app.config["DATASETS_DIR_PATH"]
    
    profile_full_path = os.path.realpath(os.path.join(DATASETS_DIR_PATH, profile_to_del["value"]))

    
    ind, profile = next(
        ((ind, prof) for ind, prof in enumerate(DATASET_PROFILES_LIST) 
        if (prof["value"] == profile_to_del["value"])),
        (None, None))
    if (ind != None):
        con = sqlite3.connect(DATABASE_PATH)
        cur = con.cursor()
        cur.execute('DELETE FROM profiles WHERE value = ?', (profile_to_del["value"],))
        con.commit()
        con.close()
        del DATASET_PROFILES_LIST[ind]
    else:
        print("no deletion necessary")
        return jsonify({"body": "success, but no model existed with this value"}), 200
    try:
        if not profile_full_path.startswith(DATASETS_DIR_PATH):
            print(f"error, path {profile_full_path} is not within datasets folder!!")
            abort(403)
        else:
            print(f"deleting dir: {profile_full_path}")
            shutil.rmtree(profile_full_path)
    except Exception as e:
        return jsonify({"error": f"Deleted from database but not from filesytem: {str(e)}"})
    return jsonify({"body": "Profile deleted successfully!"}), 200

@bp.route('/submit_generate_dataset', methods=["POST"])
def submit_generate_dataset():
    """
    POSTs dataset profile JSON form to server to initiate the generation of a dataset as well as saving the submitted profile.
    
    Route: /submit_generate_dataset
    
    returns:
        - 200 - Success
        - 400 - Error
    """
    DATABASE_PATH = current_app.config["DATABASE_PATH"]    
    generate_profile = json.loads(request.data.decode('utf-8'))
    time_stamp = time.strftime('%d-%m-%Y-%H%M-%S')
    dataset_value = f"{generate_profile['value']}-{time_stamp}"
    prof_dir = os.path.join("MLApp", "data", "training_datasets",str(generate_profile['value']), time_stamp)
    generate_profile['renderDir'] = prof_dir
    size = generate_profile['datasetSize']
    gen_props_json(prof_dir, size)
    
    with open(os.path.join(prof_dir, "props", "scene_props.json"), 'w+') as file:    
        # try:
        #     file_data = json.load(file) if file_exists and file.read().strip() else []
        # except json.JSONDecodeError:
        #     file_data = []  # If there's an error, just use an empty dictionary
        
        json.dump(generate_profile, file)
    sample_URLs = launch_blender(data=os.path.join(prof_dir, "props"), script=os.path.join("MLApp", render_data_script), scene_props=os.path.join(prof_dir, "props","scene_props.json"), render_dir=prof_dir)
    
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    #cur.execute("DROP TABLE datasets")
    #cur.execute("CREATE TABLE datasets (value TEXT UNIQUE, datasetName TEXT, datasetSize INTEGER, description TEXT, imageHeight INTEGER, imageWidth INTEGER, meshes TEXT, randomOrientation TEXT, skyboxPath TEXT)")
    sql = ("INSERT INTO datasets (value, datasetName, datasetSize, description, imageHeight, imageWidth, meshes, randomOrientation, skyboxPath) "
           "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) "
           "ON CONFLICT(value) DO UPDATE SET " 
           "datasetName = excluded.datasetName, "
           "datasetSize = excluded.datasetSize, "
           "description = excluded.description, "
           "imageHeight = excluded.imageHeight, "
           "imageWidth = excluded.imageWidth, "
           "meshes = excluded.meshes, " 
           "randomOrientation = excluded.randomOrientation, "
           "skyboxPath = excluded.skyboxPath;")
    cur.execute(sql, (dataset_value, 
                      generate_profile['datasetName'], 
                      generate_profile['datasetSize'], 
                      generate_profile['description'], 
                      generate_profile['imageHeight'], 
                      generate_profile['imageWidth'], 
                      json.dumps(generate_profile['meshes']), 
                      generate_profile['randomOrientation'], 
                      generate_profile['skyboxPath']))
    con.commit()
    con.close()
    return jsonify({"sample_URLs": sample_URLs, "body": "success!"}), 200

@bp.route('/MLApp/data/training_datasets/<string:profile_id>/<path:dataset_render_date>/<path:dataset_filename>', methods=['GET'])
def return_sample(profile_id, dataset_render_date, dataset_filename):
    """
    Requests a sample of images from a generated datset.
    
    Route: /MLApp/data/training_datasets/<string:profile_id>/<path:dataset_render_date>/<path:dataset_filename>
    
    Args:
        - profile_id
        - dataset_render_date
        - dataset_filename
    returns:
        - 200 - Success
        - 400 - Error
    """
    return send_from_directory(f"../MLApp/data/training_datasets/{profile_id}/{dataset_render_date}/", dataset_filename)