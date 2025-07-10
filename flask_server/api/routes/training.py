import json
import pprint
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


@bp.route("/checkpoint_test_sessions/<string:checkpoint_id>")
def checkpoint_test_sessions(checkpoint_id):
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    try:
        con.row_factory = sqlite3.Row  # enables name-based column access
        cur = con.cursor()
        cur.execute("PRAGMA foreign_keys = ON;")

        cur.execute("""
            SELECT * FROM training_runs WHERE checkpoint = ?
            AND (test_dataset IS NOT NULL OR cv_dataset IS NOT NULL)
            ORDER BY session_id ASC
        """, (checkpoint_id,))

        rows = cur.fetchall()
        # runs_as_dicts = [dict(row) for row in rows]
        # runs_as_dicts = [for row in runs_as_dicts]
        runs_as_dicts = [dict(row) for row in rows]

        print(runs_as_dicts)
        return runs_as_dicts

    except sqlite3.Error as e:
        print("Database error:", e)
        return json.dumps({"error": str(e)})
    finally:
        con.close()


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
            ORDER BY session_id ASC
        """)

        rows = cur.fetchall()
        # runs_as_dicts = [dict(row) for row in rows]
        # runs_as_dicts = [for row in runs_as_dicts]
        runs_as_dicts = []
        for row in rows:
            run = dict(row)
            run_id = run.get("id", "")
            # Extract the final part after the last hyphen
            split = run_id.split("-")[-1] if "-" in run_id else None
            run["split"] = split
            runs_as_dicts.append(run)

        print(runs_as_dicts)
        return runs_as_dicts

    except sqlite3.Error as e:
        print("Database error:", e)
        return json.dumps({"error": str(e)})
    finally:
        con.close()
    return res


@bp.route("/training_metrics/<string:run_id>", methods=["GET"])
def training_metrics(run_id):
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()

    try:
        con.row_factory = sqlite3.Row  # enables name-based column access
        cur = con.cursor()
        cur.execute("PRAGMA foreign_keys = ON;")

        cur.execute("""
            SELECT epoch, batch, loss FROM training_metrics 
            WHERE run_id = ?
            ORDER BY epoch ASC, batch ASC
        """, (run_id,))

        rows = cur.fetchall()
        metrics_as_dict = [dict(row) for row in rows]
        rows_step = [{"step": f"E{row['epoch']}-B{row['batch']}",
                      "loss": row['loss']} for row in metrics_as_dict]
        # print(metrics_as_dicts)

        cur = con.cursor()
        cur.execute("""
            SELECT epochs, batch_size, training_dataset FROM training_runs
            WHERE id = ?
                    """, (run_id,))
        rows = cur.fetchall()
        params_as_dict = [dict(row) for row in rows]
        print(params_as_dict)

        dataset_size = 0
        if params_as_dict[0]['training_dataset'] is not None:
            cur = con.cursor()
            cur.execute("""
                SELECT datasetSize FROM datasets
                WHERE value = ?
                        """, (params_as_dict[0]['training_dataset'],))
            rows = cur.fetchall()
            dataset_size = [dict(row) for row in rows][0]['datasetSize']

        print({"run_id": run_id, "data": rows_step})
        return {"runId": run_id,
                "batchSize": params_as_dict[0]['batch_size'],
                "epochs": params_as_dict[0]['epochs'],
                "data": rows_step,
                "datasetSize": dataset_size
                }

    except sqlite3.Error as e:
        print("Database error:", e)
        return json.dumps({"error": str(e)})
    finally:
        con.close()
    return res


@bp.route("/training_tree/<string:checkpoint_id>", methods=["GET"])
def training_tree(checkpoint_id):
    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row

    training_runs_past = []
    MAX_DEPTH = 50

    def past_training_runs_query(chkpt_id, depth=0):
        cur = con.cursor()
        if not chkpt_id.strip():
            return
        if depth > MAX_DEPTH:
            print("Max recursion depth hit")
            return
        try:
            print(f"Len == {len(training_runs_past)}")
            cur.execute("""
                SELECT * FROM training_runs
                WHERE INSTR(id, ?) > 0
            """, (chkpt_id,))

            rows = cur.fetchall()
            runs_as_dict = [dict(row) for row in rows]

            if len(runs_as_dict) == 1:

                training_runs_past.append(runs_as_dict[0])
                pprint.pprint(f"Recursing: {chkpt_id}, depth: {depth},  row: ")
                pprint.pprint(runs_as_dict)
                past_training_runs_query(
                    runs_as_dict[0]['checkpoint'], depth+1)

        except sqlite3.Error as e:
            print("Database error:", e)
            return json.dumps({"error": str(e)})

    past_training_runs_query(checkpoint_id)
    return training_runs_past
