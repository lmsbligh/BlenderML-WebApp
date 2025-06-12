import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Grid } from '@mui/material/';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';

import ModelDetailsCard from '../components/ModelDetailsCard/ModelDetailsCard.js'
import SelectedModel from '../components/SelectedModel/SelectedModel.js'
import SelectorModel from '../components/SelectorModel/SelectorModel.js';
import SelectorDataset from '../components/SelectorDataset/SelectorDataset.js'
import SelectorCheckpoint from '../components/SelectorCheckpoint/SelectorCheckpoint.js';
import { fetchData, handleSelectorFormChange, handleTextFieldChange, pushData, validateField, validateForm, Validation } from '../utils.js'
import SelectorOptimizer from '../components/SelectorOptimizer/SelectorOptimizer.js';
import SelectorLoss from '../components/SelectorLoss/SelectorLoss.js';

export default function Training() {

    const [trainingForm, setTrainingForm] = useImmer(structuredClone({
        "model": new Validation({
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please select a model."
        }),
        "checkpoint": new Validation({
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please select a checkpoint."
        }),
        "trainingDataset": new Validation({
            value: "",
            error: false,
            regex: "",
            required: false,
            helper: "Please select a training dataset."
        }),
        "CVDataset": new Validation({
            value: "",
            error: false,
            regex: "",
            required: false,
            helper: "Please select a CV dataset."
        }),
        "testDataset": new Validation({
            value: "",
            error: false,
            regex: "",
            required: false,
            helper: "Please select a test dataset."
        }),
        "epochs": new Validation({
            value: 100,
            error: false,
            regex: /^(?:[1-9]\d{0,2}|1000)$/,
            required: true,
            helper: "Please enter an integer between 1 and 1000."
        }),
        "learningRate": new Validation({
            value: 0.001,
            error: false,
            regex: /^0.(?:1|(?:0[1-9]|10)|(?:00[1-9]|0[1-9]\d|100)|(?:000[1-9]|00[1-9]\d|0[1-9]\d{2}|1000))$/,
            required: true,
            helper: "Please enter a number between 0.1 and 0.0001, with up to 4 decimal places."
        }),
        "optimizer": new Validation({
            value: "ADAM",
            error: false,
            regex: "",
            required: true,
        }),
        "lossFunction": new Validation({
            value: "MSE",
            error: false,
            regex: "",
            required: true
        })
    }))

    const [modelData, setModelData] = useImmer([]);
    const [selectedModel, setSelectedModel] = React.useState('');

    const [datasetOptions, setDatasetOptions] = React.useState([]);
    const [selectedTrainingDataset, setSelectedTrainingDataset] = React.useState('');
    const [selectedCVDataset, setSelectedCVDataset] = React.useState('');
    const [selectedTestDataset, setSelectedTestDataset] = React.useState('');

    
    const [optimizerOptions, setOptimizerOptions] = React.useState([{ "value": 0, "label": "Gradient descent" }, { "value": 1, "label": "ADAM" }]);
    const [selectedOptimizer, setSelectedOptimizer] = React.useState(optimizerOptions[1]);

    const [lossOptions, setLossOptions] = React.useState([{ "value": 0, "label": "MSE" }, { "value": 1, "label": "MAE" }]);
    const [selectedLoss, setSelectedLoss] = React.useState(lossOptions[0]);

    const [checkpointOptions, setCheckpointOptions] = React.useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = React.useState('');


    React.useEffect(() => {
        fetchData('datasets', setDatasetOptions)
        fetchData('models', setModelData)
    }, []);

    React.useEffect(() => {
        if (!selectedModel) return;
        fetchData(`checkpoints/${selectedModel.value}`, setCheckpointOptions)
    }, [selectedModel]);


    const handleTrain = (event) => {
        for (let key in trainingForm) {
            validateField({key: key, setFormState: setTrainingForm})
        }
        setTimeout(() => {
            var formValid = validateForm({ formElement: trainingForm })
            if (!formValid) {
                const formToPush = {
                    model: trainingForm.model.value,
                    checkpoint: trainingForm.checkpoint.value,
                    trainingDataset: trainingForm.trainingDataset.value,
                    CVDataset: trainingForm.CVDataset.value,
                    testDataset: trainingForm.testDataset.value,
                    epochs: trainingForm.epochs.value,
                    learningRate: trainingForm.learningRate.value,
                    optimizer: trainingForm.optimizer.value,
                    lossFunction: trainingForm.lossFunction.value,
                }
                pushData('submit_training', formToPush)
            }
        }, 0)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}><Grid container>
            <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column", gap: "10px", padding: "5px", alignContent: "space-around" }}>
                <CssBaseline />
                {modelData ? <SelectorModel
                    error={trainingForm.model.error}
                    helperText={trainingForm.model.error ? trainingForm.model.helper : ''}
                    selectedModel={selectedModel}
                    modelOptions={modelData}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedModel,
                            setForm: setTrainingForm,
                            options: modelData
                        })
                        validateField({ key: 'model', setFormState: setTrainingForm })
                    }}

                /> : null}
                <Box>
                    <List>
                        <SelectedModel selectedModel={selectedModel} />
                        <ListItem>
                            <div>
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ArrowDropDownIcon />}
                                    >
                                        Show more details
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List>
                                            {
                                                Array.from({ length: 5 }, (_, i) => (
                                                    <ListItem key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {
                                                            <ModelDetailsCard layer_n={i} />
                                                        }
                                                    </ListItem>
                                                ))
                                            }
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                        </ListItem>
                    </List>
                </Box>
                {selectedModel ? <SelectorCheckpoint
                    error={trainingForm.checkpoint.error}
                    helperText={trainingForm.checkpoint.error ? trainingForm.checkpoint.helper : ''}
                    selectedCheckpoint={selectedCheckpoint}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedCheckpoint,
                            setForm: setTrainingForm
                        })
                        validateField({ key: 'checkpoint', setFormState: setTrainingForm })
                    }}
                    checkpointOptions={checkpointOptions}
                /> : null}
                <SelectorDataset
                    error={trainingForm.trainingDataset.error}
                    datasetType={"training"}
                    helperText={trainingForm.trainingDataset.error ? trainingForm.trainingDataset.helper : ''}
                    selectedDataset={selectedTrainingDataset}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedTrainingDataset,
                            setForm: setTrainingForm,
                            options: datasetOptions
                        })
                        validateField({ key: 'trainingDataset', setFormState: setTrainingForm })

                    }}
                    datasetOptions={datasetOptions} />
                    <SelectorDataset
                    datasetType={"CV"}

                    error={trainingForm.CVDataset.error}
                    helperText={trainingForm.CVDataset.error ? trainingForm.CVDataset.helper : ''}
                    selectedDataset={selectedCVDataset}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedCVDataset,
                            setForm: setTrainingForm,
                            options: datasetOptions
                        })
                        validateField({ key: 'CVDataset', setFormState: setTrainingForm })

                    }}
                    datasetOptions={datasetOptions} />
                    <SelectorDataset
                    datasetType={"test"}
                    error={trainingForm.testDataset.error}
                    helperText={trainingForm.testDataset.error ? trainingForm.testDataset.helper : ''}
                    selectedDataset={selectedTestDataset}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedTestDataset,
                            setForm: setTrainingForm,
                            options: datasetOptions
                        })
                        validateField({ key: 'testDataset', setFormState: setTrainingForm })

                    }}
                    datasetOptions={datasetOptions} />
                <TextField
                    error={trainingForm.epochs.error}
                    name="epochs"
                    label="Epochs"
                    helperText={trainingForm.epochs.error ? trainingForm.epochs.helper : ''}
                    value={trainingForm.epochs.value}
                    onChange={(event) => {
                        handleTextFieldChange({ eve: event, setState: setTrainingForm })
                        validateField({ key: 'epochs', setFormState: setTrainingForm })
                    }}
                />
                <TextField
                    error={trainingForm.learningRate.error}
                    helperText={trainingForm.learningRate.error ? trainingForm.learningRate.helper : ''}
                    name="learningRate"
                    label="Learning rate"
                    value={trainingForm.learningRate.value}
                    onChange={(event) => {
                        handleTextFieldChange({ eve: event, setState: setTrainingForm })
                        validateField({ key: 'learningRate', setFormState: setTrainingForm })
                    }}
                />
                <SelectorOptimizer
                    error={trainingForm.optimizer.error}
                    selectedOptimizer={selectedOptimizer}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedOptimizer,
                            setForm: setTrainingForm,
                            options: optimizerOptions
                        })
                        validateField({ key: 'optimizer', setFormState: setTrainingForm })
                    }}
                    optimizerOptions={optimizerOptions}
                />
                <SelectorLoss
                    error={trainingForm.lossFunction.error}
                    selectedLoss={selectedLoss}
                    handleChange={(event) => {
                        handleSelectorFormChange({
                            eve: event,
                            setSelector: setSelectedLoss,
                            setForm: setTrainingForm,
                            options: lossOptions
                        })
                        validateField({ key: 'lossFunction', setFormState: setTrainingForm })
                    }}
                    lossOptions={lossOptions}
                />

                <Button
                    variant='contained'
                    style={{ alignSelf: 'center', width: '150px' }}
                    onClick={handleTrain}
                >
                    Train
                </Button>
            </Grid>
        </Grid>
        </Box>
    )
}