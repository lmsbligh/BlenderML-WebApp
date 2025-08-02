MODEL_FORM = {
    "value":  {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{8}$",
        "required": True,
        "helper": "No ID value was provided."
    },
    "modelName": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,30}$",
        "required": True,
        "helper": "Please enter an alphanumeric name of up to 15 characters."
    },
    "description": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -,.:/]{1,150}$",
        "required": False,
        "helper": "Please enter an alphanumeric description of up to 150 characters."
    },
    "input": {
        "data_type": int,
        "regex": r"^(?:[0-9]\d?|1000)$",
        "required": False,
        "helper": "Please enter an integer between 1 and 1000"
    },
    "output": {
        "data_type": int,
        "regex": r"^(?:[0-9]\d?|1000)$",
        "required": False,
        "helper": "Please enter an integer between 1 and 1000"
    },
    "layers": {
        "data_type": list,
        "regex": "",
        "required": True,
        "helper": "Please provide a list of layers for the model."
    }
}
LAYER_FORM = {
    "id": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{8}$",
        "required": True,
        "helper": "No ID value was provided."
    },
    "activation": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,15}$",
        "required": True,
        "helper": "No ID value was provided."
    },
    "layer_type": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,15}$",
        "required": True,
        "helper": "No ID value was provided."
    },
    "padding": {
        "data_type": int,
        "regex": r"^(?:[0-9]\d?|99)$",
        "required": False,
        "helper": "Please enter an integer between 1 and 99"
    },
    "x_0": {
        "data_type": int,
        "regex": r"^(?:0|[1-9]\d{0,2}|1000)$",
        "required": True,
        "helper": "Please enter an integer from 0 to 1000."
    },
    "x_1": {
        "data_type": int,
        "regex": r"^(?:0|[1-9]\d{0,2}|1000)$",
        "required": True,
        "helper": "Please enter an integer from 0 to 1000."
    },
    "x_2": {
        "data_type": int,
        "regex": r"^(?:0|[1-9]\d{0,2}|1000)$",
        "required": False,
        "helper": "Please enter an integer from 0 to 1000."
    },
    "x_3": {
        "data_type": int,
        "regex": r"^(?:0|[1-9]\d{0,2}|1000)$",
        "required": False,
        "helper": "Please enter an integer from 0 to 1000."
    }
}
CHECKPOINT_FORM = {
    "name": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{1,30}$",
        "required": True,
        "helper": "Please enter an alphanumeric name of up to 15 characters."
    },
    "description": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -,.:/]{1,150}$",
        "required": False,
        "helper": "Please enter an alphanumeric description of up to 150 characters."
    }
}
