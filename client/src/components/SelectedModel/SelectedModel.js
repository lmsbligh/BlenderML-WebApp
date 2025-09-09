import React from 'react';

import { Box, Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

function selectedModel({ selectedModel }) {
    return (
        <Box sx={{ bgcolor: "background.paper", p: 2 }}><Typography>Selected Model: </Typography><ListItem>
            <ListItemText>
                Name: {selectedModel.modelName}
            </ListItemText>
        </ListItem>
            <ListItem>
                <ListItemText>
                    Description: {selectedModel.description}
                </ListItemText>
            </ListItem>
            <ListItem>
                <ListItemText>
                    Input resolution: {selectedModel.imageWidth}x{selectedModel.imageHeight}
                </ListItemText>
            </ListItem>
            <ListItem>
                <ListItemText>
                    Number of layers: {selectedModel.layers.length}
                </ListItemText>
            </ListItem>
        </Box>
    );
}

export default selectedModel;