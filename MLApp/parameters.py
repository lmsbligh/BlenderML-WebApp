import os
import torch
import torch.optim as optim
from torch import nn


BATCH_SIZE = 20
EPOCHS = 1
LEARNING_RATE = 0.01
TRAINING_SET_SIZE = 5000
VALIDATION_SET_SIZE = 1500
TEST_SET_SIZE = 1500
#loss_function = nn.L1Loss()
DATABASE_PATH = os.path.join(os.getcwd(), "MLApp", "data", "data.db")
DATA_PATH = os.path.join(os.getcwd(), "MLApp", "data")
OPTIMIZER = optim.Adam
#add ability to locate Blender executable or autodetect it
#blender_executable = r"C:\Program Files\Blender Foundation\Blender 3.4\blender.exe"
blender_executable = "/Applications/Blender.app/Contents/MacOS/Blender"
train_dir = os.path.join("data", "train")
val_dir = os.path.join("data", "val")
test_dir = os.path.join("data", "test")
#render_data_script = "\\blender_scripts\\render_data.py"
render_data_script = os.path.join("blender_scripts", "render_data.py")
device = (
    "cuda"
    if torch.cuda.is_available()
    else "mps"
    if torch.backends.mps.is_available()
    else "cpu"
)

state_dict_dir = os.path.join(os.getcwd(), "MLApp", "data", "models")
state_dict_path = os.path.join("data", "models", "model_checkpoint2.pth")