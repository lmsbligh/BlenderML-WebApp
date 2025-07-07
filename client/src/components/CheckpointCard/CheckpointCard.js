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


const CheckpointCard = ({ id, model_id, handleCheckpointChange }) => {
    const [trainingTree, setTrainingTree] = React.useState([]);
    const [testMetrics, setTestMetrics] = React.useState([]);
    const [testSessions, setTestSessions] = React.useState([]);

    React.useEffect(() => {
        fetchData(`/training_tree/${id}`, setTrainingTree)
    }, []);
    React.useEffect(() => {
        fetchData(`/checkpoint_test_sessions/${id}`, setTestSessions)
    }, []);
    React.useEffect(() => {
        testSessions.map((option) => {
            appendData(`/training_metrics/${option.id}`, setTestMetrics)
        })

    }, [testSessions])


    React.useEffect(() => {
        console.log(`${id} testMetrics: `, testMetrics)
    }, [testMetrics])
    const delFunction = (event) => {

    }
    return (
        <Paper variant='outlined' >
            {console.log("CheckpointCard: ", id)}
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Tooltip title="Select for training"><Checkbox data-model-id={model_id} data-checkpoint-id={id} onChange={(event) => handleCheckpointChange(event.target.getAttribute('data-model-id'), event.target.getAttribute('data-checkpoint-id'))}/></Tooltip>
                <Tooltip><IconButton aria-label="delete" color="error" ><DeleteIcon /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                <Typography>Checkpoint: {id} </Typography>
                <Typography>Base Model: {model_id} </Typography>
                {testSessions.length > 0 ?
                    <Accordion>
                        <AccordionSummary expandIcon={<SpeedIcon color='primary' />} sx={{
                            '& .MuiAccordionSummary-expandIconWrapper': {
                                transform: 'none !important',
                            },
                            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                transform: 'none !important',
                            },
                        }}>
                            Show test history
                        </AccordionSummary>
                        <AccordionDetails>
                            {testSessions.map((option) => {
                                const matchingMetric = testMetrics.find((metric) => metric.runId === option.id)
                                console.log("matching metric: ", matchingMetric)
                                if (option.cv_dataset) {
                                    return <Paper variant="outlined" sx={{ padding: "5px", margin: "5px" }}>
                                        <Typography>CV set: {option.cv_dataset}</Typography>
                                        <Typography>Loss function: {option.loss_function}</Typography>
                                        <Typography>Loss: {matchingMetric ? matchingMetric.data?.[0].loss :  'N/A'}</Typography>
                                    </Paper>

                                }
                                if (option.test_dataset) {
                                    return <Paper variant="outlined" sx={{ padding: "5px", margin: "5px" }}>
                                        <Typography>Test set: {option.test_dataset}</Typography>
                                        <Typography>Loss function: {option.loss_function}</Typography>
                                        <Typography>Loss: {matchingMetric ? matchingMetric.data?.[0].loss : 'N/A'}</Typography>
                                    </Paper>
                                }
                            })}
                        </AccordionDetails>
                    </Accordion> : null}
                <Accordion>
                    <AccordionSummary
                        expandIcon={<HubIcon color='primary' />}
                    >
                        Show training history.
                    </AccordionSummary>
                    <AccordionDetails>
                        <List >
                            {trainingTree ? trainingTree.map((option) => (option.training_dataset ?
                                <Paper key={option.id} variant="outlined" sx={{ padding: "5px", margin: "5px" }}>
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
                                            <TrainingChart id={option.id} />
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