import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, {  } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function ModelSelector({ selectedModel, handleChange, modelOptions }){
    return (   
        <FormControl sx={{ width: "100%" }}> 
            {!selectedModel && <InputLabel >Select a model</InputLabel>}                  
            <Select
                labelId="Model-Selector-Label"
                id="simple-select"
                value={selectedModel.value ? selectedModel.value : ''}
                onChange={handleChange}
                renderValue={() => selectedModel ? selectedModel.modelName : "Select a model" // Show the label as the selected text
                  }
            >
                {modelOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>   
                        {/* <Card sx={{ width: "100%"}}>
                            <CardContent> */}
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    {option.modelName}
                                </Typography>
                                <Typography variant="body2">
                                    Value: {option.value}
                                    <br />
                                    Input size: {option.input}
                                    <br />
                                    Output size: {option.output}
                                    <br />
                                    Description:
                                    <br />
                                    {option.description}
                                </Typography>
                            {/* </CardContent>
                        </Card> */}
                    </MenuItem>
                ))}
                <MenuItem key={-1} value={-1}>        
                    <Card sx={{ width: "100%"}}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                New Model
                            </Typography>
                        </CardContent>
                    </Card>
                </MenuItem>
            </Select>
        </FormControl>
            );
}


export default ModelSelector;