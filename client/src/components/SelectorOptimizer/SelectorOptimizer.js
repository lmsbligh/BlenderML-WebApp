
import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

function SelectorOtimizer({ selectedOptimizer, handleChange, optimizerOptions }) {
    return (
        <FormControl>
            <InputLabel id="Optimizer-Selector-Label" >Optimizer</InputLabel>
            <Select
                labelId="Optimizer-Selector-Label"
                label="Optimizer"
                id="simple-select"
                name="optimizer"
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    }
                }}
                onChange={handleChange}
                value={selectedOptimizer ? selectedOptimizer.label : ''}
                renderValue={() => selectedOptimizer ? selectedOptimizer.label : "Select an optimizer" // Show the label as the selected text
                }
            >
                {optimizerOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        <Card sx={{ width: "100%" }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    {option.label}
                                </Typography>
                            </CardContent>
                        </Card>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default SelectorOtimizer;