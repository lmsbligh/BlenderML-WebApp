import json
from flask import Blueprint, current_app, jsonify, request
from ..utils import validate_form
from ..forms.training_forms import TRAINING_FORM

bp = Blueprint('training', __name__)

@bp.route('/submit_training', methods=["POST"])
def submit_training():
    """
    Submits training form to the server.
    
    Route: /submit_training
    
    Args: request/JSON.
    
    Returns: 
        - 200 - Success
        - 400 - Error
    """
    training_form = json.loads(request.data.decode("utf-8"))
    print("training_form: ", training_form)
    try:
        validate_form(training_form, TRAINING_FORM)
    except ValueError as ve:
        print(jsonify({"error": str(ve)}), 400)
        return jsonify({"error": str(ve)}), 400
    print("!!Training ran but disabled.")
    print(training_form)
    #flask_train(training_form)
    
    return jsonify({"body": "Training request received successfully."}), 200