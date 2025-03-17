from MLApp.parameters import EPOCHS, LEARNING_RATE, OPTIMIZER, loss_function, state_dict_dir
import torch

def train(model, data_loader):
    """
    """
    for epoch in range(EPOCHS):  # loop over the dataset multiple times
        optim_instance = OPTIMIZER(model.parameters(), lr=LEARNING_RATE)
        running_loss = 0.0
        for i, data in enumerate(data_loader, 0):
            # get the inputs; data is a list of [inputs, labels]
            inputs, labels = data

            # zero the parameter gradients
            optim_instance.zero_grad()

            # forward + backward + optimize
            outputs = model(inputs)
            loss = loss_function(outputs, labels)
            loss.backward()
            optim_instance.step()

            # print statistics
            running_loss += loss.item()
            if i % 20 == 19:    # print every 20 mini-batches
                print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 20:.6f}')
                running_loss = 0.0
    print('Finished Training')
    state_filename = input('Enter name for weight and bias state checkpoint: ')
    torch.save(model.state_dict(), f"{state_dict_dir}\\{state_filename}.pth")
