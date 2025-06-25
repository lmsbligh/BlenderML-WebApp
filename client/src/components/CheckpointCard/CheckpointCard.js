import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, List, Paper, Tooltip } from '@mui/material/';
import Typography from '@mui/material/Typography';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import AddIcon from '@mui/icons-material/Add';
import HubIcon from '@mui/icons-material/Hub';

import SelectorLayerType from '../SelectorLayerType/SelectorLayerType.js'
import SelectorLayerActivation from '../SelectorLayerActivation/SelectorLayerActivation.js'
import { handleTextFieldChange, validateField, validateLayerDimensions } from '../../utils.js';

const CheckpointCard = (checkpoint) => {

    const delFunction = (event) => {

    }

    return (
        <Paper variant='outlined' >
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <Tooltip title="Select for training"><Checkbox /></Tooltip>
                <Tooltip><IconButton aria-label="delete" color="error" onClick={(event) => delFunction(event)}><DeleteIcon /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                <Typography>Checkpoint: {checkpoint.id} </Typography>
                <Typography>Base Model: {checkpoint.model_id} </Typography>
                <Typography>Training Run: {checkpoint.training_run_id}</Typography>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<HubIcon color='primary' />}
                    >
                        Show training history.
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>

                        </List>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Paper>
    )
}

export default CheckpointCard;