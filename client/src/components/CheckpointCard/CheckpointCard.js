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
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import AddIcon from '@mui/icons-material/Add';
import HubIcon from '@mui/icons-material/Hub';

import SelectorLayerType from '../SelectorLayerType/SelectorLayerType.js'
import SelectorLayerActivation from '../SelectorLayerActivation/SelectorLayerActivation.js'
import { handleTextFieldChange, validateField, validateLayerDimensions } from '../../utils.js';
import { fetchData } from '../../utils.js';
import TrainingChart from '../TrainingChart/TrainingChart.js';


const CheckpointCard = ({ id, model_id, training_run_id }) => {
    const [trainingHistory, setTrainingHistory] = React.useState([]);
    const [chartData, setChartData] = []
    React.useEffect(() => {
        fetchData(`/training_tree/${id}`, setTrainingHistory)
    }, []);

    React.useEffect(() => {
        console.log("trainingHistory: ", trainingHistory)
    }, [trainingHistory])
    const delFunction = (event) => {

    }

    return (
        <Paper variant='outlined' >
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Tooltip title="Select for training"><Checkbox /></Tooltip>
                <Tooltip><IconButton aria-label="delete" color="error" onClick={(event) => delFunction(event)}><DeleteIcon /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                <Typography>Checkpoint: {id} </Typography>
                <Typography>Base Model: {model_id} </Typography>
                <Typography>Training Run: {training_run_id}</Typography>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<HubIcon color='primary' />}
                    >
                        Show training history.
                    </AccordionSummary>
                    <AccordionDetails>
                        <List >
                            {trainingHistory ? trainingHistory.map((option) => (option.training_dataset ?
                                <Paper variant="outlined" sx={{ padding: "5px", margin: "5px" }}>
                                    <Typography>
                                        Checkpoint: {option.id}
                                    </Typography>
                                    <Typography>
                                        Trained from: {option.checkpoint}
                                    </Typography>
                                    <Typography>
                                        Dataset trained on: {option.training_dataset}
                                    </Typography>
                                    <Accordion>
                                        <AccordionSummary

                                        >
                                            Show hyperparameters.
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>
                                                Epochs: {option.epochs}

                                            </Typography>
                                            <Typography>
                                                Learning rate: {option.learning_rate}
                                            </Typography>
                                            <Typography>
                                                Loss function: {option.loss_function}
                                            </Typography>
                                            <Typography>
                                                Optimiser: {option.optimiser}
                                            </Typography>
                                            <Typography>
                                                Loss function: {option.loss_function}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Accordion>
                                        <AccordionSummary

                                        >
                                            Show training graph.
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TrainingChart id={option.id}/>
                                        </AccordionDetails>
                                    </Accordion>
                                </Paper> : null)
                            ) : null}
                        </List>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Paper >
    )
}

export default CheckpointCard;