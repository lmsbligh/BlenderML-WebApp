import json
import os
import shutil
from flask import Blueprint, abort, current_app, jsonify, request
from ..forms.model_forms import MODEL_FORM, LAYER_FORM, CHECKPOINT_FORM
from ..utils import validate_form
import sqlite3


bp = Blueprint('models', __name__)


@bp.route("/layer_types")
def get_layer_types():
    """
    Fetches layer_types.

    Route: /layer_types.

    Returns: List of layer type JSONs.

    """
    return [{"value": 1, "layer_type": 'Dense'},
            {"value": 2, "layer_type": 'CNN'},
            {"value": 3, "layer_type": 'Pooling'}]


@bp.route("/activation_types")
def get_activation_types():
    """
    Fetches activation types.

    Route: /activation_types.

    Returns: List of activation type JSONs.
    """
    return [{"value": 1, "activation": 'Linear'},
            {"value": 2, "activation": 'ReLU'},
            {"value": 3, "activation": 'Heaviside'},
            {"value": 4, "activation": 'Sigmoid'},
            {"value": 5, "activation": 'None'}]


@bp.route("/models")
def get_models():
    """
    Fetches available models.

    Route: /models.

    Returns: List model in JSONs.
    """
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
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


@bp.route('/submit_model', methods=["POST"])
def submit_model():
    """
    POSTs model to server.

    Route: /submit_model

    returns:
        - 200 - Success
        - 400 - Error
    """
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()

    model_to_save = json.loads(request.data.decode('utf-8'))
    try:
        print("model_to_save: ", model_to_save)
        validate_form(model_to_save, MODEL_FORM)
    except ValueError as ve:
        print(jsonify({"error": str(ve)}), 400)
        return jsonify({"error": str(ve)}), 400
    print(model_to_save)
    ind, model = next(
        ((ind, model) for ind, model in enumerate(MODELS_LIST)
         if (model["value"] == model_to_save["value"])),
        (None, None))
    if (ind):
        MODELS_LIST[ind] = model_to_save
    else:
        MODELS_LIST.append(model_to_save)
    cur.execute('INSERT INTO models (value, modelName, input, output, description, layers) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(value) DO UPDATE SET modelName = excluded.modelName, input = excluded.input, output = excluded.output, description = excluded.description, layers = excluded.layers;',
                (model_to_save['value'], model_to_save['modelName'], model_to_save['input'], model_to_save['output'], model_to_save['description'], json.dumps(model_to_save['layers'])))
    con.commit()
    con.close()
    return jsonify({"body": "success!"}), 200


@bp.route('/delete_model', methods=["POST"])
def delete_model():
    """
    POSTs model JSON for deletion to server.

    Route: /delete_model

    returns:
        - 200 - Success
        - 400 - Error
    """

    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    MODELS_DIR_PATH = current_app.config["MODELS_DIR_PATH"]
    model_to_del = json.loads(request.data.decode('utf-8'))
    model_full_path = os.path.join(MODELS_DIR_PATH, model_to_del["value"])
    try:
        ind, model = next(
            ((ind, model) for ind, model in enumerate(MODELS_LIST)
             if (model["value"] == model_to_del["value"])),
            (None, None))
        if (ind != None):
            con = sqlite3.connect(DATABASE_PATH)
            cur = con.cursor()
            cur.execute('DELETE FROM models WHERE value = ?',
                        (model_to_del["value"],))
            con.commit()
            con.close()
            del MODELS_LIST[ind]
        else:
            raise Exception("Error: no model existed with this ID")
        if not model_full_path.startswith(MODELS_DIR_PATH):
            print(
                f"error, path {model_full_path} is not within models folder.")
            abort(403)
        else:
            print(f"deleting dir: {model_full_path}")
            shutil.rmtree(model_full_path)
    except Exception as e:
        return jsonify({"error": f"{str(e)}"})

    return jsonify({"body": "success!"}), 200


@bp.route('/checkpoints/<string:model_id>')
def get_checkpoints(model_id):
    """
    Fetches available checkpoints for a given model.

    Route: /model_id

    Args:
        model_id.

    Returns: List of checkpoints.
    """
    # checkpoint_dir = os.path.join("MLApp", "data", "models", model_id)
    # if os.path.isdir(checkpoint_dir):
    #     checkpoints = os.listdir(checkpoint_dir)
    #     return checkpoints
    # else:
    #     return []

    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    global MODELS_LIST

    print("DATABASE_PATH", DATABASE_PATH)
    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()

    try:
        cur.execute("""
        SELECT * FROM checkpoints
        WHERE model_id = ?
        """, (model_id,))
        rows = cur.fetchall()
        data = []
        for row in rows:
            row_dict = dict(row)
            data.append(row_dict)
        data.reverse()
        return data

    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        con.close()


@bp.route('/delete_checkpoint/<string:model_ID>/<string:checkpoint_ID>', methods=["POST"])
def delete_dataset(model_ID, checkpoint_ID):
    MODELS_DIR_PATH = current_app.config["MODELS_DIR_PATH"]
    checkpoint_full_path = os.path.realpath(
        os.path.join(MODELS_DIR_PATH, model_ID, checkpoint_ID))

    try:
        if not checkpoint_full_path.startswith(MODELS_DIR_PATH):
            print(
                f"error, path {checkpoint_full_path} is not within datasets folder!!")
            abort(403)
        else:
            print(f"deleting file: {checkpoint_full_path}")
            os.remove(checkpoint_full_path)
    except Exception as e:
        return jsonify({"error": f"{str(e)}"})

    return jsonify({"body": "Checkpoint deleted successfully!"}), 200


@bp.route('/checkpoint_update_fields/<string:checkpoint_ID>', methods=["POST"])
def checkpoint_update_fields(checkpoint_ID):
    DATABASE_PATH = current_app.config["DATABASE_PATH"]
    global MODELS_LIST

    print("DATABASE_PATH", DATABASE_PATH)
    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row  # Allows row to be treated as a dictionary
    cur = con.cursor()

    fields_to_save = json.loads(request.data.decode('utf-8'))

    name = fields_to_save['name']
    description = fields_to_save['description']

    try:
        print("checkpoint fields_to_save: ", fields_to_save)
        validate_form(fields_to_save, CHECKPOINT_FORM)
    except ValueError as ve:
        print(jsonify({"error": str(ve)}), 400)
        return jsonify({"error": str(ve)}), 400

    try:
        cur.execute("""
            UPDATE checkpoints
            SET name = ?, description = ?
            WHERE id = ?
        """, (name, description, checkpoint_ID))

    except sqlite3.Error as e:
        print("Database error:", e)
        return None
    finally:
        con.commit()
        con.close()
