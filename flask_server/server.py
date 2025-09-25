import os

import eventlet
eventlet.monkey_patch()
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # Adds WebApp root to path

from flask import Flask, jsonify
from flask_server.sockets import socketio

from config import Config
from api.routes import datasets, models, training, material_generation


from flask_cors import CORS
app = Flask(__name__)
CORS(app)

socketio.init_app(app)
app.config.from_object(Config)

app.register_blueprint(datasets.bp)
app.register_blueprint(models.bp)
app.register_blueprint(training.bp)
app.register_blueprint(material_generation.bp)

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File is too large. Maximum allowed size is 20MB."}), 413
@socketio.on('connect')
def handle_connect():
    print("✅ Client connected")
if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    # app.run(debug=True, use_reloader=True)


    
