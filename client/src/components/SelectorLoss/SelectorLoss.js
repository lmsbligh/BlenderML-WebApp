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
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    }
                }}
                value={selectedLoss ? selectedLoss.label : ''}
                renderValue={() => selectedLoss ? selectedLoss.label : "Select a loss function" // Show the label as the selected text
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