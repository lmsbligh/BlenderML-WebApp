import React from 'react';
import { Card } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

function ModelDetailsCard({ layer_n }){
    return (
        <Card style={{ display: 'flex', flexDirection: 'column', padding: '5px'}}>
            <List>Layer {layer_n}:
                <ListItem>Type: </ListItem>
                <ListItem>Dimensions:</ListItem>
                <ListItem>Activation function:</ListItem>
            </List>
        </Card>
    );
}

export default ModelDetailsCard;
