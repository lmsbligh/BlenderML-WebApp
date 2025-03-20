import React from 'react';

import { Typography, Card } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import fetchData from '../../utils';


function SelectorLayerType({layerType, handleChange}){

    const [availableLayerTypes, setAvailabeTypes] = React.useState([]);
    const [initialLayerType, setInitialLayerType] = React.useState('')
    React.useEffect(()=> {
        fetchData('layerTypes', setAvailabeTypes)
        const initialType = availableLayerTypes.find(lt => lt.layer_type === layerType) || availableLayerTypes[0];
        setSelectedLayerType(initialType)
    }, [availableLayerTypes])

        
    const [selectedLayerType, setSelectedLayerType] = React.useState(initialLayerType);

    const handleSelectorChange = (event) => {
        const selectedValue = event.target.value;
        const newType = availableLayerTypes.find(
            option => option.value === selectedValue
            );
        if (newType) {
            setSelectedLayerType(newType);
            handleChange(newType);
        }
    };

    return (   
        <FormControl sx={{ width: "100%"}}> 
            {  
            <InputLabel id="Layer-Type-Selector-Label"> Layer Type </InputLabel>}                  
            <Select
                labelId="Layer-Type-Selector-Label"
                id="simple-select"
                value={selectedLayerType?.value  || ''}
                renderValue={() => selectedLayerType.layer_type}
                onChange={handleSelectorChange}

            >
                { 
                
                Array.isArray(availableLayerTypes) ? 
                availableLayerTypes.map(option => (
                    
                    <MenuItem key={option.value} value={option.value}>        
                        <Card>
                            <Typography>{option.layer_type}</Typography>
                        </Card>
                    </MenuItem>
                )) : null 
            }
            </Select>
        </FormControl>
            );
}


export default SelectorLayerType;