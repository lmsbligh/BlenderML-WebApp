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
import CheckpointCard from '../CheckpointCard/CheckpointCard.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AccordionCheckpoints = ({ modelId, handleCheckpointChange, formCheckpoints }) => {

    const [checkpointOptions, setCheckpointOptions] = React.useState([]);
    const [newCheckpoint, setNewcheckpoint] = React.useState(false);
    React.useEffect(() => {
        fetchData(`checkpoints/${modelId}`, setCheckpointOptions)
    }, []);
    const checked = formCheckpoints.some(item => item.checkpointId === "-1" && item.modelId === modelId)

    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}> 
                <Tooltip title="Select for training with fresh, randomly assigned weights."><Checkbox onChange={(event) => handleCheckpointChange(modelId, "-1")} checked={checked}/> </Tooltip>
                <Typography >Create new checkpoint</Typography></Box>
        {checkpointOptions.length > 0 ? <Accordion expandIcon={<ExpandMoreIcon />}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Select checkpoints:</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {checkpointOptions ? checkpointOptions.map((checkpoint) => (
                        <CheckpointCard key={`${checkpoint.modelId}-${checkpoint.checkpointId}`} checkpointId={checkpoint.id} modelId={modelId} handleCheckpointChange={handleCheckpointChange} formCheckpoints={formCheckpoints}/>
                    )) : null}
                </AccordionDetails>
            </Accordion> : null}
            

        </Box>
    )
}

export default AccordionCheckpoints