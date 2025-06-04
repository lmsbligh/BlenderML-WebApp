DATASET_PROFILE_FORM = {
        "value" : {"data_type": str,
                        "regex": r"^[A-Za-z0-9 -]{8}$",
                        "required": True,
                        "helper": "No ID value was provided."
                        },
        "datasetName": {"data_type": str,
                        "regex": r"^[A-Za-z0-9 -]{1,15}$",
                        "required": True,
                        "helper": "Please enter an alphanumeric name for this dataset, maximum 15 chars."
                        },
        "datasetSize": {"data_type": int,
                        "regex": r"^[A-Za-z0-9 -]{1,15}$",
                        "required": True,
                        "helper": "Please enter a number between 1 and 5000."
                        },
        "description": {"data_type": str,
                        "regex": r"^[A-Za-z0-9 -,.]{1,150}$",
                        "required": False,
                        "helper": "Descriptions are limited to 150 characters."
                        },
        "CVPercentage": {"data_type": int,
                        "regex": r"^(?:[0-9]|[1-2][0-9]|30)$",
                        "required": False,
                        "helper": "Cross validation set percentages are limited to integers between 0 and 30."
                        },
        "TrainingSetPercentage": {"data_type": int,
                        "regex": r"^(?:[0-9]|[1-2][0-9]|30)$",
                        "required": False,
                        "helper": "Training set percentages are limited to integers between 0 and 30."
                        },
        "imageHeight": {"data_type": int,
                        "regex": r"^(?:[1-9]\d{0,2}|1000)$",
                        "required": True,
                        "helper": "Please enter a number between 1 and 1000."
                        },
        "imageWidth": {"data_type": int,
                        "regex": r"^(?:[1-9]\d{0,2}|1000)$",
                        "required": True,
                        "helper": "Please enter a number between 1 and 1000."
                        },
        "meshes": {"data_type": dict,
                        "regex": "",
                        "required": False,
                        "helper": "Meshes are not required"
                        },
        "randomOrientation": {"data_type": bool,
                        "regex": "",
                        "required": False,
                        "helper": "Random orientation is not required"
                        },
        "skyboxPath": {"data_type": str,
                        "regex": r"^[a-zA-Z0-9/:.\-]{1,150}$",#this is a quick fix to check it's not malicious.
                        "required": False,
                        "helper": "Skybox paths are not required"
                        },
    }