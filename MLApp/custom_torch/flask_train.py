import os
import time
import json
import sqlite3

import torch
import torch.optim as optim
from torch import nn
from torchvision import transforms
from torch.utils.data import DataLoader

from MLApp.custom_torch.image_dataset import ImageDataset
from MLApp.custom_torch.custom_net import CustomNet

from MLApp.parameters import OPTIMIZER, state_dict_dir, DATABASE_PATH
from MLApp.parameters import state_dict_dir
from MLApp.parameters import device

from MLApp.custom_torch.target_loader import target_loader

def train(training_form):
    """
    Simple training loop using parameters from the training_form, saves a checkpoint.
    """
    print(training_form)
    # dataset = training_form['dataset']
    epochs = int(training_form['epochs'])
    learning_rate = float(training_form['learningRate'])
    optimiser = training_form['optimizer']
    loss = training_form['lossFunction']
    
    match optimiser:
        case 'Gradient descent':
            optimiser = optim.SGD
        case 'ADAM':
            optimiser = optim.Adam
    match loss:
        case 'MSE':
            loss_function = nn.MSELoss()
        case 'MAE':
            loss_function = nn.L1Loss()
    model_id = training_form['model']
    model_checkpoint = training_form['checkpoint']
    
    # dataset_profile = dataset[:dataset.find('-')]
    # dataset_date_time = dataset[dataset.find('-')+1:]
    
    training_datasets_path = os.path.join(os.getcwd(),"MLApp", "data", "training_datasets")
    # dataset_dir = os.path.join(os.getcwd(),"MLApp", "data", "training_datasets", dataset_profile, dataset_date_time)
    
    training_dataset_dir = os.path.join(training_datasets_path, training_form['trainingDataset'][:training_form['trainingDataset'].find('-')], 
                                        training_form['trainingDataset'][9:27], "train") if training_form['trainingDataset'] else None
    CV_dataset_dir = os.path.join(training_datasets_path, training_form['CVDataset'][:training_form['CVDataset'].find('-')], 
                                        training_form['CVDataset'][9:27], "CV") if training_form['CVDataset'] else None
    test_dataset_dir = os.path.join(training_datasets_path, training_form['testDataset'][:training_form['testDataset'].find('-')], 
                                        training_form['testDataset'][9:27], "test") if training_form['testDataset'] else None

    print("training_dataset_dir: ", training_dataset_dir)
    print("CV_dataset_dir: ", CV_dataset_dir)
    print("test_dataset_dir: ", test_dataset_dir)
    
    transform = transforms.Compose([transforms.ToTensor(),transforms.Normalize((0.5,0.5,0.5), (0.5,0.5,0.5))])

    
    training_data_loader = gen_dataloader(training_dataset_dir, transform) if training_dataset_dir and os.path.exists(training_dataset_dir) else None
    CV_data_loader = gen_dataloader(CV_dataset_dir, transform) if CV_dataset_dir and os.path.exists(CV_dataset_dir) else None
    test_data_loader = gen_dataloader(test_dataset_dir, transform) if test_dataset_dir and os.path.exists(test_dataset_dir) else None
    
    if (training_data_loader):
        training_loop(epochs, model_id, model_checkpoint, learning_rate, training_data_loader, loss_function)
    
    if (CV_data_loader):
        test_loop(model_id, model_checkpoint, CV_data_loader, loss_function, "CV")
    
    if (test_data_loader):
        test_loop(model_id, model_checkpoint, test_data_loader, loss_function, "test")


def training_loop(epochs, model_id, model_checkpoint, learning_rate, data_loader, loss_function):
    model_data = []
    try:
        print("model_id: ", model_id)
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
    state_dict_path = os.path.join("MLApp", state_dict_dir, model_id, model_checkpoint)
    model.load_state_dict(torch.load(state_dict_path))
    
    for epoch in range(epochs):  # loop over the dataset
        optim_instance = OPTIMIZER(model.parameters(), lr=learning_rate)
        running_loss = 0.0
        print(f"Epoch: {epoch}/{epochs}")
        for i, data in enumerate(data_loader, 0):
            # get the inputs; data is a list of [inputs, labels]
            inputs, labels = data

            # zero the parameter gradients
            optim_instance.zero_grad()

            # forward + backward + optimize
            outputs = model(inputs)
            loss = loss_function(outputs, labels)
            loss.backward()
            optim_instance.step()

            # print statistics
            running_loss += loss.item()
            if i % 20 == 19:    # print every 20 mini-batches
                print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 20:.6f}')
                running_loss = 0.0
    print('Finished Training')
    
    state_filename = time.strftime('%d-%m-%Y-%H%M-%S')
    try:
        os.mkdir(os.path.join("MLApp", state_dict_dir, model_id))
    except OSError as e:
        print("OSError: ", e)
    save_state_path = os.path.join("MLApp", state_dict_dir, model_id, state_filename+".pth")
    torch.save(model.state_dict(), save_state_path)
    
def test_loop(model_id, model_checkpoint, data_loader, loss_function, split):
    model_data = []
    try:
        print("model_id: ", model_id)
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
    state_dict_path = os.path.join("MLApp", state_dict_dir, model_id, model_checkpoint)
    model.load_state_dict(torch.load(state_dict_path))
    total_loss = 0.0
    for i, data in enumerate(data_loader, 0):
            # get the inputs; data is a list of [inputs, labels]
            inputs, labels = data

            outputs = model(inputs)
            loss = loss_function(outputs, labels)
            # loss.backward()

            total_loss += loss.item()
    print(f'{split} total_loss: {total_loss / len(data_loader):.6f}')
    
def gen_dataloader(split_dir, transform):
    split_targets = target_loader(split_dir)
    split_dataset = ImageDataset(split_dir, split_targets ,transform=transform) 
    split_data_loader = DataLoader(split_dataset, shuffle=True)

    return split_data_loader

