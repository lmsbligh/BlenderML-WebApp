import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

function SelectorLoss({ selectedLoss, handleChange, lossOptions }) {
    return (
        <FormControl>
            <InputLabel id="Loss-Selector-Label">Loss Function</InputLabel>
            <Select
                labelId="Loss-Selector-Label"
                label="Loss function"
                id="simple-select"
                name="lossFunction"
                onChange={handleChange}
                renderValue={() => selectedLoss ? selectedLoss.label : "Select an optimizer" // Show the label as the selected text
                }
            >
                {lossOptions.map(option => (
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

export default SelectorLoss;