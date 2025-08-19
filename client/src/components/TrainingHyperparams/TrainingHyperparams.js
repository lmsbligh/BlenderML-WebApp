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

    React.useEffect(() => {
        console.log("localForm: ", localForm)
    }, [localForm])
    React.useEffect(() => {
        saveCallback(() => {
            validateBatchSize(localForm.batchSize.value)
            return localForm
        });
    }, [localForm]);
    const validateBatchSize = (input) => {
        let value;
        if (input && input.target) {
            value = input.target.value
        }
        else {
            value = input
        }
        if (Number(value) >= datasetSize) {
            setLocalForm((prevVal) => {
                return produce(prevVal, (draft) => {
                    draft['batchSize'].error = true
                })
            })
        }
        else {
            setLocalForm((prevVal) => {
                return produce(prevVal, (draft) => {
                    draft['batchSize'].error = false
                })
            })
        }
    }
    return (
        <>
            <TextField
                error={localForm.epochs.error}
                name="epochs"
                label="Epochs"
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    },
                }}
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
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    },
                }}
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
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    },
                }}
                value={localForm.learningRate.value}
                onChange={(event) => {
                    handleTextFieldChange({ eve: event, setState: setLocalForm })
                    validateField({ key: 'learningRate', setFormState: setLocalForm })
                }}
            />
            <SelectorOptimizer
                error={localForm.optimizer.error}
                selectedOptimizer={selectedOptimizer}
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                    }
                }}
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
        </>)

}

export default TrainingHyperparams