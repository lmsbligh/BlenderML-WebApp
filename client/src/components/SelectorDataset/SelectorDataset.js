import React from 'react';
import { Typography, Card, CardContent, IconButton, FormHelperText } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorDataset ({ helperText, error, selectedDataset, handleChange, datasetOptions}){
    
    return (   
        <FormControl sx={{ width: "100%", padding: "5px" }}> 
            {!selectedDataset && <InputLabel >Select a dataset </InputLabel>}                  
            <Select
                labelId="Dataset-Selector-Label"
                id="simple-select"
                sx={{width: "100%"}}
                name="dataset"
                value={selectedDataset}
                onChange={handleChange}
                error={error}
                renderValue={(selected) => {
                    const selectedOption = datasetOptions.find((option) => option.value === selected.value);
                    return selectedOption ? selectedOption.datasetName : <Typography>Select a Dataset</Typography>;
                  }}
            >
                {datasetOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>        
                        <Card sx={{ width: "100%"}}>
                            <CardContent>
                                <Typography>
                                    Dataset Name: {option.datasetName}
                                </Typography>
                                <Typography color="text.secondary">Dataset Size: {option.datasetSize}</Typography>

                                <Typography color="text.secondary">Unique ID and Render Date/Time: {option.value}</Typography>

                                
                                <Typography variant="body2">
                                    {option.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText sx={{color: 'error.main'}}>{helperText}</FormHelperText>
        </FormControl>
            );
}


export default SelectorDataset;