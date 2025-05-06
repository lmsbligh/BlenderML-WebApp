import os

BASE_DIR = os.path.abspath(os.getcwd())
DATABASE_PATH = os.path.join(BASE_DIR, "MLApp", "data", "data.db")
UPLOAD_FOLDER = os.path.join("MLApp", "data", "user_uploaded_test")

class Config:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    SECRET_KEY = 'asdjkfnasdouif2398r'
    UPLOAD_FOLDER = UPLOAD_FOLDER
    DATABASE_PATH = DATABASE_PATH
    MAX_CONTENT_LENGTH = 20 * 1024 * 1024
