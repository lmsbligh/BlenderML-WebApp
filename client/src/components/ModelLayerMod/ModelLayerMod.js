import React from 'react';
import { Paper, Select, Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';


function ModelLayerMod({ layer }){
    const handleChange = (event) => {
        setSelectedLayerType(layer[event.target.value]);
        };

    const [selectedLayerType, setSelectedLayerType] = React.useState('');
    const [layerTypeOptions, setLayerTypeOptions] = React.useState([]);
    React.useEffect(()=> {
        //response.json() creates an array from the JSON in the response
        fetch('layerTypes').then(response => response.json()).then(data => {
            setLayerTypeOptions(data)
        }).catch(error => console.error('Error fetching data:', error))
    }, []);

    return (
        <Paper variant='outlined'>
            <Typography>Layer type</Typography>
            <Select
                labelId="Model-Layer-Type-Label"
                id="simple-select"
                value={selectedLayerType}
                onChange={handleChange}
                renderValue={(selected) => {
                    const selectedOption = layerTypeOptions.find((option) => option.value === selected.value);
                    return selectedOption ? selectedOption.label : layer.layer_type ; // Show the label as the selected text
                  }}
            >
                {
                    layerTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>        
                        <Card sx={{ width: "100%"}}>
                            <CardContent>
                                <Typography variant="body2">
                                    {option.type}
                                </Typography>
                            </CardContent>
                        </Card>
                    </MenuItem>
                    ))
                }
            </Select>

            <Typography>
                Dimensions:
            </Typography>
            <TextField label="Dataset Name">x_0</TextField>
            <TextField label="Dataset Name">x_1</TextField>
            <TextField label="Dataset Name">x_2</TextField>
            <TextField label="Dataset Name">x_3</TextField>
            
            <Typography>Activation function</Typography>
            <Select
                labelId="Model-Layer-Type-Label"
                id="simple-select"
                value={selectedLayerType}
                onChange={handleChange}
                renderValue={(selected) => {
                    const selectedOption = layerTypeOptions.find((option) => option.value === selected.value);
                    return selectedOption ? selectedOption.label : "Select a layer type"; // Show the label as the selected text
                  }}
            >
                {
                    layerTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>        
                        <Card sx={{ width: "100%"}}>
                            <CardContent>
                                <Typography variant="body2">
                                    {option.type}
                                </Typography>
                            </CardContent>
                        </Card>
                    </MenuItem>
                    ))
                }

            </Select>

        </Paper>
    );
}

export default ModelLayerMod;