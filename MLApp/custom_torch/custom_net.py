from torch import nn
import json
from MLApp.parameters import device

class CustomNet(nn.Module):
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

