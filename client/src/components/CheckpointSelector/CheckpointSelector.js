import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, {  } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function CheckpointSelector({ selectedCheckpoint, handleChange, checkpointOptions }){
    return (   
        <FormControl sx={{ width: "100%" }}> 
            <Select
                labelId="Checkpoint-Selector-Label"
                id="simple-select"
                value={selectedCheckpoint ? selectedCheckpoint : ''}
                onChange={handleChange}
                renderValue={() => selectedCheckpoint ? selectedCheckpoint : "Select a checkpoint" // Show the label as the selected text
                  }
            >
                {checkpointOptions.map(option => (
                    <MenuItem key={option} value={option}>   
                        {/* <Card sx={{ width: "100%"}}>
                            <CardContent> */}
                                <Typography variant="body2">
                                    {option} 
                                </Typography>
                            {/* </CardContent>
                        </Card> */}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
            );
}


export default CheckpointSelector;