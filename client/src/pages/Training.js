import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";
import { io } from 'socket.io-client'

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Grid, FormHelperText, IconButton, useTheme, Paper } from '@mui/material/';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ModelDetailsCard from '../components/ModelDetailsCard/ModelDetailsCard.js'
import SelectedModel from '../components/SelectedModel/SelectedModel.js'
import SelectorModel from '../components/SelectorModel/SelectorModel.js';
import SelectorDataset from '../components/SelectorDataset/SelectorDataset.js'
import SelectorCheckpoint from '../components/SelectorCheckpoint/SelectorCheckpoint.js';
import { fetchData, handleSelectorFormChange, handleTextFieldChange, pushData, validateField, validateForm, Validation, appendData } from '../utils.js'
import SelectorOptimizer from '../components/SelectorOptimizer/SelectorOptimizer.js';
import SelectorLoss from '../components/SelectorLoss/SelectorLoss.js';
import TrainingChart from '../components/TrainingChart/TrainingChart';
import TestChart from '../components/TestChart/TestChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import CheckpointCard from '../components/CheckpointCard/CheckpointCard.js';
import SessionAnalysis from '../components/SessionAnalysis/SessionAnalysis.js';
import AccordionModels from '../components/AccordionModels/AccordionModels.js';
import TrainingHyperparams from '../components/TrainingHyperparams/TrainingHyperparams.js';

export default function Training() {
    const theme = useTheme();
    const [trainingForm, setTrainingForm] = useImmer(structuredClone({
        "checkpoints": [],
        "trainDataset": new Validation({
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
            value: 1,
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
        }),
        "batchSize": new Validation({
            value: 20,
            error: false,
            regex: /^(?:[1-9]\d{0,2}|1000)$/,
            required: true,
            helper: "Batch size cannot be bigger than the size of the training dataset."
        })
    }))
    const [trainingMode, setTrainingMode] = useImmer({
        "selected": false,
        "helper": "Please select a training, CV or test set."
    })
    const [modelData, setModelData] = useImmer([]);
    // const [selectedModel, setSelectedModel] = React.useState('');

    const [datasetOptions, setDatasetOptions] = React.useState([]);
    const [selectedTrainDataset, setSelectedTrainDataset] = React.useState('');
    const [selectedCVDataset, setSelectedCVDataset] = React.useState('');
    const [selectedTestDataset, setSelectedTestDataset] = React.useState('');

    // const [checkpointOptions, setCheckpointOptions] = React.useState([]);

    const [trainingChartData, setTrainingChartData] = useImmer([]);
    // const [testChartData, setTestChartData] = React.useState([]);

    const [trainingLog, setTrainingLog] = React.useState([]);

    const [sessions, setSessions] = useImmer([]);
    const socket = io('http://localhost:5000')
    const [isTraining, setIsTraining] = React.useState(false)
    const fetchHyperparams = React.useRef(() => ({}));
    const [compatibleDatasets, setCompatibleDatasets] = React.useState(true)
    const [lossOptions, setLossOptions] = React.useState([{ "value": 0, "label": "MSE" }, { "value": 1, "label": "MAE" }]);
    const [selectedLoss, setSelectedLoss] = React.useState(lossOptions[0]);

    React.useEffect(() => {
        socket.on("training_update", (data) => {
            setTrainingLog(prev => [...prev, `Epoch ${data.epoch}, Batch ${data.batch}: Loss ${data.loss}`]);
            setTrainingChartData((prevVal) =>
                produce(prevVal, (draft) => {
                    if (draft.length === 0) {
                        draft.push({
                            datasetSize: data.datasetSize,
                            data: [{
                                step: `E${data.epoch}-B${data.batch}`,
                                loss: data.loss
                            }]
                        });
                    } else {
                        draft[0].data.push({
                            step: `E${data.epoch}-B${data.batch}`,
                            loss: data.loss
                        });
                    }
                })
            );
        });
        return () => {
            socket.off("training_update");
            socket.off("connect");
        };
    }, []);
    React.useEffect(() => {
        console.log("trainingChartData: ", trainingChartData)
    }, [trainingChartData]);
    React.useEffect(() => {
        fetchData('models', setModelData)
    }, []);

    // React.useEffect(() => {
    //     if (!selectedModel) return;
    //     fetchData(`checkpoints/${selectedModel.value}`, setCheckpointOptions)
    // }, [selectedModel]);

    React.useEffect(() => {
        fetchData('/sessions', setSessions)
    }, [])

    React.useEffect(() => {
        console.log("trainingSessions: ", sessions)
    }, [sessions])

    React.useEffect(() => {
        console.log("selectedTrainDataset: ", selectedTrainDataset)
    }, [selectedTrainDataset])

    React.useEffect(() => {
        console.log("trainingForm: ", trainingForm)
    }, [trainingForm])

    React.useEffect(() => {
        console.log("trainingForm.checkpoints: ", trainingForm.checkpoints)
        if (trainingForm.checkpoints.length > 0) {
            pushData('/get_compatible_datasets', trainingForm.checkpoints)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // or response.json(), depending on your server response
                })
                .then(data => {
                    console.log("server returned the following compatible datatsets:", data)
                    if (data.length > 0) {
                        setCompatibleDatasets(true)
                        setDatasetOptions(data)
                    }
                    else {
                        setCompatibleDatasets(false)
                        setDatasetOptions([])
                    }

                })
        }
        else {
            setDatasetOptions([])
        }
    }, [trainingForm.checkpoints])

    const checkDatasetSelected = (event) => {
        console.log("checkDatasetSelected ran")
        console.log("event.value: ", event.target.value)
        console.log("event.target.name: ", event.target.name)
        if (event.target.value != "") {
            setTrainingMode((prevVal) => {
                return produce(prevVal, (draft) => {
                    draft["selected"] = true
                })
            })
        }
        if (event.target.value === "") {
            switch (event.target.name) {
                case "trainDataset":
                    console.log("trainingForm.CVDataset: ", trainingForm.CVDataset)
                    console.log("trainingForm.CVDataset: ", trainingForm.testDataset)

                    if (!trainingForm.CVDataset.value && !trainingForm.testDataset.value) {
                        setTrainingMode((prevVal) => {
                            return produce(prevVal, (draft) => {
                                draft["selected"] = false
                            })
                        })
                    }
                    else {
                        setTrainingMode((prevVal) => {
                            return produce(prevVal, (draft) => {
                                draft["selected"] = true
                            })
                        })
                    }
                    break;
                case "CVDataset":
                    if (!trainingForm.trainDataset.value && !trainingForm.testDataset.value) {
                        setTrainingMode((prevVal) => {
                            return produce(prevVal, (draft) => {
                                draft["selected"] = false
                            })
                        })
                    }
                    else {
                        setTrainingMode((prevVal) => {
                            return produce(prevVal, (draft) => {
                                draft["selected"] = true
                            })
                        })
                    }
                    break;
                case "testDataset":
                    if (!trainingForm.CVDataset.value && !trainingForm.trainDataset.value) {
                        setTrainingMode((prevVal) => {
                            return produce(prevVal, (draft) => {
                                draft["selected"] = false
                            })
                        })
                    }
                    else {
                        setTrainingMode((prevVal) => {
                            return produce(prevVal, (draft) => {
                                draft["selected"] = true
                            })
                        })
                    }
                    break;
            }

        }
    }



    const handleCheckpointChange = (newCheckpoint) => {
        const exists = trainingForm.checkpoints.some(obj => obj.id === newCheckpoint.id && obj.model_id === newCheckpoint.model_id)
        if (exists) {
            console.log("handleCheckpointChange: if (exists = true)")
            setTrainingForm((prevVals) => {
                return produce(prevVals, (draft) => {
                    draft.checkpoints = draft.checkpoints.filter((entry) => !(entry.id === newCheckpoint.id && entry.model_id === newCheckpoint.model_id))
                })
            })
        }
        else {
            console.log("handleCheckpointChange: if (exists = false)")
            setTrainingForm((prevVals) => {
                return produce(prevVals, (draft) => {
                    draft.checkpoints.push(newCheckpoint);
                })
            })
        }
    }

    const handleTrain = (event) => {
        for (let key in trainingForm) {
            validateField({ key: key, setFormState: setTrainingForm })
        }

        setTimeout(() => {
            // var formValid = validateForm({ formElement: trainingForm })
            let formToPush = {}
            if (selectedTrainDataset) {
                console.log("if TRUE")
                const hyperparams = fetchHyperparams.current();


                formToPush = {
                    checkpoints: trainingForm.checkpoints,
                    trainDataset: trainingForm.trainDataset.value,
                    CVDataset: trainingForm.CVDataset.value,
                    testDataset: trainingForm.testDataset.value,
                    epochs: hyperparams ? hyperparams.epochs.value : null,
                    learningRate: hyperparams ? hyperparams.learningRate.value : null,
                    optimizer: hyperparams ? trainingForm.optimizer.value : null,
                    lossFunction: trainingForm.lossFunction.value,
                    batchSize: hyperparams ? hyperparams.batchSize.value : null
                }

            }
            else {
                console.log("if FALSE ")

                formToPush = {
                    checkpoints: trainingForm.checkpoints,
                    trainDataset: trainingForm.trainDataset.value,
                    CVDataset: trainingForm.CVDataset.value,
                    epochs: trainingForm.epochs.value,
                    learningRate: trainingForm.learningRate.value,
                    optimizer: trainingForm.optimizer.value,
                    batchSize: trainingForm.batchSize.value,
                    testDataset: trainingForm.testDataset.value,
                    lossFunction: trainingForm.lossFunction.value,
                }
            }
            let formValid = validateForm({ formElement: formToPush })
            if (!formValid && trainingMode.selected) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTrainingChartData([])
                setIsTraining(true)
                setTrainingLog([]);
                pushData('submit_training', formToPush)
            }
        }, 0)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Grid paddingTop={9} container>
                <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column", gap: 3, padding: 3, alignContent: "space-around" }}>
                    <AccordionModels modelData={modelData} handleCheckpointChange={handleCheckpointChange} formCheckpoints={trainingForm.checkpoints} />
                    {datasetOptions.length > 0 ?
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <SelectorDataset
                                error={trainingForm.trainDataset.error}
                                datasetType={"train"}
                                helperText={trainingForm.trainDataset.error ? trainingForm.trainDataset.helper : ''}
                                selectedDataset={selectedTrainDataset}
                                handleChange={(event) => {
                                    handleSelectorFormChange({
                                        eve: event,
                                        setSelector: setSelectedTrainDataset,
                                        setForm: setTrainingForm,
                                        options: datasetOptions
                                    })
                                    checkDatasetSelected(event)
                                    validateField({ key: 'trainDataset', setFormState: setTrainingForm })

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
                                    checkDatasetSelected(event)
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
                                    checkDatasetSelected(event)
                                    validateField({ key: 'testDataset', setFormState: setTrainingForm })

                                }}
                                datasetOptions={datasetOptions} />
                        </Box>
                        : !compatibleDatasets ? <Typography color={"#d32f2f !important"} sx={{ fontSize: "0.75rem", color: theme.palette.error.main }}>Only models with the same input image resolution can be trained in one session.</Typography> : null}
                    {selectedTrainDataset ?
                        <TrainingHyperparams trainingForm={trainingForm} datasetSize={selectedTrainDataset.datasetSize} saveCallback={(fn) => {
                            fetchHyperparams.current = fn;
                        }} />
                        : null}

                    {trainingMode.selected ? null : <FormHelperText sx={{ color: 'error.main' }}>{trainingMode.helper}</FormHelperText>}
                    {trainingMode.selected ? <SelectorLoss
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
                    /> : null}


                    <Button
                        variant='contained'
                        style={{ alignSelf: 'center', width: '150px' }}
                        onClick={handleTrain}
                        disabled={!trainingMode.selected}
                    >
                        Train/Test
                    </Button>
                    {isTraining ? <Button
                        variant='contained'
                        color='error'
                        style={{ alignSelf: 'center', width: '150px', marginTop: '10px' }}
                        onClick={() => {
                            fetch("/cancel_training", { method: "POST" }).then(
                                (response => {
                                    if (response.ok) {
                                        setIsTraining(false)
                                    }
                                })
                            );
                        }}
                    >
                        Cancel
                    </Button> : null}
                </Grid>

                <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column", gap: "10px", padding: "5px", alignContent: "space-around" }}>
                    {trainingChartData.length > 0 ? <TrainingChart data={trainingChartData} /> : null}
                </Grid>
            </Grid>
        </Box>
    )
}