
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # Adds WebApp root to path

from flask import Flask, jsonify
from config import Config
from api.routes import datasets, models, training, material_generation


app = Flask(__name__)
app.config.from_object(Config)

app.register_blueprint(datasets.bp)
app.register_blueprint(models.bp)
app.register_blueprint(training.bp)
app.register_blueprint(material_generation.bp)

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File is too large. Maximum allowed size is 20MB."}), 413

if __name__ == "__main__":
        app.run(debug=True)


    
