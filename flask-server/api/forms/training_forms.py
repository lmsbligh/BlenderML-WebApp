TRAINING_FORM = {
        "model": {
            "data_type": str,
            "regex": r"^[A-Za-z0-9 -]{1,15}$",
            "required": True,
            "helper": "Please select a model."
        },
        "checkpoint": {
            "data_type": str,
            "regex": r"^[A-Za-z0-9 -.]{1,30}$",
            "required": True,
            "helper": "Please select a checkpoint."
        },
        "dataset": {
            "data_type": str,
            "regex": r"^[A-Za-z0-9 -]{1,30}$",
            "required": True,
            "helper": "Please select a dataset."
        },
        "epochs": {
            "data_type": int,
            "regex": r"^(?:[1-9]\d{0,2}|1000)$",
            "required": True,
            "helper": "Please enter an integer between 1 and 1000."
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
        "xVal": {
            "data_type": int,
            "regex": r"^(?:[0-9]\d?|99)$",
            "required": True,
            "helper": "Please enter an integer between 1 and 99"
        },
    }