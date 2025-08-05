import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Accordion, AccordionDetails, AccordionSummary, Card, Checkbox, List, Paper, TextField, Tooltip } from '@mui/material/';
import Typography from '@mui/material/Typography';
import SpeedIcon from '@mui/icons-material/Speed';
import EditIcon from '@mui/icons-material/Edit';
import HubIcon from '@mui/icons-material/Hub';
import SaveIcon from '@mui/icons-material/Save';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { appendData, handleCloseDelDialog, handleOpenDelDialog, handleTextFieldChange, pushData, validateField, validateForm } from '../../utils.js';
import { fetchData, Validation, validateValidator } from '../../utils.js';
import TrainingChart from '../TrainingChart/TrainingChart.js';
import DeleteDialog from '../DeleteDialog/DeleteDialog.js';


const CheckpointCard = ({ checkpoint, handleCheckpointChange, formCheckpoints, updateCheckpoints }) => {

    const defaultFields = {
        "name": new Validation({ required: false, regex: /^[A-Za-z0-9 -]{1,30}$/, helper: "Please enter an alphanumeric name for the checkpoint." }),
        "description": new Validation({ required: false, regex: /^[A-Za-z0-9 /+()!?<>£$^%*#'@",.:;\n-]{1,150}$/, helper: "Please enter an alphanumeric description for the checkpoint." }),
    }
    const [trainingTree, setTrainingTree] = React.useState([]);
    const [testMetrics, setTestMetrics] = React.useState([]);
    const [testSessions, setTestSessions] = React.useState([]);
    const [localFields, setLocalFields] = React.useState(structuredClone(defaultFields));

    const [editName, setEditName] = React.useState(true)
    const [editDescription, setEditDescription] = React.useState(true)
    React.useEffect(() => {
        fetchData(`/training_tree/${checkpoint.id}`, setTrainingTree)

    }, []);
    React.useEffect(() => {
        setLocalFields((prevVals) => {
            return produce(prevVals, (draft) => {
                draft.name.value = checkpoint.name ? checkpoint.name : ""
                draft.description.value = checkpoint.description ? checkpoint.description : ""
            })
        })

    }, [checkpoint]);
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
    const handleFieldSave = (key) => {
        console.log("CheckpointCard: handleFieldSave():")
        console.log("CheckpointCard: handleFieldSave(): localFields", localFields)
        console.log("CheckpointCard: handleFieldSave(): key", key)
        validateField({ key: key, setFormState: setLocalFields })

        setTimeout(() => {

            let formToPush = {
                [key]: localFields[key].value,
            }

            let formValid = validateForm({ formElement: localFields })
            if (!formValid) {
                console.log("CheckpointCard: formValid is false:")
                pushData(`/checkpoint_update_fields/${checkpoint.id}`, formToPush)
                // setLocalFields((prevVals) => {
                //     return produce(prevVals, (draft) => {
                //         draft[key].value = checkpoint[key] ? checkpoint.name : ""
                //     })
                // })
            }
            else {
                console.log("CheckpointCard: formValid is true:")
            }
        }, 0)
    }
    const checked = formCheckpoints.some(item => item.checkpointId === checkpoint.id && item.modelId === checkpoint.model_id)

    const delCheckpoint = () => {
        pushData(`delete_checkpoint/${checkpoint.model_id}/${checkpoint.id}`).then(() => {
            updateCheckpoints()
        })
    }
    const [delDialog, setDelDialog] = React.useState(false);

    return (
        <Paper variant='outlined' >
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Tooltip title="Select for training"><Checkbox data-model-id={checkpoint.model_id} checked={checked} data-checkpoint-id={checkpoint.id} onChange={(event) => handleCheckpointChange(checkpoint.model_id, checkpoint.id)} /></Tooltip>
                <Tooltip>
                    <DeleteDialog id={"checkpoint"} open={delDialog} handleClose={handleCloseDelDialog} setDelDialog={setDelDialog} delFunction={delCheckpoint} />
                    <IconButton onClick={() => { handleOpenDelDialog(setDelDialog) }} aria-label="delete" color="error" >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography >Checkpoint Name: {editName ? localFields.name.value : ""} </Typography>
                    {editName ?
                        <IconButton aria-label="edit" name="name" color="primary" onClick={() => setEditName(!editName)} ><EditIcon /></IconButton>
                        :
                        <>
                            <TextField label="Checkpoint Name" name='name' helperText={localFields.name.error ? localFields.name.helper : ""} error={localFields.name.error} onChange={(event) => {
                                handleTextFieldChange({ eve: event, setState: setLocalFields });
                                validateField({ key: 'name', setFormState: setLocalFields });
                            }} value={localFields.name.value || ''} size="small" autofocus />
                            <IconButton aria-label="save" name="name" color={localFields.name.error ? "default" : "primary"}
                                onClick={(event) => {
                                    if (!localFields.name.error) {
                                        setEditName(!editName)
                                        handleFieldSave("name")
                                    }
                                }} >
                                <SaveIcon />
                            </IconButton>
                            <IconButton aria-label="cancel" name="cancel" color={localFields.name.error ? "default" : "primary"}
                                onClick={() => setEditName(!editName)} >
                                <DoNotDisturbIcon />
                            </IconButton>
                        </>}


                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography sx={{ whiteSpace: 'pre-line' }}>Checkpoint description: {editDescription ? localFields.description.value : ""} </Typography>
                    {editDescription ?
                        <IconButton aria-label="edit" color="primary" onClick={() => setEditDescription(!editDescription)} ><EditIcon /></IconButton>

                        :
                        <>
                            <TextField multiline fullWidth maxRows={10} minRows={1} label="Checkpoint Description" name='description' helperText={localFields.description.error ? localFields.description.helper : ""} error={localFields.description.error} onChange={(event) => {
                                handleTextFieldChange({ eve: event, setState: setLocalFields });
                                validateField({ key: 'description', setFormState: setLocalFields });
                            }} value={localFields.description.value || ''} size="small" autofocus />
                            <IconButton aria-label="save" color={localFields.description.error ? "default" : "primary"}
                                onClick={(event) => {
                                    if (!localFields.description.error) {
                                        setEditDescription(!editDescription)
                                        handleFieldSave("description")
                                    }
                                }} >
                                <SaveIcon />
                            </IconButton>
                            <IconButton aria-label="cancel" name="cancel" color={localFields.name.error ? "default" : "primary"}
                                onClick={() => setEditDescription(!editDescription)} >
                                <DoNotDisturbIcon />
                            </IconButton>
                        </>}
                </Box>


                <Typography>Checkpoint ID: {checkpoint.id} </Typography>
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