import json
import os
import shutil
import sqlite3
import time
import uuid
import pprint
from flask import Blueprint, abort, current_app, jsonify, request, send_from_directory
from MLApp.parameters import render_data_script
from MLApp.blender_scripts.blender_launcher import launch_blender
from MLApp.data_generator.prop_generator import gen_props_json
from ..services.dataset_service import save_dataset_props, add_dataset_db
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
        # print(data)
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


@bp.route('/get_compatible_datasets', methods=["POST"])
def get_compatible_datasets():
    """
    Fetches all available datasets.

    Route: /datasets.

    Returns: List of datasets in JSON.
    """
    checkpoints = json.loads(request.data.decode('utf-8'))
    print("checkpoints: ", checkpoints)
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    global DATASET_LIST

    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()

    checkpoint_img_dims = []
    compatible_datasets = []
    for checkpoint in checkpoints:
        try:
            query = "SELECT imageHeight, imageWidth FROM models WHERE value = ?"
            pprint.pp(checkpoint)
            cur.execute(query, (checkpoint['model_id'],))
            rows = cur.fetchall()
            for row in rows:
                row_dict = dict(row)
                checkpoint_img_dims.append(row_dict)
        except sqlite3.Error as e:
            print("Database error:", e)

    def all_same(img_dims):
        return all(x == img_dims[0] for x in img_dims)

    print("checkpoint_img_dims: ", checkpoint_img_dims)
    if all_same(checkpoint_img_dims):
        try:
            query = "SELECT * FROM datasets WHERE imageWidth = ? AND imageHeight = ?"
            cur.execute(
                query, (checkpoint_img_dims[0]['imageWidth'], checkpoint_img_dims[0]['imageHeight'],))
            rows = cur.fetchall()
            for row in rows:
                row_dict = dict(row)
                compatible_datasets.append(row_dict)
        except sqlite3.Error as e:
            print("Database error:", e)
        print(compatible_datasets)
        return compatible_datasets
    else:
        print("Error: Models with different input image resolutions selected.")
        return []


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
         if (prof["value"] == profile_to_save["value"] or prof["datasetName"] == profile_to_save["datasetName"])),
        (None, None))
    if (ind != None):
        DATASET_PROFILES_LIST[ind] = profile_to_save
    else:
        DATASET_PROFILES_LIST.append(profile_to_save)
    cur.execute("INSERT INTO profiles ("
                "value, "
                "datasetName, "
                "datasetSize, "
                "CVPercentage, "
                "TestSetPercentage, "
                "description, "
                "imageHeight, "
                "imageWidth, "
                "randomOrientation )"
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET "
                "datasetName = excluded.datasetName, "
                "datasetSize = excluded.datasetSize, "
                "description = excluded.description, "
                "CVPercentage = excluded.CVPercentage, "
                "TestSetPercentage = excluded.TestSetPercentage, "
                "imageHeight = excluded.imageHeight, "
                "imageWidth = excluded.imageWidth, "
                "randomOrientation = excluded.randomOrientation",
                (profile_to_save['value'],
                 profile_to_save['datasetName'],
                 profile_to_save['datasetSize'],
                 profile_to_save['CVPercentage'],
                 profile_to_save['TestSetPercentage'],
                 profile_to_save['description'],
                 profile_to_save['imageHeight'],
                 profile_to_save['imageWidth'],
                 profile_to_save['randomOrientation']))
    con.commit()
    con.close()
    print(
        jsonify({"value": profile_to_save['value'], "body": "success!"}), 200)
    return jsonify({"value": profile_to_save['value'], "body": "success!"}), 200


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
    prof_dir = os.path.join("MLApp", "data", "training_datasets", str(
        generate_profile['value']), time_stamp)
    generate_profile['renderDir'] = prof_dir
    size = generate_profile['datasetSize']
    print("submit_generate_dataset(): generate_profile: ", generate_profile)

    save_dataset_props(os.path.join(prof_dir, "train"),
                       generate_profile, "train")
    add_dataset_db(dataset_value=dataset_value+"-train", db_path=DATABASE_PATH,
                   generate_profile=generate_profile, split="train")
    train_dir = os.path.join(prof_dir, "train")
    sample_URLs = launch_blender(data=os.path.join(train_dir, "props"),
                                 script=os.path.join(
                                     "MLApp", render_data_script),
                                 scene_props=os.path.join(
                                     train_dir, "props", "scene_props.json"),
                                 render_dir=train_dir)

    if (int(generate_profile["CVPercentage"]) > 0):
        split_dir = os.path.join(prof_dir, "CV")
        save_dataset_props(split_dir, generate_profile, "CV")
        add_dataset_db(dataset_value=dataset_value+"-CV", db_path=DATABASE_PATH,
                       generate_profile=generate_profile, split="CV")
        launch_blender(data=os.path.join(split_dir, "props"),
                       script=os.path.join("MLApp", render_data_script),
                       scene_props=os.path.join(
                           split_dir, "props", "scene_props.json"),
                       render_dir=split_dir)

    if (int(generate_profile["TestSetPercentage"]) > 0):
        split_dir = os.path.join(prof_dir, "test")
        save_dataset_props(split_dir, generate_profile, "test")
        add_dataset_db(dataset_value=dataset_value+"-test", db_path=DATABASE_PATH,
                       generate_profile=generate_profile, split="test")
        launch_blender(data=os.path.join(split_dir, "props"),
                       script=os.path.join("MLApp", render_data_script),
                       scene_props=os.path.join(
                           split_dir, "props", "scene_props.json"),
                       render_dir=split_dir)
    print("!!!sample URLS: ", sample_URLs)
    return jsonify({"sample_URLs": sample_URLs, "body": "success!"}), 200


@bp.route('/delete_dataset/<dataset_ID>', methods=["POST"])
def delete_dataset(dataset_ID):
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    DATASETS_DIR_PATH = current_app.config["DATASETS_DIR_PATH"]
    dataset_profile_id = dataset_ID[:8]
    dataset_base_dir = os.path.join(dataset_ID[9:27])
    dataset_split_dir = os.path.join(
        dataset_base_dir, dataset_ID.split('-')[-1])
    dataset_full_path = os.path.realpath(os.path.join(
        DATASETS_DIR_PATH, dataset_profile_id, dataset_split_dir))

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
            print(
                f"error, path {dataset_full_path} is not within datasets folder!!")
            abort(403)
        else:
            print(f"deleting dir: {dataset_full_path}")
            shutil.rmtree(dataset_full_path)
    except Exception as e:
        return jsonify({"error": f"Deleted from database but not from filesytem: {str(e)}"})
    # del DATASET_PROFILES_LIST[ind]

    return jsonify({"body": "Profile deleted successfully!"}), 200


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

    profile_full_path = os.path.realpath(os.path.join(
        DATASETS_DIR_PATH, profile_to_del["value"]))

    ind, profile = next(
        ((ind, prof) for ind, prof in enumerate(DATASET_PROFILES_LIST)
         if (prof["value"] == profile_to_del["value"])),
        (None, None))
    if (ind != None):
        con = sqlite3.connect(DATABASE_PATH)
        cur = con.cursor()
        cur.execute('DELETE FROM profiles WHERE value = ?',
                    (profile_to_del["value"],))
        con.commit()
        con.close()
        del DATASET_PROFILES_LIST[ind]
    else:
        print("no deletion necessary")
        return jsonify({"body": "success, but no model existed with this value"}), 200
    try:
        if not profile_full_path.startswith(DATASETS_DIR_PATH):
            print(
                f"error, path {profile_full_path} is not within datasets folder!!")
            abort(403)
        else:
            print(f"deleting dir: {profile_full_path}")
            shutil.rmtree(profile_full_path)
    except Exception as e:
        return jsonify({"error": f"Deleted from database but not from filesytem: {str(e)}"})
    return jsonify({"body": "Profile deleted successfully!"}), 200
