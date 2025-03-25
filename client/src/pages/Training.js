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
import { fetchData, handleSelectorFormChange, handleTextFieldChange, pushData } from '../utils.js'
import SelectorOptimizer from '../components/SelectorOptimizer/SelectorOptimizer.js';
import SelectorLoss from '../components/SelectorLoss/SelectorLoss.js';

export default function Training() {

    const [trainingForm, setTrainingForm] = useImmer({
        "model": "",
        "checkpoint": "",
        "dataset": "",
        "epochs": 100,
        "learningRate": 0.001,
        "optimizer": "ADAM",
        "lossFunction": "MSE",
        "xVal": 20,
        "randomOrientation": true
    })

    const [modelData, setModelData] = useImmer([]);
    const [selectedModel, setSelectedModel] = React.useState('');

    const [datasetOptions, setDatasetOptions] = React.useState([]);
    const [selectedDataset, setSelectedDataset] = React.useState('');

    const [optimizerOptions, setOptimizerOptions] = React.useState([{ "value": 0, "label": "Gradient descent" }, { "value": 1, "label": "ADAM" }]);
    const [selectedOptimizer, setSelectedOptimizer] = React.useState('');

    const [lossOptions, setLossOptions] = React.useState([{ "value": 0, "label": "MSE" }, { "value": 1, "label": "MAE" }]);
    const [selectedLoss, setSelectedLoss] = React.useState('');

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
        pushData('submit_training', trainingForm)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}><Grid container>
            <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column", gap: "10px", padding: "5px", alignContent: "space-around" }}>
                <CssBaseline />
                    {modelData ? <SelectorModel selectedModel={selectedModel} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedModel, setForm: setTrainingForm, options: modelData }) }} modelOptions={modelData} /> : null}
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
                    <Button variant="contained" disabled style={{ width: '150px' }}>Load</Button>
                <SelectorCheckpoint selectedCheckpoint={selectedCheckpoint} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedCheckpoint, setForm: setTrainingForm }) }} checkpointOptions={checkpointOptions} />
                <SelectorDataset selectedDataset={selectedDataset} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedDataset, setForm: setTrainingForm, options: datasetOptions }) }} datasetOptions={datasetOptions} />
                <Button variant='contained' disabled style={{ width: '150px' }}>Add Dataset </Button>
                <TextField name="epochs" label="Epochs" value={trainingForm.epochs} onChange={(event) => { handleTextFieldChange({ eve: event, setState: setTrainingForm })}}></TextField>
                <TextField name="learningRate" label="Learning rate" value={trainingForm.learningRate} onChange={(event) => { handleTextFieldChange({ eve: event, setState: setTrainingForm })}}></TextField>
                <SelectorOptimizer selectedOptimizer={selectedOptimizer} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedOptimizer, setForm: setTrainingForm, options: optimizerOptions }) }} optimizerOptions={optimizerOptions} />
                <SelectorLoss selectedLoss={selectedLoss} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedLoss, setForm: setTrainingForm, options: lossOptions }) }} lossOptions={lossOptions} />
                <TextField name="xVal" label="Cross validation set %" value={trainingForm.xVal} onChange={(event) => { handleTextFieldChange({ eve: event, setState: setTrainingForm })}}></TextField>
                <Button variant='contained' style={{ alignSelf: 'center', width: '150px' }} onClick={handleTrain}>Train</Button>
            </Grid>
        </Grid>
        </Box>
    )
}