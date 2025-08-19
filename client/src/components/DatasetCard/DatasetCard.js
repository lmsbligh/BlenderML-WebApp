import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import { Button, Card, Paper, Grid, TextField, List, ListItem, Input, FormControl, FormLabel, OutlinedInput, InputLabel } from '@mui/material/';
import Slider from '@mui/material/Slider';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { v4 as uuidv4 } from 'uuid';

import { handleOpenDelDialog, handleCloseDelDialog } from '../../utils.js';
import DeleteDialog from '../DeleteDialog/DeleteDialog.js';

export default function DatasetCard({ dataset, delDataset }) {

    const [delDatasetDialog, setDelDatasetDialog] = React.useState(false);
    return (
        <Card key={dataset.value} sx={{
            flexBasis: "auto",
            padding: "10px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
                <Typography sx={{ alignSelf: "center" }} color="text.primary">Profile Name: {dataset.datasetName}</Typography>
                <DeleteDialog
                    id="dataset"
                    open={delDatasetDialog}
                    handleClose={handleCloseDelDialog}
                    setDelDialog={setDelDatasetDialog}
                    delFunction={() => delDataset(dataset.value)}
                />

                <IconButton aria-label="delete" color="error" onClick={() => { setDelDatasetDialog(true) }}><DeleteIcon /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                <Typography color="text.primary">Split: {dataset.split}</Typography>
                <Typography color="text.secondary">Render Date and Time: {dataset.value.slice(9)}</Typography>
                <Typography color="text.secondary">Size: {dataset.datasetSize}</Typography>
                <Typography color="text.secondary">Description: {dataset.description}</Typography>
            </Box>
        </Card>
    )
}