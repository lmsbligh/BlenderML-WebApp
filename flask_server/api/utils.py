import ast
import os
import re
from api.forms.model_forms import LAYER_FORM
from api.forms.training_forms import CHECKPOINTS


def validate_form(data, required_fields):
    """
    Validates a submitted form against a schema.

    Args:
        data (dict): The form data.
        required_fields (dict): Schema to validate against.

    Raises:
        ValueError: If validation fails.
    """
    for field, field_vals in required_fields.items():
        print(f"Validating field: {field}")
        if field not in data:
            print(f"Field '{field}' missing from data")
            raise ValueError(f"Missing field: {field}")
        if not isinstance(data[field], field_vals["data_type"]):
            try:
                if field_vals["data_type"] == int and data[field]:
                    data[field] = int(data[field])
                if field_vals["data_type"] == dict:
                    data[field] = ast.literal_eval(data[field])
            except Exception as e:
                print("!error: ", e)

    def val_entry(entry, val):
        print(f"entry: {entry}, val: {val}")
        real_base = os.path.realpath(os.getcwd())
        if (entry == "checkpoints"):
            print("checkpoints: ", entry)
            for checkpoint in val:
                for key in CHECKPOINTS["checkpoint"]["keys"]:
                    checkpoint_as_path = os.path.realpath(
                        os.path.join(real_base, str(checkpoint['checkpointId'] if checkpoint['checkpointId'] != -1 else '')))
                    model_as_path = os.path.realpath(
                        os.path.join(real_base, str(checkpoint['modelId'])))

                    if key not in checkpoint:
                        raise ValueError(
                            f"Error: no {key} in {val}."
                        )
                    if not (checkpoint_as_path.startswith(real_base) or model_as_path.startswith(real_base)):
                        raise ValueError(
                            f"Error: {entry} {val} is not within the application.")
            return

        if (entry == "layers"):
            print("layers: ", entry)
            for layer in val:
                print("layer: ", layer)
                validate_form(layer, LAYER_FORM)
        if (entry == "skyboxPath" or entry == "image_path"):
            print(os.getcwd())
            real_base = os.path.realpath(os.getcwd())
            real_target = os.path.realpath(os.path.join(real_base, val))
            if not (real_target.startswith(real_base)):
                raise ValueError(
                    f"Error: {entry} {val} is not within the application.")
        if (entry not in required_fields):
            raise ValueError(f"Error {entry} is not a valid field.")
        if (val):
            if not (re.match(required_fields[entry]["regex"], str(val))):
                raise ValueError(
                    f"Error: {entry}: regex eval failed {required_fields[entry]['helper']}")
        elif (required_fields[entry]["required"]):
            raise ValueError(
                f"Error: {entry} is a required field: {required_fields[entry]['helper']}")

    # Additional sanity checks
    for entry, val in data.items():
        try:
            val_entry(entry=entry, val=val)
        except Exception as e:
            print("Error! : ", e)
