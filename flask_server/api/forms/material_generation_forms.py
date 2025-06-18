GENERATE_MATERIAL_FORM = {
    "model": {
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -]{8}$",
        "required": True,
        "helper": "No ID value was provided."
    },
    "image_url": {
        "data_type": str,
        "regex": r"^[a-zA-Z0-9/\\:.\-_]{1,150}$",#this is a quick fix to check it's not malicious.
        "required": True,
        "helper": "Image url is required"
    },
    "image_path": {
        "data_type": str,
        "regex": r"^[a-zA-Z0-9/\\:.\-_]{1,150}$",#this is a quick fix to check it's not malicious.
        "required": True,
        "helper": "Image path is required"
    },
    "checkpoint":{
        "data_type": str,
        "regex": r"^[A-Za-z0-9 -.]{1,30}$",
        "required": True,
        "helper": "Please select a checkpoint."
    },
}