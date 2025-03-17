import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Accordion, AccordionDetails, AccordionSummary, Button, Card } from '@mui/material/';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ModelDetailsCard from '../components/ModelDetailsCard/ModelDetailsCard.js'
import SelectedModel from '../components/SelectedModel/SelectedModel.js'
import ModelSelector from '../components/ModelSelector/ModelSelector.js';

const defaultTheme = createTheme();
  


export default function LoadModel() {


    //const [model, setModel] = React.useState('');

    const [modelOptions, setModelOptions] = React.useState([{"value": 1, "label": 'Model 1', "input": "50x50", "output": "10x1", "description": "Brief description of model 1", 
        "layers":[{"layer_type":'CNN', "x_0":'4', "x_1":'5',"x_2":'6',"x_3":'7', "activation":'ReLU'},
               {"layer_type":'Dense', "x_0":'4', "x_1":'5',"x_2":'6',"x_3":'7', "activation":'ReLU'},
               {"layer_type":'Dense', "x_0":'5', "x_1":'0',"x_2":'0',"x_3":'0', "activation":'Sigmoid'}
       ]},
       {"value": 2, "label": 'Model 2', "input": "75x75", "output": "12x1", "description": "Brief description of model 2",
        "layers":[{"layer_type":'Dense', "x_0":'4', "x_1":'5',"x_2":'6',"x_3":'7', "activation":'ReLU'},
               {"layer_type":'Dense', "x_0":'4', "x_1":'3',"x_2":'9',"x_3":'7', "activation":'ReLU'},
               {"layer_type":'Dense', "x_0":'5', "x_1":'2',"x_2":'3',"x_3":'8', "activation":'Sigmoid'},
               {"layer_type":'Dense', "x_0":'4', "x_1":'5',"x_2":'6',"x_3":'7', "activation":'ReLU'},
               {"layer_type":'Dense', "x_0":'4', "x_1":'3',"x_2":'9',"x_3":'7', "activation":'ReLU'},
               {"layer_type":'Dense', "x_0":'5', "x_1":'2',"x_2":'3',"x_3":'8', "activation":'Sigmoid'}]}
]);
    const [selectedModel, setSelectedModel] = React.useState('');
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        const newModel = modelOptions.find(option => option.value === selectedValue);
        setSelectedModel(newModel || null); // Ensure valid or null fallback
        };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <FormControl fullWidth>
                    <ModelSelector selectedModel={selectedModel} handleChange={handleChange} modelOptions={modelOptions}/>
                    <Box>
                    <List>
                        <SelectedModel selectedModel={selectedModel} />    
                        <ListItem>
                            <div>
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ArrowDropDownIcon />}
                                    >
                                        Show more details
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List>
                                            {
                                            Array.from({length:5}, (_, i) => (
                                                <ListItem key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                                {
                                                    <ModelDetailsCard layer_n={i}/>
                                                }
                                                </ListItem>           
                                                        ))

                                                    }
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                        </ListItem>
                    </List>
                    </Box>
                    <Button variant="contained" style={{ width: '150px' }}>Load</Button>
                </FormControl>
            </Box>
        </ThemeProvider>
    )
}