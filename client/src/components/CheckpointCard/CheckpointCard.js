import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Accordion, AccordionDetails, AccordionSummary, Card, Checkbox, List, Paper, Tooltip } from '@mui/material/';
import Typography from '@mui/material/Typography';
import SpeedIcon from '@mui/icons-material/Speed';
import HubIcon from '@mui/icons-material/Hub';

import { appendData, validateField } from '../../utils.js';
import { fetchData } from '../../utils.js';
import TrainingChart from '../TrainingChart/TrainingChart.js';


const CheckpointCard = ({ checkpoint, handleCheckpointChange, formCheckpoints }) => {
    const [trainingTree, setTrainingTree] = React.useState([]);
    const [testMetrics, setTestMetrics] = React.useState([]);
    const [testSessions, setTestSessions] = React.useState([]);
    console.log("local checkpoint: ", checkpoint.id)
    React.useEffect(() => {
        fetchData(`/training_tree/${checkpoint.id}`, setTrainingTree)
    }, []);
    React.useEffect(() => {
        fetchData(`/checkpoint_test_sessions/${checkpoint.id}`, setTestSessions)
    }, []);
    React.useEffect(() => {
        console.log("testSessions: ", testSessions)
        testSessions.map((option) => {
            appendData(`/training_metrics/${option.id}`, setTestMetrics)
        })

    }, [testSessions])

    React.useEffect(() => {
        console.log("trainingTree: ", trainingTree)
    }, [trainingTree])
    React.useEffect(() => {
        console.log(`${checkpoint.id} testMetrics: `, testMetrics)
    }, [testMetrics])
    const delFunction = (event) => {

    }

    const checked = formCheckpoints.some(item => item.checkpointId === checkpoint.id && item.modelId === checkpoint.model_id)
    
    return (
        <Paper variant='outlined' >
            {console.log("!!!checked: ", checked)}
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Tooltip title="Select for training"><Checkbox data-model-id={checkpoint.model_id} checked={checked} data-checkpoint-id={checkpoint.id} onChange={(event) => handleCheckpointChange(checkpoint.model_id, checkpoint.id)} /></Tooltip>
                <Tooltip><IconButton aria-label="delete" color="error" ><DeleteIcon /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                <Typography>Checkpoint: {checkpoint.id} </Typography>
                <Typography>Base Model: {checkpoint.model_id} </Typography>
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
                                        <Typography>Loss: {matchingMetric ? matchingMetric.data?.[0].loss : 'N/A'}</Typography>
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