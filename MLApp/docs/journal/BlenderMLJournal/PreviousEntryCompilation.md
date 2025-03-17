
## Plan

Use Blender's python API to access variables within Blender to train neural nets for various tasks. Initially going to focus on generating a material from a render.

### Steps:
- choose simple material node type
- randomly generate material parameters, save
- render image, save
- train a neural net to predict these parameter values from the rendered images

!!!! need to think about adding a separate file for training, and one for testing? not sure the best way to organize this. 
## Training Log

![[Pasted image 20230828133845.png]]
the result of training for 10 epochs with a mini-match size of 20, the following nn and optimizers:
```python
class Net(nn.Module):

    def __init__(self):

        super().__init__()

        self.conv_layers = nn.Sequential(

            nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1),

            nn.ReLU(),

            nn.MaxPool2d(kernel_size=2, stride=2),

            nn.Conv2d(in_channels=16, out_channels=32, kernel_size=3, padding=1),

            nn.ReLU(),

            nn.MaxPool2d(kernel_size=2, stride=2),

        )

        # Fully connected layers

        self.fc_layers = nn.Sequential(

            nn.Linear(32 * (500 // 4) * (500 // 4), 128),

            nn.ReLU(),

            nn.Linear(128, 64),

            nn.ReLU(),

            nn.Linear(64, 6),  # 6 outputs for the 6 material properties

            nn.Sigmoid()  # Sigmoid activation to constrain outputs between 0 and 1

        )

    def forward(self, x):

        x = self.conv_layers(x)

        x = x.view(x.size(0), -1)  # Flatten the tensor before feeding to the fully connected layers

        x = self.fc_layers(x)

        return x
        
criterion = nn.CrossEntropyLoss()

optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)
```
#### loss data:
```

[1,    20] loss: 0.053
[1,    40] loss: 0.053
[1,    60] loss: 0.054
[1,    80] loss: 0.055
[1,   100] loss: 0.054
[1,   120] loss: 0.054
[1,   140] loss: 0.053
[1,   160] loss: 0.054
[1,   180] loss: 0.052
[1,   200] loss: 0.054
[1,   220] loss: 0.053
[1,   240] loss: 0.052
[2,    20] loss: 0.053
[2,    40] loss: 0.053
[2,    60] loss: 0.052
[2,    80] loss: 0.053
[2,   100] loss: 0.052
[2,   120] loss: 0.052
[2,   140] loss: 0.052
[2,   160] loss: 0.051
[2,   180] loss: 0.053
[2,   200] loss: 0.050
[2,   220] loss: 0.051
[2,   240] loss: 0.051
[3,    20] loss: 0.051
[3,    40] loss: 0.051
[3,    60] loss: 0.052
[3,    80] loss: 0.052
[3,   100] loss: 0.052
[3,   120] loss: 0.052
[3,   140] loss: 0.053
[3,   160] loss: 0.052
[3,   180] loss: 0.052
[3,   200] loss: 0.050
[3,   220] loss: 0.051
[3,   240] loss: 0.051
[4,    20] loss: 0.051
[4,    40] loss: 0.050
[4,    60] loss: 0.050
[4,    80] loss: 0.051
[4,   100] loss: 0.052
[4,   120] loss: 0.052
[4,   140] loss: 0.052
[4,   160] loss: 0.051
[4,   180] loss: 0.051
[4,   200] loss: 0.052
[4,   220] loss: 0.051
[4,   240] loss: 0.051
[5,    20] loss: 0.052
[5,    40] loss: 0.051
[5,    60] loss: 0.052
[5,    80] loss: 0.051
[5,   100] loss: 0.051
[5,   120] loss: 0.051
[5,   140] loss: 0.051
[5,   160] loss: 0.050
[5,   180] loss: 0.050
[5,   200] loss: 0.051
[5,   220] loss: 0.051
[5,   240] loss: 0.050
[6,    20] loss: 0.052
[6,    40] loss: 0.050
[6,    60] loss: 0.051
[6,    80] loss: 0.051
[6,   100] loss: 0.051
[6,   120] loss: 0.050
[6,   140] loss: 0.050
[6,   160] loss: 0.052
[6,   180] loss: 0.051
[6,   200] loss: 0.051
[6,   220] loss: 0.050
[6,   240] loss: 0.051
[7,    20] loss: 0.051
[7,    40] loss: 0.050
[7,    60] loss: 0.051
[7,    80] loss: 0.052
[7,   100] loss: 0.052
[7,   120] loss: 0.051
[7,   140] loss: 0.050
[7,   160] loss: 0.050
[7,   180] loss: 0.050
[7,   200] loss: 0.052
[7,   220] loss: 0.050
[7,   240] loss: 0.051
[8,    20] loss: 0.052
[8,    40] loss: 0.051
[8,    60] loss: 0.050
[8,    80] loss: 0.051
[8,   100] loss: 0.051
[8,   120] loss: 0.052
[8,   140] loss: 0.050
[8,   160] loss: 0.050
[8,   180] loss: 0.051
[8,   200] loss: 0.051
[8,   220] loss: 0.051
[8,   240] loss: 0.052
[9,    20] loss: 0.050
[9,    40] loss: 0.051
[9,    60] loss: 0.050
[9,    80] loss: 0.052
[9,   100] loss: 0.050
[9,   120] loss: 0.049
[9,   140] loss: 0.051
[9,   160] loss: 0.051
[9,   180] loss: 0.051
[9,   200] loss: 0.051
[9,   220] loss: 0.051
[9,   240] loss: 0.051
[10,    20] loss: 0.050
[10,    40] loss: 0.051
[10,    60] loss: 0.051
[10,    80] loss: 0.051
[10,   100] loss: 0.051
[10,   120] loss: 0.051
[10,   140] loss: 0.051
[10,   160] loss: 0.050
[10,   180] loss: 0.051
[10,   200] loss: 0.051
[10,   220] loss: 0.051
[10,   240] loss: 0.052
Finished Training

]
```
![[Pasted image 20230830205336.png]]