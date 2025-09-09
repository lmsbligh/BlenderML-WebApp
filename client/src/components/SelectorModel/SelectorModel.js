import React from 'react';

import { Typography, Card, CardContent, TextField, FormHelperText, colors, textFieldClasses } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, { } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { red } from '@mui/material/colors';


function SelectorModel({ helperText, error, selectedModel, handleChange, modelOptions, isModify }) {
    return (
        <FormControl sx={{ width: "100%" }} variant='outlined'>
            {!selectedModel && <InputLabel >Select a Model</InputLabel>}
            <Select
                labelId="Model-Selector-Label"
                id="simple-select"
                name="model"
                error={error}
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    }
                }}
                value={selectedModel ? selectedModel.value : ''}
                onChange={handleChange}
                renderValue={() => selectedModel ? selectedModel.modelName : "Select a model" // Show the label as the selected text
                }
            >
                {modelOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        <Typography variant="body2">
                            {option.modelName}
                            <br />
                            {option.description}
                            <br />
                            Input resolution: {option.imageWidth}x{option.imageHeight}
                            <br />

                            ID: {option.value}
                            <br />
                        </Typography>
                    </MenuItem>
                ))}{isModify ?
                    <MenuItem key={-1} value={-1}>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            New Model
                        </Typography>
                    </MenuItem>
                    : null}

            </Select>
            <FormHelperText sx={{ color: 'error.main', m: 0 }}>{helperText}</FormHelperText>
        </FormControl>
    );
}


export default SelectorModel;