import React from 'react';

import { Typography } from '@mui/material';
import Select, { } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorCheckpoint({ selectedCheckpoint, handleChange, checkpointOptions }) {
    return (
        <FormControl sx={{ width: "100%" }}>
            <Select
                labelId="Checkpoint-Selector-Label"
                id="simple-select"
                name="checkpoint"
                value={selectedCheckpoint ? selectedCheckpoint : ''}
                onChange={handleChange}
                renderValue={() => selectedCheckpoint ? selectedCheckpoint : "Select a checkpoint" // Show the label as the selected text
                }
            >
                {checkpointOptions.map(option => (
                    <MenuItem key={option} value={option}>
                        <Typography variant="body2">
                            {option}
                        </Typography>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}


export default SelectorCheckpoint;