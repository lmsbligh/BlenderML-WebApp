import React from 'react';

import { Typography, Card, CardContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


function SelectorDatasetProfile({ selectedDatasetProfile, handleChange, profileOptions }) {

    return (
        <FormControl>
            {!selectedDatasetProfile && <InputLabel >Select a dataset profile</InputLabel>}
            <Select
                labelId="Dataset-Profile-Selector-Label"
                id="simple-select"
                value={selectedDatasetProfile.value ? selectedDatasetProfile.value : 'Select a profile'}
                onChange={handleChange}
                renderValue={(selected) => {
                    const selectedOption = profileOptions.find((option) => option.value === selected.value);
                    return selectedOption ? selectedOption.datasetName : <Typography>Select a profile</Typography>;
                }}
            >
                {profileOptions.length > 0 ? profileOptions.map(option => (
                    <MenuItem key={option.value} value={option.value} sx={{}}>
                        {option.datasetName}
                        <br />
                        {option.description}
                        <br />
                        Image resolution: {option.imageWidth}x{option.imageHeight}
                        <br />
                        ID: {option.value}
                        <br />
                    </MenuItem>
                )) : null}
                <MenuItem key={-1} value={-1}>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        New Dataset Profile
                    </Typography>
                </MenuItem>
            </Select>
        </FormControl>
    );
}


export default SelectorDatasetProfile;