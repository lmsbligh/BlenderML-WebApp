import os
import math
import json
import sqlite3

from MLApp.data_generator.prop_generator import gen_props_json


def save_dataset_props(split_dir, generate_profile, split):
    size = 0
    # print("save_datgaset_props: datasetSize type: ",type(generate_profile['datasetSize']))
    # print("save_datgaset_props: datasetSize type: ",type(generate_profile['datasetSize']))
    # print("save_datgaset_props: datasetSize type: ",type(generate_profile['datasetSize']))
    match split:
        case "train":
            size = math.ceil(float(generate_profile['datasetSize'])*((100 - float(
                float(generate_profile['TestSetPercentage'])) - float(generate_profile['CVPercentage']))/100))
        case "CV":
            size = math.ceil(
                float(generate_profile['datasetSize'])*(float(generate_profile['CVPercentage'])/100))
        case "test":
            size = math.ceil(
                float(generate_profile['datasetSize'])*(float(generate_profile['TestSetPercentage'])/100))

    gen_props_json(split_dir, size)

    with open(os.path.join(split_dir, "props", "scene_props.json"), 'w+') as file:
        # try:
        #     file_data = json.load(file) if file_exists and file.read().strip() else []
        # except json.JSONDecodeError:
        #     file_data = []  # If there's an error, just use an empty dictionary

        json.dump(generate_profile, file)


def add_dataset_db(dataset_value, db_path, generate_profile, split):

    con = sqlite3.connect(db_path)
    cur = con.cursor()
    dataset_size = 0
    match split:
        case 'train':
            dataset_size = math.ceil(float(generate_profile['datasetSize'])*((100 - float(
                float(generate_profile['TestSetPercentage'])) - float(generate_profile['CVPercentage']))/100))
        case 'CV':
            dataset_size = math.ceil(
                float(generate_profile['datasetSize'])*(float(generate_profile['CVPercentage'])/100))
        case 'test':
            dataset_size = math.ceil(
                float(generate_profile['datasetSize'])*(float(generate_profile['TestSetPercentage'])/100))

    # cur.execute("DROP TABLE datasets")
    # cur.execute("CREATE TABLE datasets (value TEXT UNIQUE, datasetName TEXT, datasetSize INTEGER, description TEXT, imageHeight INTEGER, imageWidth INTEGER, meshes TEXT, randomOrientation TEXT, skyboxPath TEXT)")
    sql = ("INSERT INTO datasets (value, datasetName, split, datasetSize, description, imageHeight, imageWidth, randomOrientation) "
           "VALUES (?, ?, ?, ?, ?, ?, ?, ?) "
           "ON CONFLICT(value) DO UPDATE SET "
           "datasetName = excluded.datasetName, "
           "split = excluded.split, "
           "datasetSize = excluded.datasetSize, "
           "description = excluded.description, "
           "imageHeight = excluded.imageHeight, "
           "imageWidth = excluded.imageWidth, "
           "randomOrientation = excluded.randomOrientation;")
    cur.execute(sql, (dataset_value,
                      generate_profile['datasetName'],
                      split,
                      dataset_size,
                      generate_profile['description'],
                      generate_profile['imageHeight'],
                      generate_profile['imageWidth'],
                      generate_profile['randomOrientation']
                      )
                )
    con.commit()
    con.close()
