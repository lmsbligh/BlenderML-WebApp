import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, {  } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorLayerActivation( {activation_type, updateState} ){
    const [availableActivations, setAvailableActivations] = React.useState('');
    const [initialActivationType, setInitialActivationType] = React.useState('');
    const [selectedLayerActivation, setSelectedLayerActivation] = React.useState(initialActivationType);

    React.useEffect(()=> {
            fetch('activationTypes').then(response => response.json()).then(data => {
                setAvailableActivations(data);
                const initialType = data.find(at => at.activation === activation_type) || data[0];
                setSelectedLayerActivation(initialType)
            }).catch(error => console.error('Error fetching data:', error))
        }, [])


    

    const handleChange = (event) => {
        const selectedValue = event.target.value;
        const newActivation = availableActivations.find(
            option => option.value === selectedValue
          );
          
        if (newActivation) {
        setSelectedLayerActivation(newActivation);
        updateState(newActivation);
        }
        console.log("event.target.value: ", event.target.value)
        //setSelectedLayerActivation(available_activations[event.target.value].activation);
    };

    //console.log("selectedLayerActivation.activation_type.activation", selectedLayerActivation.activation_type.activation)
    return (   
        <FormControl sx={{ width: "100%"}}> 
            {  
            <InputLabel id="Layer-Activation-Selector-Label"> Activation Function </InputLabel>}                  
            <Select
                labelId="Layer-Activation-Selector-Label"
                id="simple-select"
                value={selectedLayerActivation.value ? selectedLayerActivation.value : ''}
                renderValue={() => selectedLayerActivation.activation}
                onChange={handleChange}

            >
                { 
                
                Array.isArray(availableActivations) ? 
                availableActivations.map(option => (
                    
                    <MenuItem key={option.value} value={option.value}>        
                        <Card>
                            <Typography>{option.activation}</Typography>
                        </Card>
                    </MenuItem>
                )) : null 
            }
            </Select>
        </FormControl>
            );
}


export default SelectorLayerActivation;