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
import fetchData from '../utils.js';

export default function Training() {

    const [trainingForm, setTrainingForm] = useImmer({
        "model":"",
        "checkpoint":"",
        "dataset":"",
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

    const [optimizerOptions, setOptimizerOptions] = React.useState([{"value": 0, "label": "Gradient descent"},{"value": 1, "label": "ADAM"}]);
    const [selectedOptimizer, setSelectedOptimizer] = React.useState('');

    const [lossOptions, setLossOptions] = React.useState([{"value": 0, "label": "MSE"},{"value": 1, "label": "MAE"}]);
    const [selectedLoss, setSelectedLoss] = React.useState('');
    
    const [checkpointOptions, setCheckpointOptions] = React.useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = React.useState('');

    React.useEffect(()=> {
                fetchData('getDatasets', setDatasetOptions)
                fetchData('models', setModelData)
            }, []);

    React.useEffect(()=>{
        if (!selectedModel) return;
        fetchData(`checkpoints/${selectedModel.value}`, setCheckpointOptions)
    }, [selectedModel]);

    const handleModelChange = (event) => {
        // setSelectedModel(modelData[event.target.value]);
        const model = modelData.find((option) => option.value === event.target.value);
        setSelectedModel(model)
        setSelectedCheckpoint(null)
        setTrainingForm((prevVals) => {
            return produce(prevVals, (draft) =>{
                draft.model = event.target.value
            })
        })
    };

    const handleDatasetChange = (event) => {
        const datasetVal = datasetOptions.find((option) => option.value === event.target.value);
        setSelectedDataset(datasetVal)
        setTrainingForm((prevVals) => {
            return produce(prevVals, (draft) =>{
                draft.dataset = event.target.value
            })
        })
        };

    const handleOptimizerChange = (event) => {
        const optimizerVal = optimizerOptions.find((option) => option.value === event.target.value);
        setSelectedOptimizer(optimizerVal)
        setTrainingForm((prevVals) => {
            return produce(prevVals, (draft) =>{
                draft.optimizer = optimizerVal.label
            })
        })
    };

    const handleLossChange = (event) => {
        setSelectedLoss(lossOptions[event.target.value])
        const lossVal = lossOptions.find((option) => option.value === event.target.value);
        setTrainingForm((prevVals) => {
            return produce(prevVals, (draft) =>{
                draft.lossFunction = lossVal.label
            })
        })
    };

    const handleTextFieldChange = (event) => {
        setTrainingForm((prevVals) => {
            return produce(prevVals, (draft) => {
                draft[event.target.name] = event.target.value;
            })
        })
    }

    const handleCheckpointChange = (event) => {
        setSelectedCheckpoint(event.target.value)
        setTrainingForm((prevVals) => {
            return produce(prevVals, (draft) => {
                draft.checkpoint = event.target.value;
            }
            )
        })
    }
    
    const handleTrain = (event) => {
        console.log("handleTrain ran")
        try {
            fetch('submitTraining', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(trainingForm),
            })

        }catch (error) {
            console.error('Error:', error);
        }
    }

    return (
            <Box sx={{ display: 'flex', flexDirection: 'column'}}><Grid container>
            <Grid item  sm={6} xs={12} sx={{display: "flex", flexDirection: "column", gap: "10px", padding: "5px", alignContent: "space-around"}}>
                <CssBaseline />
                <FormControl fullWidth>
                { modelData ? <SelectorModel selectedModel={selectedModel} handleChange={handleModelChange} modelOptions={modelData}/> : null}
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
                                            Array.from({length:5}, (_, i) => (
                                                <ListItem key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                                {
                                                    <ModelDetailsCard layer_n={i}/>
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
                </FormControl>
                <SelectorCheckpoint selectedCheckpoint={selectedCheckpoint} handleChange={handleCheckpointChange} checkpointOptions={checkpointOptions}/>
                <SelectorDataset selectedDataset={selectedDataset} handleChange={handleDatasetChange} datasetOptions={datasetOptions} />
                <Button variant='contained' disabled style={{width: '150px' }}>Add Dataset </Button>
                <TextField name="epochs" label="Epochs" value={trainingForm.epochs} onChange={handleTextFieldChange}></TextField>
                <TextField name="learningRate" label="Learning rate" value={trainingForm.learningRate} onChange={handleTextFieldChange}></TextField>
                <FormControl>
                    <InputLabel id="Optimizer-Selector-Label" >Optimizer</InputLabel>
                    <Select
                        labelId="Optimizer-Selector-Label"
                        label="Optimizer"
                        id="simple-select"
                        onChange={handleOptimizerChange}
                        renderValue={() => selectedOptimizer ? selectedOptimizer.label : "Select an optimizer" // Show the label as the selected text
                        }
                    >
                        {optimizerOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>        
                                <Card sx={{ width: "100%"}}>
                                    <CardContent>
                                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                            {option.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </MenuItem>
                        ))}
                    </Select>
                    </FormControl>
                    <FormControl>
                    <InputLabel id="Loss-Selector-Label">Loss Function</InputLabel>
                    <Select
                        labelId="Loss-Selector-Label"
                        label="Loss function"
                        id="simple-select"
                        onChange={handleLossChange}
                        renderValue={() => selectedLoss ? selectedLoss.label : "Select an optimizer" // Show the label as the selected text
                        }
                    >
                        {lossOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>        
                                <Card sx={{ width: "100%"}}>
                                    <CardContent>
                                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                            {option.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField name="xVal" label="Cross validation set %" value={trainingForm.xVal} onChange={handleTextFieldChange}></TextField>
                <Button variant='contained' style={{alignSelf:'center', width: '150px' }} onClick={handleTrain}>Train</Button>
            </Grid>
            </Grid>
            </Box>
    )
}