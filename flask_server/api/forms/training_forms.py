TRAINING_FORM = {
    "checkpoints": {
        "data_type": list,
        "regex": "",
        "required": False,
        "helper": "Please select a checkpoint."
    },
    "trainDataset": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,36}$",
        "required": False,
        "helper": "Please select a training dataset."
    },
    "CVDataset": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,36}$",
        "required": False,
        "helper": "Please select a CV dataset."
    },
    "testDataset": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,36}$",
        "required": False,
        "helper": "Please select a test dataset."
    },
    "epochs": {
        "data_type": int,
        "regex": r"^(?:[1-9]\d{0,2}|1000)$",
        "required": True,
        "helper": "Please enter an integer between 1 and 1000."
    },
    "batchSize": {
        "data_type": int,
        "regex": r"^(?:[1-9]\d{0,2}|1000)$",
        "required": True,
        "helper": "Batch size cannot be bigger than the size of the training dataset."
    },
    "learningRate": {
        "data_type": float,
        "regex": r"^0.(?:1|(?:0[1-9]|10)|(?:00[1-9]|0[1-9]\d|100)|(?:000[1-9]|00[1-9]\d|0[1-9]\d{2}|1000))$",
        "required": True,
        "helper": "Please enter a number between 0.1 and 0.0001, with up to 4 decimal places."
    },
    "optimizer": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,30}$",
        "required": True,
        "helper": "Please select an optimizer"
    },
    "lossFunction": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,30}$",
        "required": True,
        "helper": "Please select a loss function"

    },
}

CHECKPOINTS = {"checkpoint": {
    "data_type": dict,
    "keys": ["modelId", "checkpointId"],
    "regex": "",
    "required": False,
    "helper": "Please select a dataset"
}}
