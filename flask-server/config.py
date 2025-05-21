import os
"""
Server config file, defines a Config class that stores various variables for the server.
"""
BASE_DIR = os.path.abspath(os.getcwd())
DATABASE_PATH = os.path.join(BASE_DIR, "MLApp", "data", "data.db")
DATASETS_DIR_PATH = os.path.join(BASE_DIR, "MLApp", "data", "training_datasets")
UPLOAD_FOLDER = os.path.join("MLApp", "data", "user_uploaded_test")
class Config:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    UPLOAD_FOLDER = UPLOAD_FOLDER
    DATABASE_PATH = DATABASE_PATH
    DATASETS_DIR_PATH = DATASETS_DIR_PATH
    MAX_CONTENT_LENGTH = 20 * 1024 * 1024
