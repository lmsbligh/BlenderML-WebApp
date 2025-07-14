import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";
import { io } from 'socket.io-client'

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Grid, FormHelperText, IconButton } from '@mui/material/';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { validateBatchSize, fetchData, handleSelectorFormChange, handleTextFieldChange, pushData, validateField, validateForm, Validation, appendData } from '../../utils.js'
import SelectorOptimizer from '../SelectorOptimizer/SelectorOptimizer.js';
import SelectorLoss from '../SelectorLoss/SelectorLoss.js';


const TrainingHyperparams = ({ trainingForm, datasetSize, saveCallback }) => {
    const hyperparamKeys = ["epochs", "learningRate", "batchSize", "optimizer", "lossFunction"];
    const hyperparamSubset = Object.fromEntries(
        Object.entries(trainingForm).filter(([key]) => hyperparamKeys.includes(key))
    );
    const [localForm, setLocalForm] = useImmer(structuredClone(hyperparamSubset))
    const [optimizerOptions, setOptimizerOptions] = React.useState([{ "value": 0, "label": "Gradient descent" }, { "value": 1, "label": "ADAM" }]);
    const [selectedOptimizer, setSelectedOptimizer] = React.useState(optimizerOptions[1]);
    const [lossOptions, setLossOptions] = React.useState([{ "value": 0, "label": "MSE" }, { "value": 1, "label": "MAE" }]);
    const [selectedLoss, setSelectedLoss] = React.useState(lossOptions[0]);
    React.useEffect(() => {
        console.log("localForm: ", localForm)
    }, [localForm])
    React.useEffect(() => {
        saveCallback(() => localForm);
    }, [localForm]);
    return (
        <>
            <TextField
                error={localForm.epochs.error}
                name="epochs"
                label="Epochs"
                helperText={localForm.epochs.error ? localForm.epochs.helper : ''}
                value={localForm.epochs.value}
                onChange={(event) => {
                    handleTextFieldChange({ eve: event, setState: setLocalForm })
                    validateField({ key: 'epochs', setFormState: setLocalForm })
                }}
            />
            <TextField
                error={localForm.batchSize.error}
                name="batchSize"
                label="Batch Size"
                helperText={localForm.batchSize.error ? localForm.batchSize.helper : ''}
                value={localForm.batchSize.value}
                onChange={(event) => {
                    handleTextFieldChange({ eve: event, setState: setLocalForm })
                    validateField({ key: 'batchSize', setFormState: setLocalForm })
                    validateBatchSize(event, setLocalForm, datasetSize)

                }}
            />
            <TextField
                error={localForm.learningRate.error}
                helperText={localForm.learningRate.error ? localForm.learningRate.helper : ''}
                name="learningRate"
                label="Learning rate"
                value={localForm.learningRate.value}
                onChange={(event) => {
                    handleTextFieldChange({ eve: event, setState: setLocalForm })
                    validateField({ key: 'learningRate', setFormState: setLocalForm })
                }}
            />
            <SelectorOptimizer
                error={localForm.optimizer.error}
                selectedOptimizer={selectedOptimizer}
                handleChange={(event) => {
                    handleSelectorFormChange({
                        eve: event,
                        setSelector: setSelectedOptimizer,
                        setForm: setLocalForm,
                        options: optimizerOptions
                    })
                    validateField({ key: 'optimizer', setFormState: setLocalForm })
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
                        setForm: setLocalForm,
                        options: lossOptions
                    })
                    validateField({ key: 'lossFunction', setFormState: setLocalForm })
                }}
                lossOptions={lossOptions}
            />
        </>)

}

export default TrainingHyperparams