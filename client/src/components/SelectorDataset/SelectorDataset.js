import React from 'react';
import { Typography, Card, CardContent, IconButton, FormHelperText } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorDataset ({ helperText, error, selectedDataset, handleChange, datasetOptions, datasetType}){
    
    return (   
        <FormControl> 
            {<InputLabel >Select a {datasetType} dataset </InputLabel>}                  
            <Select
                labelId="Dataset-Selector-Label"
                label={`Select a ${datasetType} dataset`}
                id="simple-select"
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    }
                }}
                name={datasetType+"Dataset"}
                value={selectedDataset || "-1"}
                onChange={handleChange}
                error={error}
                renderValue={(selected) => {
                    const selectedOption = datasetOptions.find((option) => option.value === selected.value);
                    return selectedOption ? selectedOption.datasetName+' '+ selectedOption.value.slice(9) : <Typography>Select a {datasetType} dataset</Typography>;
                  }}
            >
                <MenuItem key={-1} value={""}>        
                        <Card sx={{ width: "100%"}}>
                            <CardContent>
                                <Typography>
                                    None
                                </Typography>
                            </CardContent>
                        </Card>
                </MenuItem>
                {datasetOptions.map(option => (
                    option.split === datasetType ?  (<MenuItem key={option.value} value={option.value}>        
                        <Card sx={{ width: "100%"}}>
                            <CardContent>
                                <Typography>
                                    Dataset Name: {option.datasetName}<br></br>
                                    Dataset Split: {option.split}
                                </Typography>
                                <Typography color="text.secondary">Dataset Size: {option.datasetSize}</Typography>

                                <Typography color="text.secondary">Unique ID and Render Date/Time: {option.value}</Typography>

                                
                                <Typography variant="body2">
                                    {option.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </MenuItem>) : (null)
                    
                ))}
                
            </Select>
            <FormHelperText sx={{color: 'error.main'}}>{helperText}</FormHelperText>
        </FormControl>
            );
}


export default SelectorDataset;