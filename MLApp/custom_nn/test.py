from parameters import loss_function
import torch
import sys
def test(model, data_loader, test_size=None) -> list:
    """Runs a forward pass of the model then compares the
    result to the target. Returns a list of all outputs
    (predicted material parameters).

    test_size : int
        Allows for a subset of specific size to be tested, will also
        allow the image or image path itself to be returned.
    """
    running_loss = 0.0
    outputs = []
    model.eval()
    with torch.no_grad():
        for i, data in enumerate(data_loader, 0):
            # get the inputs; data is a list of [inputs, labels]
            inputs, label = data
            # forward
            output = model(inputs)
            
            loss = loss_function(output, label)
            output = output.tolist()[0]
            outputs.append(output)
            running_loss += loss.item()

    return outputs

