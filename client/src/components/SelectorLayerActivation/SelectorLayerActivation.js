import React from 'react';

import { Typography, Card } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { fetchData, handleSelectorFormChange } from '../../utils.js'


function SelectorLayerActivation( {activationType, handleChange} ){
    const [availableActivations, setAvailableActivations] = React.useState([]);
    const [initialActivationType, setInitialActivationType] = React.useState('');
    const [selectedLayerActivation, setSelectedLayerActivation] = React.useState(initialActivationType);

    const handleSelectorChange = (event) => {
        const selectedValue = event.target.value;
        const newActivation = availableActivations.find(
            option => option.value === selectedValue
          );
          
        if (newActivation) {
        setSelectedLayerActivation(newActivation);
        handleChange(newActivation);
        }
        console.log("event.target.value: ", event.target.value)
    };

    React.useEffect(()=> {
        fetchData('activationTypes', setAvailableActivations)
        const initialType = availableActivations.find(at => at.activation === activationType) || availableActivations[0];
        setSelectedLayerActivation(initialType)
    }, [availableActivations]);

    return (   
        <FormControl sx={{ width: "100%"}}> 
            {  
            <InputLabel id="Layer-Activation-Selector-Label"> Activation Function </InputLabel>}                  
            <Select
                labelId="Layer-Activation-Selector-Label"
                id="simple-select"
                value={selectedLayerActivation?.value || ''}
                renderValue={() => selectedLayerActivation.activation}
                onChange={handleSelectorChange}

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