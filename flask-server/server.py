import sys
import os
import time
import json
import uuid
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


# con = sqlite3.connect("data.db")
# cur = con.cursor()
# cur.execute("CREATE TABLE profiles(value INTEGER UNIQUE, datasetName TEXT, datasetSize INTEGER, description TEXT, imageHeight INTEGER, imageWidth INTEGER, meshes TEXT, randomOrientation TEXT, skyboxPath TEXT)")

# cur.execute("CREATE TABLE models(value INTEGER UNIQUE, modelName TEXT, input INTEGER, output INTEGER, description TEXT, layers TEXT)")
# con.commit()
# con.close()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
modelsList = []
hyperparams = {
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

@app.route("/models")
def get_models():
    global modelsList
    con = sqlite3.connect("data.db")
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
        modelsList = data
        
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        # Close the connection
        print(f"modelsList: {modelsList}")
        con.close()
    
datasetProfilesList = []

@app.route("/datasetProfiles")
def get_dataset_profiles():
    global datasetProfilesList
    con = sqlite3.connect("data.db")
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
        datasetProfilesList = data
        
        
        
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        # Close the connection
        print(f"datasetProfilesList: {datasetProfilesList}")
        con.close()
        
@app.route("/layerTypes")
def get_layer_types():
                return [{"value": 1, "layer_type": 'Dense'},
        {"value": 2, "layer_type": 'CNN'},
        {"value": 3, "layer_type": 'Pooling'}]
                
@app.route("/activationTypes")
def get_activation_types():
                return [{"value": 1, "activation": 'Linear'},
        {"value": 2, "activation": 'ReLU'},
        {"value": 3, "activation": 'Heaviside'},
        {"value": 4, "activation": 'Sigmoid'},
        {"value": 5, "activation": 'None'}]

@app.route('/submitDatasetProfile', methods=["POST"])
def submit_datset_profile():
    
    print("POST req received, dataset profile submission")
    
    con = sqlite3.connect("data.db")
    cur = con.cursor()
    
    saveProfile = json.loads(request.data.decode('utf-8'))
    print(f"saveProfile: {saveProfile}")
    if ("value" not in saveProfile):
        saveProfile["value"] = str(uuid.uuid4())[:8]
        print(f"saveProfile, value added: {saveProfile}")
    ind, profile = next(
        ((ind, prof) for ind, prof in enumerate(datasetProfilesList) 
        if (prof["value"] == saveProfile["value"] or prof["datasetName"] == saveProfile["datasetName"] )),
        (None, None))
    if (ind != None):
        datasetProfilesList[ind] == saveProfile
    else:
        datasetProfilesList.append(saveProfile)
    cur.execute('INSERT INTO profiles (value, datasetName, datasetSize, description, imageHeight, imageWidth, meshes, randomOrientation, skyboxPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET datasetName = excluded.datasetName, datasetSize = excluded.datasetSize, description = excluded.description, imageHeight = excluded.imageHeight, imageWidth = excluded.imageWidth, meshes = excluded.meshes, randomOrientation = excluded.randomOrientation, skyboxPath = excluded.skyboxPath;', (saveProfile['value'], saveProfile['datasetName'], saveProfile['datasetSize'], saveProfile['description'], saveProfile['imageHeight'], saveProfile['imageWidth'], json.dumps(saveProfile['meshes']), saveProfile['randomOrientation'], saveProfile['skyboxPath']))
    con.commit()
    con.close()
        
    print(f" \n datasetProfilesList: {[e['value'] for e in datasetProfilesList]}")
    print(saveProfile)
    return jsonify({"value": saveProfile['value'], "body": "success!"}), 200

@app.route('/submitModel', methods=["POST"])
def submit_model():
    con = sqlite3.connect("data.db")
    cur = con.cursor()
    # cur.execute("CREATE TABLE models(value, modelName, input, output, description, layers)")
    # con.commit()
    # con.close()
    print("POST req received, model submission")
    print(f"modelsList: {modelsList}")

    saveModel = json.loads(request.data.decode('utf-8'))
    ind, model = next(
        ((ind, model) for ind, model in enumerate(modelsList)
        if (model["value"] == saveModel["value"])), 
        (None, None))
    if (ind):
        modelsList[ind] = saveModel
    else:
        modelsList.append(saveModel)
    cur.execute('INSERT INTO models (value, modelName, input, output, description, layers) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET modelName = excluded.modelName, input = excluded.input, output = excluded.output, description = excluded.description, layers = excluded.layers;', (saveModel['value'], saveModel['modelName'], saveModel['input'], saveModel['output'], saveModel['description'], json.dumps(saveModel['layers'])))
    con.commit()
    con.close()
    print(f"\n new models: {modelsList}")
    return jsonify({"body": "success!"}), 200

    
    
@app.route('/deleteModel', methods=["POST"])
def delete_model():
    print("POST req received, model deletion")
    print(f"modelsList: {modelsList}")

    delModel = json.loads(request.data.decode('utf-8'))
    ind, model = next(
        ((ind, model) for ind, model in enumerate(modelsList)
        if (model["value"] == delModel["value"])), 
        (None, None))
    if (ind != None):
        con = sqlite3.connect("data.db")
        cur = con.cursor()
        cur.execute('DELETE FROM models WHERE value = ?', (delModel["value"],))
        con.commit()
        con.close()
        del modelsList[ind]
    else:
        print("no deletion necessary")
        return jsonify({"body": "success, but no model existed with this value"}), 200
    print(f"\n new models: {modelsList}")
    return jsonify({"body": "success!"}), 200
    
@app.route('/deleteDatasetProfile', methods=["POST"])
def delete_dataset_profile():
    print(f"request.data: {request.data}")
    print(f"request.data type: {type(request.data)}")
    delProfile = json.loads(request.data.decode('utf-8'))
    print(f"delProfile: {delProfile}")
    print(f"delProfile type: {type(delProfile)}")
    #delProfile = request.data
    ind, profile = next(
        ((ind, prof) for ind, prof in enumerate(datasetProfilesList) 
        if (prof["value"] == delProfile["value"])),
        (None, None))
    if (ind != None):
        con = sqlite3.connect("data.db")
        cur = con.cursor()
        cur.execute('DELETE FROM profiles WHERE value = ?', (delProfile["value"],))
        con.commit()
        con.close()
        del datasetProfilesList[ind]
    else:
        print("no deletion necessary")
        return jsonify({"body": "success, but no model existed with this value"}), 200

    print(f" \n datasetProfilesList: {[e['value'] for e in datasetProfilesList]}")
    return jsonify({"body": "Profile deleted successfully!"}), 200

@app.route('/submitTraining', methods=["POST"])
def submit_training():
    print(f"Training form submitted: {request.data}")
    
    training_form = json.loads(request.data.decode("utf-8"))
    flask_train(training_form)
    
    return jsonify({"body": "Training request received successfully."}), 200

@app.route('/submitGenerateDataset', methods=["POST"])
def submit_generate_dataset():
    print(f"POST Req: submitGenerateDataset():")
    
    generateProfile = json.loads(request.data.decode('utf-8'))
    time_stamp = time.strftime('%d-%m-%Y-%H%M-%S')
    dataset_value = f"{generateProfile['value']}-{time_stamp}"
    prof_dir = f"MLApp\\data\\training_datasets\\{str(generateProfile['value'])}\\{time_stamp}"
    generateProfile['renderDir'] = prof_dir
    size = generateProfile['datasetSize']
    
    print(f"generateProfile: {generateProfile}")
    
    gen_props_json(prof_dir, size)
    
    with open(prof_dir + "\\props\\scene_props.json", 'w+') as file:    
        # try:
        #     file_data = json.load(file) if file_exists and file.read().strip() else []
        # except json.JSONDecodeError:
        #     file_data = []  # If there's an error, just use an empty dictionary
        
        json.dump(generateProfile, file)
        print("writing to file: " + prof_dir + "\\props\\scene_props.json")
    sample_URLs = launch_blender(data=os.path.join(prof_dir, "props"), script="\\MLApp\\" + render_data_script, scene_props=prof_dir + "\\props\\scene_props.json")
    
    con = sqlite3.connect("data.db")
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
                      generateProfile['datasetName'], 
                      generateProfile['datasetSize'], 
                      generateProfile['description'], 
                      generateProfile['imageHeight'], 
                      generateProfile['imageWidth'], 
                      json.dumps(generateProfile['meshes']), 
                      generateProfile['randomOrientation'], 
                      generateProfile['skyboxPath']))
    con.commit()
    con.close()
    return jsonify({"sample_URLs": sample_URLs, "body": "success!"}), 200

@app.route('/MLApp/data/training_datasets/<string:profile_id>/<path:dataset_render_date>/<path:dataset_filename>', methods=['GET'])
def return_sample(profile_id, dataset_render_date, dataset_filename):
    print(f"GET request received for {dataset_filename}")
    return send_from_directory(f"../MLApp/data/training_datasets/{profile_id}/{dataset_render_date}/", dataset_filename)

@app.route('/getDatasets')
def get_datasets():
    print("getting datasets")
    
    global datasetList

    con = sqlite3.connect("data.db")
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
        datasetList = data
        return data
    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        # Close the connection
        print(f"datasets: {datasetList}")
        con.close()
    
    
@app.route('/<path:filename>')
def serve_image(filename):
    print(f"filename is: {filename}")
    return send_from_directory("../", filename)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
           
@app.route('/MLApp/data/user_uploaded_test/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    print(f"filename is: {filename}")
    return send_from_directory('../'+app.config['UPLOAD_FOLDER'], filename)

@app.route('/checkpoints/<string:model_id>')
def get_checkpoints(model_id):
    checkpoints = os.listdir(f'MLApp\\data\\w_and_b\\{model_id}')
    return checkpoints

@app.route('/uploadFile', methods=['POST'])
def upload_file():
    print("uploadFile() ran: ")
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
        print("download_url: ", download_url)
        return jsonify({"url": download_url,
                        "image_path":file_path}), 200
    
    else:
        flash('File not allowed')
        return redirect(request.url)

@app.route('/generateMaterial', methods=['POST'])
def generate_material():
    print("Generate Material Submitted")
    
    generateMaterialForm = json.loads(request.data.decode('utf-8'))
    predicted_props = flask_generate_material(generateMaterialForm, app.config['UPLOAD_FOLDER'])
    
    if not os.path.isdir(os.path.join(app.config['UPLOAD_FOLDER'], "props")):
        os.mkdir(os.path.join(app.config['UPLOAD_FOLDER'], "props"))   
    with open(app.config['UPLOAD_FOLDER'] + "\\props\\params.json", 'w+') as file:
        json.dump(predicted_props, file)
        print("writing to params.json")
    
    with open(app.config['UPLOAD_FOLDER'] + "\\props\\scene_props.json", 'w+') as file:
        json.dump(generateMaterialForm, file)
        print("writing to scene_props.json")
        
    sample_URLs = launch_blender(data=os.path.join(app.config['UPLOAD_FOLDER'],"props"), script="\\MLApp" + render_data_script, render_dir=os.getcwd() +"\\" +app.config['UPLOAD_FOLDER'])
    
    print("sample_URLs: ", sample_URLs)
    return jsonify({"predicted_props": predicted_props,
                    "render_url": url_for('serve_uploaded_file', filename=f"{predicted_props['name']}.jpg", _external=True)})
    
if __name__ == "__main__":
        app.run(debug=True)


    
