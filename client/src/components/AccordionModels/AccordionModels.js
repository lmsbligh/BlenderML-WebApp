import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Accordion, AccordionDetails, AccordionSummary, Card, Checkbox, List, Paper, Tooltip } from '@mui/material/';
import Typography from '@mui/material/Typography';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import SpeedIcon from '@mui/icons-material/Speed';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import AddIcon from '@mui/icons-material/Add';
import HubIcon from '@mui/icons-material/Hub';

import SelectorLayerType from '../SelectorLayerType/SelectorLayerType.js'
import SelectorLayerActivation from '../SelectorLayerActivation/SelectorLayerActivation.js'
import { appendData, handleTextFieldChange, validateField, validateLayerDimensions } from '../../utils.js';
import { fetchData } from '../../utils.js';
import TrainingChart from '../TrainingChart/TrainingChart.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import AccordionCheckpoints from '../AccordionCheckpoints/AccordionCheckpoints.js';

const AccordionModels = ({ modelData, handleCheckpointChange, formCheckpoints }) => {
    const [selectedCheckpoints, setSelectedCheckpoints] = useImmer([])
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {formCheckpoints.length > 0 ?
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography>Selected checkpoints:</Typography>
                    {formCheckpoints.map((checkpoint) => (
                        <Card key={checkpoint.model_id+checkpoint.id}sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Box>
                                {console.log("!checkpoint: ", checkpoint)}
                                {
                                    checkpoint.name ?
                                        <Typography>
                                            Checkpoint name: {checkpoint.name}
                                        </Typography>
                                        :
                                        <Typography>
                                            Checkpoint ID: {checkpoint.checkpointId == '-1' ? "New checkpoint" : checkpoint.checkpointId}
                                        </Typography>
                                }
                                <Typography>
                                    Model ID: {checkpoint.model_id}
                                </Typography>
                            </Box>
                            <IconButton aria-label="delete" color="error" onClick={() => { handleCheckpointChange({model_id: checkpoint.model_id, id: checkpoint.id}) }} ><DeleteIcon /></IconButton>
                        </Card>
                    ))}
                </Box>
                : null}
            <Accordion expandIcon={<ExpandMoreIcon />}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Select models:</Typography>
                </AccordionSummary>
                <AccordionDetails >
                    {modelData ? modelData.map((model) => (
                        <Paper variant='outlined' sx={{ gap: 3, marginTop: 3, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                            <Typography>Model name: {model.modelName}</Typography>
                            <Typography>Model ID: {model.value}</Typography>
                            <Typography>Input resolution: {model.imageWidth}x{model.imageHeight} </Typography>
                            <AccordionCheckpoints modelId={model.value} handleCheckpointChange={handleCheckpointChange} setSelectedCheckpoints={setSelectedCheckpoints} formCheckpoints={formCheckpoints} />
                        </Paper>

                    )) : <Typography>Error!</Typography>}
                </AccordionDetails>
            </Accordion>

        </Box>
    )
}

export default AccordionModels