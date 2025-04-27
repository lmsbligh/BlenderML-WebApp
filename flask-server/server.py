import sys
import os
import time
import json
import uuid
import re
from flask import Flask
from flask import request, jsonify, send_from_directory, flash, redirect, url_for
from werkzeug.utils import secure_filename
import sqlite3
from flask import g

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # Adds WebApp root to path

from MLApp.data_generator.prop_generator import gen_props_json
from MLApp.blender_scripts.blender_launcher import launch_blender
from MLApp.parameters import render_data_script
from MLApp.custom_torch.flask_train import flask_train
from MLApp.custom_torch.flask_generate_material import flask_generate_material


# con = sqlite3.connect(DATABASE_PATH)
# cur = con.cursor()
# cur.execute("CREATE TABLE profiles(value INTEGER UNIQUE, datasetName TEXT, datasetSize INTEGER, description TEXT, imageHeight INTEGER, imageWidth INTEGER, meshes TEXT, randomOrientation TEXT, skyboxPath TEXT)")

# cur.execute("CREATE TABLE models(value INTEGER UNIQUE, modelName TEXT, input INTEGER, output INTEGER, description TEXT, layers TEXT)")
# con.commit()
# con.close()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MODELS_LIST = []
HYPER_PARAMS = {
    "model": "fdsafdfas",
    "datasetProfile": "fdsafdfas",
    "epochs": 100,
    "learningRate": 0.001,
    "optimizer": "ADAM",
    "lossFunction": "MSE",
    "xVal": 20
}

app = Flask(__name__)
app.secret_key = 'asdjkfnasdouif2398r'
app.config['UPLOAD_FOLDER'] = os.path.join('MLApp', 'data', 'user_uploaded_test')
DATABASE_PATH = os.path.join(os.getcwd(), "MLApp", "data", "data.db")

@app.route("/models")
def get_models():
    global MODELS_LIST
    print("DATABASE_PATH", DATABASE_PATH)
    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()
    
    try:
        cur.execute("SELECT * FROM models")
        rows = cur.fetchall()
        data = []
        for row in rows:
            row_dict = dict(row)
            if 'layers' in row_dict and row_dict['layers']:
                row_dict['layers'] = json.loads(row_dict['layers'])
            data.append(row_dict)
        MODELS_LIST = data
        
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        con.close()
    
DATASET_PROFILES_LIST = []

@app.route("/dataset_profiles")
def get_dataset_profiles():
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
        
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        # Close the connection
        con.close()
        
@app.route("/layer_types")
def get_layer_types():
                return [{"value": 1, "layer_type": 'Dense'},
        {"value": 2, "layer_type": 'CNN'},
        {"value": 3, "layer_type": 'Pooling'}]
                
@app.route("/activation_types")
def get_activation_types():
                return [{"value": 1, "activation": 'Linear'},
        {"value": 2, "activation": 'ReLU'},
        {"value": 3, "activation": 'Heaviside'},
        {"value": 4, "activation": 'Sigmoid'},
        {"value": 5, "activation": 'None'}]
                
def validate_dataset_profile(data):
    required_fields = {
        "datasetName": str,
        "datasetSize": str,
        "description": str,
        "imageHeight": str,
        "imageWidth": str,
        "meshes": dict,
        "randomOrientation": str,
        "skyboxPath": str,
    }
    for field, field_type in required_fields.items():
        if field not in data:
            raise ValueError(f"Missing field: {field}")
        if not isinstance(data[field], field_type):
            raise ValueError(f"Field {field} must be of type {field_type}")
        
    # Additional sanity checks
    if not (re.match(r"^(?:[1-9]\d{0,2}|[1-4]\d{3}|5000)$", data["datasetSize"])):
        raise ValueError(f"Dataset size must be between 1 and 5000, given: {data['datasetSize']}")
    return True

@app.route('/submit_dataset_profile', methods=["POST"])
def submit_dataset_profile():
    
    print("POST req received, dataset profile submission")
    
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    
    profile_to_save = json.loads(request.data.decode('utf-8'))
    try:
        validate_dataset_profile(profile_to_save)
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    if ("value" not in profile_to_save):
        profile_to_save["value"] = str(uuid.uuid4())[:8]
    ind, profile = next(
        ((ind, prof) for ind, prof in enumerate(DATASET_PROFILES_LIST) 
        if (prof["value"] == profile_to_save["value"] or prof["datasetName"] == profile_to_save["datasetName"] )),
        (None, None))
    if (ind != None):
        DATASET_PROFILES_LIST[ind] == profile_to_save
    else:
        DATASET_PROFILES_LIST.append(profile_to_save)
    cur.execute('INSERT INTO profiles (value, datasetName, datasetSize, description, imageHeight, imageWidth, meshes, randomOrientation, skyboxPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET datasetName = excluded.datasetName, datasetSize = excluded.datasetSize, description = excluded.description, imageHeight = excluded.imageHeight, imageWidth = excluded.imageWidth, meshes = excluded.meshes, randomOrientation = excluded.randomOrientation, skyboxPath = excluded.skyboxPath;', (profile_to_save['value'], profile_to_save['datasetName'], profile_to_save['datasetSize'], profile_to_save['description'], profile_to_save['imageHeight'], profile_to_save['imageWidth'], json.dumps(profile_to_save['meshes']), profile_to_save['randomOrientation'], profile_to_save['skyboxPath']))
    con.commit()
    con.close()
        
    return jsonify({"value": profile_to_save['value'], "body": "success!"}), 200

@app.route('/submit_model', methods=["POST"])
def submit_model():
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    # cur.execute("CREATE TABLE models(value, modelName, input, output, description, layers)")
    # con.commit()
    # con.close()

    model_to_save = json.loads(request.data.decode('utf-8'))
    print(model_to_save)
    ind, model = next(
        ((ind, model) for ind, model in enumerate(MODELS_LIST)
        if (model["value"] == model_to_save["value"])), 
        (None, None))
    if (ind):
        MODELS_LIST[ind] = model_to_save
    else:
        MODELS_LIST.append(model_to_save)
    cur.execute('INSERT INTO models (value, modelName, input, output, description, layers) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET modelName = excluded.modelName, input = excluded.input, output = excluded.output, description = excluded.description, layers = excluded.layers;', (model_to_save['value'], model_to_save['modelName'], model_to_save['input'], model_to_save['output'], model_to_save['description'], json.dumps(model_to_save['layers'])))
    con.commit()
    con.close()
    return jsonify({"body": "success!"}), 200

@app.route('/delete_model', methods=["POST"])
def delete_model():
    model_to_del = json.loads(request.data.decode('utf-8'))
    ind, model = next(
        ((ind, model) for ind, model in enumerate(MODELS_LIST)
        if (model["value"] == model_to_del["value"])), 
        (None, None))
    if (ind != None):
        con = sqlite3.connect(DATABASE_PATH)
        cur = con.cursor()
        cur.execute('DELETE FROM models WHERE value = ?', (model_to_del["value"],))
        con.commit()
        con.close()
        del MODELS_LIST[ind]
    else:
        return jsonify({"body": "success, but no model existed with this value"}), 200
    return jsonify({"body": "success!"}), 200
    
@app.route('/delete_dataset_profile', methods=["POST"])
def delete_dataset_profile():
    profile_to_del = json.loads(request.data.decode('utf-8'))
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

    return jsonify({"body": "Profile deleted successfully!"}), 200

@app.route('/submit_training', methods=["POST"])
def submit_training():    
    training_form = json.loads(request.data.decode("utf-8"))
    print("!!Training ran but disabled.")
    print(training_form)
    #flask_train(training_form)
    
    return jsonify({"body": "Training request received successfully."}), 200

@app.route('/submit_generate_dataset', methods=["POST"])
def submit_generate_dataset():    
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
    sample_URLs = launch_blender(data=os.path.join(prof_dir, "props"), script=os.path.join("MLApp", render_data_script), scene_props=os.path.join(prof_dir, "props","scene_props.json"))
    
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

@app.route('/MLApp/data/training_datasets/<string:profile_id>/<path:dataset_render_date>/<path:dataset_filename>', methods=['GET'])
def return_sample(profile_id, dataset_render_date, dataset_filename):
    return send_from_directory(f"../MLApp/data/training_datasets/{profile_id}/{dataset_render_date}/", dataset_filename)

@app.route('/datasets')
def get_datasets():    
    global DATASET_LIST

    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()
    
    try:
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
    
    
@app.route('/<path:filename>')
def serve_image(filename):
    return send_from_directory("../", filename)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
           
@app.route('/MLApp/data/user_uploaded_test/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    return send_from_directory('../'+app.config['UPLOAD_FOLDER'], filename)

@app.route('/checkpoints/<string:model_id>')
def get_checkpoints(model_id):
    checkpoint_dir = os.path.join("MLApp", "data", "w_and_b", model_id)
    if os.path.isdir(checkpoint_dir):
        checkpoints = os.listdir(checkpoint_dir)
        return checkpoints
    else:
        return []

@app.route('/upload_file', methods=['POST'])
def upload_file():
    if 'uploadFile' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['uploadFile']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):

        filename = secure_filename(file.filename)
        
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        download_url = url_for('serve_uploaded_file', filename=filename, _external=True)
        return jsonify({"url": download_url,
                        "image_path":file_path}), 200
    
    else:
        flash('File not allowed')
        return redirect(request.url)

@app.route('/generate_material', methods=['POST'])
def generate_material():    
    generate_mat_form = json.loads(request.data.decode('utf-8'))
    predicted_props = flask_generate_material(generate_mat_form, app.config['UPLOAD_FOLDER'])
    
    if not os.path.isdir(os.path.join(app.config['UPLOAD_FOLDER'], "props")):
        os.mkdir(os.path.join(app.config['UPLOAD_FOLDER'], "props"))   
    with open(os.path.join(app.config['UPLOAD_FOLDER'], "props", "params.json"), 'w+') as file:
        json.dump(predicted_props, file)
        print("writing to params.json")
    
    with open(os.path.join(app.config['UPLOAD_FOLDER'], "props", "scene_props.json"), 'w+') as file:
        json.dump(generate_mat_form, file)
        print("writing to scene_props.json")
        
    sample_URLs = launch_blender(
                                    data=os.path.join(app.config['UPLOAD_FOLDER'],"props"), 
                                    script=os.path.join("MLApp", render_data_script),
                                    render_dir=os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'])
                                )
    print("generate materials returning: ", url_for('serve_uploaded_file', filename=f"{predicted_props['name']}.jpg", _external=True))
    return jsonify({"predicted_props": predicted_props,
                    "render_url": url_for('serve_uploaded_file', filename=f"{predicted_props['name']}.jpg", _external=True)})
    
if __name__ == "__main__":
        app.run(debug=True)


    
