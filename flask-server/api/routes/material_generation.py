import json
import os
from flask import Blueprint, current_app, flash, jsonify, redirect, request, send_from_directory, url_for, abort
from ..forms.material_generation_forms import GENERATE_MATERIAL_FORM
from werkzeug.utils import secure_filename
from MLApp.blender_scripts.blender_launcher import launch_blender
from MLApp.custom_torch.flask_generate_material import flask_generate_material
from MLApp.parameters import render_data_script
from ..utils import validate_form


bp = Blueprint('material_generation', __name__)

@bp.route('/upload_file', methods=['POST'])
def upload_file():
    """
    POST request that handles file upload.

    Route: /upload_file
    
    Args: request.files
    
    Returns: JSON containing download_url and file_path.
        
    """
    UPLOAD_FOLDER = current_app.config['UPLOAD_FOLDER']
    
    if 'uploadFile' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['uploadFile']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):

        filename = secure_filename(file.filename)
        
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        download_url = url_for('material_generation.serve_uploaded_file', filename=filename, _external=True)
        return jsonify({"url": download_url,
                        "image_path":file_path}), 200
    
    else:
        flash('File not allowed')
        return redirect(request.url)

@bp.route('/generate_material', methods=['POST'])
def generate_material():
    """
    POST request containing the material generation form, instructing the server to predict and render material properties from the image provided.

    Route: /generate_material
    
    Args: request/form
    
    Returns: JSON containing predicted_props of the material as well as the render_url.
    """
    UPLOAD_FOLDER = current_app.config['UPLOAD_FOLDER']

    generate_mat_form = json.loads(request.data.decode('utf-8'))
    print("generate_mat_form: ", generate_mat_form)
    try:
        validate_form(generate_mat_form, GENERATE_MATERIAL_FORM)
        print("Validation passed")
    except ValueError as ve:
        # print(jsonify({"error": str(ve)}), 400)
        print(f"Validation error: {ve}")
        return jsonify({"error": str(ve)})
    
    predicted_props = flask_generate_material(generate_mat_form, UPLOAD_FOLDER)

    if not os.path.isdir(os.path.join(UPLOAD_FOLDER, "props")):
        os.mkdir(os.path.join(UPLOAD_FOLDER, "props"))   
    with open(os.path.join(UPLOAD_FOLDER, "props", "params.json"), 'w+') as file:
        json.dump(predicted_props, file)
        print("writing to params.json")
    
    with open(os.path.join(UPLOAD_FOLDER, "props", "scene_props.json"), 'w+') as file:
        json.dump(generate_mat_form, file)
        print("writing to scene_props.json")
        
    sample_URLs = launch_blender(
                                    data=os.path.join(UPLOAD_FOLDER,"props"), 
                                    script=os.path.join("MLApp", render_data_script),
                                    render_dir=os.path.join(os.getcwd(), UPLOAD_FOLDER)
                                )
    print("generate materials returning: ", url_for('material_generation.serve_uploaded_file', filename=f"{predicted_props['name']}.jpg", _external=True))
    return jsonify({"predicted_props": predicted_props,
                    "render_url": url_for('material_generation.serve_uploaded_file', filename=f"{predicted_props['name']}.jpg", _external=True)})
    
@bp.route('/<path:filename>')
def serve_image(filename):
    """
    Serves requested image file.

    Args: filename.
    
    Returns: send_from_directory("../", filename)
        
    """
    SAFE_DIR = os.path.join(os.getcwd(), 'MLApp', 'data') 
    full_path = os.path.realpath(os.path.join(SAFE_DIR, filename))
    if not full_path.startswith(SAFE_DIR):
        abort(403)
    if not os.path.isfile(full_path):
        abort(404)
    
    return send_from_directory("../", filename)

def allowed_file(filename):
    """
    Checks that file extension is a valid image file extension.

    Args: filename.
    
    Returns: bool
        
    """
    ALLOWED_EXTENSIONS = current_app.config['ALLOWED_EXTENSIONS']
    
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
           
@bp.route('/MLApp/data/user_uploaded_test/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    """
    Serves uploaded files.

    Args: filename.
    
    Returns: send_from_directory('../'+UPLOAD_FOLDER, filename)
    """
    SAFE_DIR = os.path.join(os.getcwd(), 'MLApp', 'data', 'user_uploaded_test') 
    UPLOAD_FOLDER = current_app.config['UPLOAD_FOLDER']
    full_path = os.path.realpath(os.path.join(SAFE_DIR, filename))
    if not full_path.startswith(SAFE_DIR):
        abort(403)
    if not os.path.isfile(full_path):
        abort(404)
    return send_from_directory('../'+UPLOAD_FOLDER, filename)