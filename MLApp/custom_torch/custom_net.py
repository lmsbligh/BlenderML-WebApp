from torch import nn
from MLApp.parameters import device


class CustomNet(nn.Module):
    """
    Simple neural net that currently supports nn.Linear, nn.Conv2d and nn.MaxPool2d, nn.ReLU and nn.Sigmoid layers.

    __init__(self, layers_dict) Runs each layer in layers_dict through a switch statement, appending the corresponding layer to self.layers

    props: layers_dict (for __init__) 
    """

    def __init__(self, layers_dict):
        super().__init__()

        self.layers = nn.Sequential()
        for layer in layers_dict:
            match layer['layer_type']:
                case "Dense":
                    self.layers.append(
                        nn.Linear(int(layer['x_0']), int(layer['x_1'])))
                case "CNN":
                    self.layers.append(nn.Conv2d(in_channels=int(layer['x_0']),
                                                 out_channels=int(
                                                     layer['x_1']),
                                                 kernel_size=3, padding=1))
                case "Pooling":
                    self.layers.append(nn.MaxPool2d(kernel_size=2, stride=2))

            match layer['activation']:
                case "ReLU":
                    self.layers.append(nn.ReLU())
                case "Sigmoid":
                    self.layers.append(nn.Sigmoid())
            print(f"layers_dict: {layer}, added layer: {self.layers[-1].__class__.__name__}")

    def forward(self, x):
        """Returns tensor representing estimated material
        parameters.
        """
        for i, layer in enumerate(self.layers):
            # print("x.shape: ", x.shape)
            # if not (isinstance(layer, nn.ReLU) or isinstance(layer, nn.Sigmoid) or isinstance(layer, nn.MaxPool2d)):
            # print("layer.weights.shape: ", layer.weight.shape)

            x = layer(x)
            if (i+1 < len(self.layers)):
                # Flatten after last CNN layer
                print(f"Flattening before layer {i+1} ({self.layers[i+1].__class__.__name__}):", x.shape)

                if isinstance(layer, nn.MaxPool2d) and isinstance(self.layers[i+1], nn.Linear):
                    x = x.view(x.size(0), -1)
                    print("After flatten:", x.shape)

        return x
