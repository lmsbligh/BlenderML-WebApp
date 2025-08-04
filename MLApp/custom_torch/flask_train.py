import os
import time
import json
import sqlite3
import uuid

import torch
import torch.optim as optim
from torch import nn
from torchvision import transforms
from torch.utils.data import DataLoader

from flask_server.sockets import socketio
from MLApp.custom_torch.image_dataset import ImageDataset
from MLApp.custom_torch.custom_net import CustomNet

from MLApp.parameters import OPTIMIZER, state_dict_dir, DATABASE_PATH
from MLApp.parameters import state_dict_dir
from MLApp.parameters import device

from MLApp.custom_torch.target_loader import target_loader

training_cancelled = False


def cancel_training():
    global training_cancelled
    training_cancelled = True


def train(training_form):
    """
    Simple training loop using parameters from the training_form, saves a checkpoint.
    """
    print(training_form)
    global training_cancelled
    session_id = time.strftime('%d-%m-%Y-%H%M-%S')
    training_cancelled = False  # reset at start
    # dataset = training_form['dataset']
    epochs = int(training_form['epochs'])
    learning_rate = float(training_form['learningRate'])
    optimiser = training_form['optimizer']
    loss_function = training_form['lossFunction']
    batch_size = training_form['batchSize']

    training_datasets_path = os.path.join(
        os.getcwd(), "MLApp", "data", "training_datasets")

    training_dataset_dir = os.path.join(training_datasets_path, training_form['trainDataset'][:training_form['trainDataset'].find('-')],
                                        training_form['trainDataset'][9:27], "train") if training_form['trainDataset'] else None
    # dataset_dir = os.path.join(os.getcwd(),"MLApp", "data", "training_datasets", dataset_profile, dataset_date_time)
    CV_dataset_dir = os.path.join(training_datasets_path, training_form['CVDataset'][:training_form['CVDataset'].find('-')],
                                  training_form['CVDataset'][9:27], "CV") if training_form['CVDataset'] else None
    test_dataset_dir = os.path.join(training_datasets_path, training_form['testDataset'][:training_form['testDataset'].find('-')],
                                    training_form['testDataset'][9:27], "test") if training_form['testDataset'] else None
    transform = transforms.Compose(
        [transforms.ToTensor(), transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])

    print("training_dataset_dir: ", training_dataset_dir)
    print("CV_dataset_dir: ", CV_dataset_dir)
    print("test_dataset_dir: ", test_dataset_dir)
    training_data_loader = gen_dataloader(
        training_dataset_dir, transform) if training_dataset_dir and os.path.exists(training_dataset_dir) else None
    CV_data_loader = gen_dataloader(
        CV_dataset_dir, transform) if CV_dataset_dir and os.path.exists(CV_dataset_dir) else None
    test_data_loader = gen_dataloader(
        test_dataset_dir, transform) if test_dataset_dir and os.path.exists(test_dataset_dir) else None

    for checkpoint in training_form['checkpoints']:
        print("Checkpoint/model for loop.")
        model_id = checkpoint['modelId']
        model_checkpoint = checkpoint['checkpointId']

        # dataset_profile = dataset[:dataset.find('-')]
        # dataset_date_time = dataset[dataset.find('-')+1:]

        if (training_data_loader):
            training_loop(session_id, training_form['trainDataset'], epochs, model_id, model_checkpoint,
                          learning_rate, training_data_loader, loss_function, optimiser, batch_size)
            if (model_checkpoint == '-1'):
                model_checkpoint = session_id

        if (CV_data_loader):
            test_loop(session_id, training_form['CVDataset'], model_id, model_checkpoint,
                      CV_data_loader, loss_function, "CV")

        if (test_data_loader):
            test_loop(session_id, training_form['testDataset'], model_id, model_checkpoint,
                      test_data_loader, loss_function, "test")


def training_loop(session_id, dataset_id, epochs, model_id, model_checkpoint, learning_rate, data_loader, loss_function, optimiser, batch_size):
    checkpoint_id = uuid.uuid4().hex[:8]
    training_run_id = f"{checkpoint_id}-{session_id}-train"
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
    if (model_checkpoint and model_checkpoint != "-1"):
        state_dict_path = os.path.join(
            "MLApp", state_dict_dir, model_id, model_checkpoint)
        model.load_state_dict(torch.load(state_dict_path+".pth"))
        model_checkpoint = model_checkpoint.replace(".pth", "")

    optimiser_instance = optimiser
    loss_instance = loss_function
    match optimiser:
        case 'Gradient descent':
            optimiser_instance = optim.SGD(
                model.parameters(), lr=learning_rate)
        case 'ADAM':
            optimiser_instance = optim.Adam(
                model.parameters(), lr=learning_rate)
    match loss_function:
        case 'MSE':
            loss_instance = nn.MSELoss()
        case 'MAE':
            loss_instance = nn.L1Loss()
    training_data = []
    dataset_size = len(data_loader.dataset)
    for epoch in range(epochs):  # loop over the dataset
        running_loss = 0.0
        print(f"Epoch: {epoch}/{epochs}")
        for i, data in enumerate(data_loader, 0):
            if training_cancelled:
                socketio.emit("training_cancelled", {
                              "message": "Training cancelled by user."})
                return
            # get the inputs; data is a list of [inputs, labels]
            inputs, labels = data

            # zero the parameter gradients
            optimiser_instance.zero_grad()

            # forward + backward + optimize
            outputs = model(inputs)
            loss = loss_instance(outputs, labels)
            loss.backward()
            optimiser_instance.step()

            # print statistics
            running_loss += loss.item()
            if i % batch_size == batch_size - 1:
                print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 20:.6f}')
                running_loss = 0.0
                batch_data = {
                    'datasetSize': dataset_size,
                    'epoch': epoch + 1,
                    'batch': i + 1,
                    'loss': loss.item()
                }
                training_data.append(
                    (training_run_id, epoch+1, i + 1, loss.item()))
                socketio.emit('training_update', batch_data)
                socketio.sleep(0.01)
    # add some functionality to save training data
    if (model_checkpoint == "-1"):
        model_checkpoint = None
    try:
        print("model_id: ", model_id)
        con = sqlite3.connect(DATABASE_PATH)
        cur = con.cursor()
        cur.execute("""INSERT INTO training_runs (
                        id,
                        model_id,
                        base_checkpoint,
                        training_dataset,
                        cv_dataset,
                        test_dataset,
                        optimiser,
                        loss_function,
                        learning_rate,
                        epochs,
                        batch_size,
                        session_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        training_run_id,
                        model_id,
                        model_checkpoint,
                        dataset_id if dataset_id else None,
                        None,
                        None,
                        optimiser,
                        loss_function,
                        learning_rate,
                        epochs,
                        batch_size,
                        session_id
                    ))
        con.commit()
        with con:
            cur.executemany("""
                INSERT INTO training_metrics (run_id, epoch, batch, loss)
                VALUES (?, ?, ?, ?)
                """, training_data)
        con.commit()
        con.close()

    except sqlite3.Error as e:
        print("Database error:", e)
    finally:
        con.close()
    print('Finished Training')

    try:
        con = sqlite3.connect(DATABASE_PATH)
        # Ensure foreign keys are enforced
        con.execute("PRAGMA foreign_keys = ON;")
        cursor = con.cursor()

        cursor.execute("""
            INSERT INTO checkpoints (
                id, parent_id, model_id, training_run_id, name, description, final_loss, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            checkpoint_id,
            model_checkpoint,
            model_id,
            training_run_id,
            None,
            None,
            training_data[-1][3],
            session_id
        ))

        con.commit()
        print("Checkpoint inserted successfully.")

    except sqlite3.Error as e:
        print("Database error:", e)

    finally:
        con.close()
    state_filename = checkpoint_id
    try:
        os.mkdir(os.path.join("MLApp", state_dict_dir, model_id))
    except OSError as e:
        print("OSError: ", e)
    save_state_path = os.path.join(
        "MLApp", state_dict_dir, model_id, state_filename+".pth")
    torch.save(model.state_dict(), save_state_path)


def test_loop(session_id, dataset_id, model_id, model_checkpoint, data_loader, loss_function, split):
    model_data = []
    run_id = f"{model_checkpoint}-{session_id}-{split}"
    loss_instance = loss_function
    match loss_function:
        case 'MSE':
            loss_instance = nn.MSELoss()
        case 'MAE':
            loss_instance = nn.L1Loss()
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
    state_dict_path = os.path.join(
        "MLApp", state_dict_dir, model_id, model_checkpoint)
    model.load_state_dict(torch.load(state_dict_path+".pth"))
    total_loss = 0.0
    for i, data in enumerate(data_loader, 0):
        # get the inputs; data is a list of [inputs, labels]
        inputs, labels = data

        outputs = model(inputs)
        loss = loss_instance(outputs, labels)
        # loss.backward()

        total_loss += loss.item()
    print(f'{split} total_loss: {total_loss / len(data_loader):.6f}')
    try:
        print("model_id: ", model_id)
        con = sqlite3.connect(DATABASE_PATH)
        cur = con.cursor()
        cur.execute("""INSERT INTO training_runs (
                        id,
                        model_id,
                        base_checkpoint,
                        training_dataset,
                        cv_dataset,
                        test_dataset,
                        optimiser,
                        loss_function,
                        learning_rate,
                        epochs,
                        session_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        run_id,
                        model_id,
                        model_checkpoint,
                        None,
                        dataset_id if split == "CV" else None,
                        dataset_id if split == "test" else None,
                        None,
                        loss_function,
                        None,
                        None,
                        session_id
                    ))
        con.commit()
        with con:
            cur.execute("""
                INSERT INTO training_metrics (run_id, epoch, batch, loss)
                VALUES (?, ?, ?, ?)
                """, (run_id, None, None, total_loss / len(data_loader)))
        con.commit()
        con.close()

    except sqlite3.Error as e:
        print("Database error:", e)
    finally:
        con.close()


def gen_dataloader(split_dir, transform):
    split_targets = target_loader(split_dir)
    split_dataset = ImageDataset(split_dir, split_targets, transform=transform)
    split_data_loader = DataLoader(split_dataset, shuffle=True)

    return split_data_loader
