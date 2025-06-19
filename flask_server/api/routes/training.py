import json
import sqlite3
from flask import Blueprint, current_app, jsonify, request

from MLApp.custom_torch.flask_train import train, cancel_training
from MLApp.parameters import DATABASE_PATH
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
    except Exception as ve:
        print(jsonify({"error": str(ve)}), 400)
        return jsonify({"error": str(ve)}), 400
    # print(training_form)
    train(training_form)
    return jsonify({"body": "Training request received successfully."}), 200


@bp.route("/cancel_training", methods=["POST"])
def cancel_training_route():
    cancel_training()
    return {"status": "cancelled"}, 200


@bp.route("/training_sessions", methods=["GET"])
def training_sessions():
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()

    try:
        con.row_factory = sqlite3.Row  # enables name-based column access
        cur = con.cursor()
        cur.execute("PRAGMA foreign_keys = ON;")

        cur.execute("""
            SELECT * FROM training_runs
            ORDER BY id ASC
        """)

        rows = cur.fetchall()
        runs_as_dicts = [dict(row) for row in rows]
        print(runs_as_dicts)
        return runs_as_dicts

    except sqlite3.Error as e:
        print("Database error:", e)
        return json.dumps({"error": str(e)})
    finally:
        con.close()
    return res
