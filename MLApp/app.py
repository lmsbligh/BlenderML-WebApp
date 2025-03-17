import os
import json
import matplotlib.pyplot as plt
from PIL import Image

import torch
from torchvision import transforms
from torch.utils.data import DataLoader

from custom_nn.custom_nn import Net, image_dataset
from data_generator.prop_generator import gen_props_json, write_props_json
from blender_scripts.blender_launcher import launch_blender

from parameters import BATCH_SIZE, train_dir, val_dir, test_dir
from parameters import TRAINING_SET_SIZE, VALIDATION_SET_SIZE, TEST_SET_SIZE
from parameters import render_data_script, state_dict_path, state_dict_dir
from parameters import device

from custom_nn.target_loader import target_loader
from custom_nn.train import train
from custom_nn.test import test
from utils.utils import compare_images, load_from_dir, select_image_dir


"""Main app, this file changes a lot as it's the main interface
with the neural net and other blender scripts. A lot of stuff is 
defined here that will eventually be housed elsewhere.
"""
# generate 3 categories of prop (train, val, test)

#gen_props_json(train_dir, TRAINING_SET_SIZE)
#gen_props_json(test_dir, VALIDATION_SET_SIZE)
#gen_props_json(val_dir, TEST_SET_SIZE)

# render data from these props

#launch_blender(data=train_dir, script=render_data_script)
#launch_blender(data=test_dir, script=render_data_script)
#launch_blender(data=val_dir, script=render_data_script)

# load training, cross validation and test data and targets

transform = transforms.Compose([transforms.ToTensor(),transforms.Normalize((0.5,0.5,0.5), (0.5,0.5,0.5))])

#train_targets = target_loader(train_dir)
#train_data_set = image_dataset('data\\train\\renders',train_targets,transform=transform)
#train_data_loader = DataLoader(train_data_set, batch_size=BATCH_SIZE, shuffle=True)

val_targets = target_loader(val_dir) 
val_data_set = image_dataset('data\\test\\renders',val_targets,transform=transform)
#val_data_loader = DataLoader(val_data_set, batch_size=1, shuffle=False)

# load neural net, define loss and optimizer

model = Net()
model.to(device)
#model.load_state_dict(torch.load(state_dict_path))

state_dicts_list = os.listdir(state_dict_dir)
for i, state_dicts in enumerate(state_dicts_list):
    print(i, state_dicts)

while True:
    try:
        state_dict_filename = state_dicts_list[int(input("Which state dict do you want to load?"))]
        break
    except:
        print("Invalid option, please try again")
print("state_dict_path set to: " + state_dict_path)   
model.load_state_dict(torch.load(os.path.join(state_dict_dir, state_dict_filename)))

# train nn on train props

train(model, data_loader=train_data_loader)

# test nn on test props
val_sub_set = val_data_set[:5]
val_sub_set_loader = DataLoader(val_sub_set, batch_size=1, shuffle=False)

val_sub_set_predictions = test(model, val_sub_set_loader)
write_props_json("data\\val\\pred",val_sub_set_predictions)
launch_blender(data=val_dir+"\\pred", script=render_data_script)

pred_render_dir = select_image_dir(val_dir+"\\pred\\renders")
#pred_render_paths = os.listdir(render_dir)
pred_render_images = load_from_dir(pred_render_dir)

compare_images(pred_render_images,val_sub_set)

