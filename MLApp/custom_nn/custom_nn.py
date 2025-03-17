import torch
from torchvision import datasets
#import torchvision
from torch import nn
#import torch.optim as optim
#import torch.nn.functional as F
#import json
import os
import PIL
#import matplotlib.pyplot as plt
import json
from MLApp.parameters import device
"""Test Docstring
"""


class image_dataset(datasets.VisionDataset):
    """Ineherits Torch's datasets.VisionDataset.  

    Attributes
    ----------

    targets : list
        List of materials, each is composed of a list of floats.
    image_dir : str
        Path to image directory.
    """

    def __init__(self, root, targets, transform=None, target_transform=None):
        print("ran init")
        super(image_dataset, self).__init__(
            root, transform=transform, target_transform=target_transform)
        self.targets = targets
        self.image_dir = root
        # self.images =

    def __getitem__(self, key):
        """Loads and returns an image from the dataset. Allows
        requesting individual images by index, as well as lists
        defined by slices.

        key : index, slice
            Can be an index or a slice.
        image_path : str
            Path to image.
        image : PIL.Image.Image
            PIL image object.
        target : torch.FloatTensor
            Torch tensor containing the material parameter labels.
        """
        if isinstance(key, int):
            image_path = os.path.join(self.image_dir, f"{self.targets[key][0]}.jpg")
            image = PIL.Image.open(image_path)
            target = torch.FloatTensor(self.targets[key][1:])
            if self.transform is not None:
                image = self.transform(image)

            if self.target_transform is not None:
                target = self.target_transform(target)

            return image.to(device), target.to(device)
        elif isinstance(key, slice):
            start, stop, step = key.indices(len(self))
            return [self[i] for i in range(start, stop, step)]
        else:
            raise TypeError("Unsupported key type")

    def __len__(self):
        """Returns number of iamges in dataset.
        """
        return len(self.targets)


class Net(nn.Module):
    """Simple NN with conv and dense layers.

    attributes
    ----------

    conv_layers : nn.Sequential
        Sequential container composed of conv layers.
        Uses ReLu activation and max pooling.
    fc_layers : nn.Sequential
        Sequential container composed of dense layers.
        Currently using a Relu activation internally,
        final layer uses Sigmoid activation.
    """

    def __init__(self, layers_dict):
        super().__init__()
 
        self.layers = nn.Sequential()
        for layer in layers_dict:
            print("layer: ", json.dumps(layer, indent=4))
            match layer['layer_type']:
                case "Dense":
                    self.layers.append(nn.Linear(int(layer['x_0']), int(layer['x_1'])))
                case "CNN":
                    self.layers.append(nn.Conv2d(in_channels=int(layer['x_0']),
                                                out_channels=int(layer['x_1']),
                                                kernel_size=3, padding=1))
                case "Pooling":
                    self.layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
                

            match layer['activation']:
                case "ReLU":
                    self.layers.append(nn.ReLU())
                case "Sigmoid":
                    self.layers.append(nn.Sigmoid())
                    
    def forward(self, x):
        """Returns tensor representing estimated material
        parameters.
        """
        for i, layer in enumerate(self.layers):
            #print(f"Input shape: ", x.shape)
            #print(f"Layer {i}: ", layer)
            
            x = layer(x)
            #print(f"layer is nn.Conv2d?: ", isinstance(layer, nn.Conv2d))
            #print(f"next layer is nn.Conv2d?: ", isinstance(self.layers[i+1], nn.Linear))
            if (i+1 < len(self.layers)):
                if isinstance(layer, nn.MaxPool2d) and isinstance(self.layers[i+1], nn.Linear):  # Flatten after last CNN layer
                    #print("layer flattened")
                    x = x.view(x.size(0), -1)
                    ##x = x.flatten()
            
        return x

