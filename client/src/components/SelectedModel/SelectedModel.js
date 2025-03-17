import React from 'react';
import { Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

function selectedModel({ selectedModel }){
    return (
        <><Typography>Selected Model: </Typography><ListItem>
            <ListItemText>
                Name: {selectedModel.modelName}
            </ListItemText>
        </ListItem><ListItem>
                <ListItemText>
                    Description: {selectedModel.description}
                </ListItemText>
            </ListItem><ListItem>
                <ListItemText>
                    Input Size: {selectedModel.input}
                </ListItemText>
            </ListItem><ListItem>
                <ListItemText>
                    Output Size: {selectedModel.output}
                </ListItemText>
            </ListItem><ListItem>
                <ListItemText>
                    Number of layers: {selectedModel.n_layers}
                </ListItemText>
            </ListItem><ListItem>
                <ListItemText>
                    Types of layers: {selectedModel.layer_types}
                </ListItemText>
            </ListItem></>
    );
}

export default selectedModel;