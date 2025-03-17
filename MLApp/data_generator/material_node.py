#BATCH_SIZE = 20

#directory= r"blender_files"
class MaterialNode:
    """Basic object representation of a material node.

    name : str
        Stores unique material name, useful for writing material
        to JSON file. !!Redundant? Certainly can be made
        cleaner.!! This whole class needs reworking, naming is
        not consistent with the rest of the project.!!

    props : dict
        Dictionary that stores the parameters/properties
        of the material node.
    """
    def __init__(self, i):
        self.name = f"material_node_{i}_props"
        self.props = {"name" : i}


    def set_prop(self, prop):
        """Self explanatory, sets property value
        """
        self.props.update(prop)
    def get_props(self) -> dict:
        """Returns props.props"""
        return self.props
    def print_props(self):
        """Prints props"""
        print(f"{self.props=}")