import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, {  } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorLayerType({layer_type, updateState}){

    const [availableTypes, setAvailabeTypes] = React.useState('');
    const [initialLayerType, setInitialLayerType] = React.useState('')
    React.useEffect(()=> {
        fetch('layerTypes').then(response => response.json()).then(data => {
            setAvailabeTypes(data);
            const initialType = data.find(lt => lt.layer_type === layer_type) || data[0];
            setSelectedLayerType(initialType)
        }).catch(error => console.error('Error fetching data:', error))
    }, [])

        
    const [selectedLayerType, setSelectedLayerType] = React.useState(initialLayerType);

    const handleChange = (event) => {
        const selectedValue = event.target.value;
        const newType = availableTypes.find(
            option => option.value === selectedValue
            );
        if (newType) {
            setSelectedLayerType(newType);
            updateState(newType);
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
                onChange={handleChange}

            >
                { 
                
                Array.isArray(availableTypes) ? 
                availableTypes.map(option => (
                    
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