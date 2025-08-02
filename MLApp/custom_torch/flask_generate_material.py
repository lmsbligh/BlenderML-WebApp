from MLApp.custom_torch.image_dataset import ImageDataset
from MLApp.custom_torch.custom_net import CustomNet
from MLApp.parameters import render_data_script, state_dict_path, state_dict_dir, device

import os
import time
import torch
from torchvision import transforms
from PIL import Image
import sqlite3
import json
from MLApp.parameters import DATABASE_PATH


def flask_generate_material(test_form, upload_folder):
    """Runs a forward pass of the model then compares then returns the parameters as json.

    test_size : int
        Allows for a subset of specific size to be tested, will also
        allow the image or image path itself to be returned.
    """
    image_path = test_form['image_path']
    model_id = test_form['model']
    model_checkpoint = test_form['checkpoint']
    transform = transforms.Compose(
        [transforms.ToTensor(), transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])

    image = Image.open(image_path).convert("RGB")
    image = transform(image)
    image = image.unsqueeze(0)
    image = image.cuda()
    image.to(device)
    model_data = []
    try:
        con = sqlite3.connect(DATABASE_PATH)
        con.row_factory = sqlite3.Row
        cur = con.cursor()

        query = "SELECT * FROM models WHERE value = ?"
        cur.execute(query, (model_id,))

        model_data = dict(cur.fetchone())

    except sqlite3.Error as e:
        print("Database error:", e)
    finally:
        con.close()

    model = CustomNet(json.loads(model_data['layers']))
    model.to(device)
    state_dict_path = os.path.join(
        "MLApp", state_dict_dir, model_id, model_checkpoint + ".pth")
    model.load_state_dict(torch.load(state_dict_path))

    model.eval()
    with torch.no_grad():
        output = model(image).tolist()[0]
    output_dict = {"name": f"render_of_user_uploaded-{time.strftime('%d-%m-%Y-%H%M-%S')}",
                   "nodes['Principled BSDF'].inputs[0].default_value": [
                       output[0],
                       output[1],
                       output[2],
                       output[3],
                   ],
                   "nodes['Principled BSDF'].inputs[6].default_value": output[4],
                   "nodes['Principled BSDF'].inputs[9].default_value": output[5]
                   }
    return output_dict
