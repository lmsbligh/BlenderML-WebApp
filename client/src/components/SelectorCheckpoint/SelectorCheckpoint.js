import React from 'react';

import { FormHelperText, Menu, Typography } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, { } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorCheckpoint({ helperText, error, selectedCheckpoint, handleChange, checkpointOptions, forGeneration = false }) {
    return (
        <FormControl sx={{ width: "100%" }}>
            {!selectedCheckpoint && <InputLabel >Select a checkpoint</InputLabel>}

            <Select
                labelId="Checkpoint-Selector-Label"
                id="simple-select"
                name="checkpoint"
                error={error}
                value={selectedCheckpoint ? selectedCheckpoint : ''}
                onChange={handleChange}
                renderValue={() => selectedCheckpoint ? selectedCheckpoint : <Typography>"Select a checkpoint"</Typography>} // Show the label as the selected text
            >
                {!forGeneration ?
                    <MenuItem key={-1} value={"None"}>
                        <Typography variant="body2">
                            None
                        </Typography>
                    </MenuItem> : null
                }

                {checkpointOptions.map(option => (
                    <MenuItem key={option.id} value={option.id}>
                        <Typography variant="body2">
                            {option.id}
                        </Typography>
                    </MenuItem>
                ))}
            </Select>

            <FormHelperText sx={{ color: 'error.main' }}>{helperText}</FormHelperText>

        </FormControl>
    );
}


export default SelectorCheckpoint;