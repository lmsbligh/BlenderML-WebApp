import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { Grid, Button, List, Card, Typography } from '@mui/material/';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { v4 as uuidv4 } from 'uuid';

import SelectorModel from '../components/SelectorModel/SelectorModel.js';
import LayerCard from '../components/LayerCard/LayerCard.js';
import ModelPropertiesModifier from '../components/ModelPropertiesModifier/ModelPropertiesModifier.js';

import { fetchData, validateForm, pushData, Validation, Layer, validateField, handleCloseDelDialog } from '../utils.js'
import { grey } from '@mui/material/colors';
import DeleteDialog from '../components/DeleteDialog/DeleteDialog.js';
const defaultTheme = createTheme();



function CreateModifyModel() {
    const defaultModel = {
        "modelName": '',
        "description": "",
        "imageWidth": 500,
        "imageHeight": 500, 
        "layers": [{ layer_type: 'Dense', activation: 'Linear', x_0: '', x_1: '', x_2: '', x_3: '', padding: '' }]
    }
    const defaultForm = {
        "modelName": new Validation({ required: true, regex: /^[A-Za-z0-9 -]{1,30}$/, helper: "Please enter an alphanumeric name for your model." }),
        "description": new Validation({ regex: /^[A-Za-z0-9 -]{1,150}$/, helper: "Please enter an alphanumeric description for your model." }),
        "imageWidth": new Validation({ required: true, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." }),
        "imageHeight": new Validation({ required: true, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." }),
        "layers": []
    }
    const [modelForm, setModelForm] = useImmer(structuredClone(defaultForm));

    //callbacks passed to children
    const layerCallbacks = [];
    let handleTextFieldSave = null;

    //Local states
    const [selectedModel, setSelectedModel] = useImmer('');
    const [modelData, setModelData] = useImmer([]);
    const [modelCheckpoints, setModelCheckpoints] = useImmer([]);
    const [delModelDialog, setDelModelDialog] = React.useState(false);
    React.useEffect(() => {
        fetchData('models', setModelData)
    }, []);
    React.useEffect(() => {
    }, [modelData.layers])

    const fillForm = () => {
        setModelForm((modelForm) => {
            return produce(modelForm, (draft) => {
                draft['modelName'].value = selectedModel.modelName
                draft['description'].value = selectedModel.description
                draft['imageHeight'].value = selectedModel.imageHeight
                draft['imageWidth'].value = selectedModel.imageWidth
                var new_layers = []
                selectedModel.layers.forEach(layer => {
                    console.log("layer: ", layer)
                    new_layers.push(
                        new Layer({
                            layer_type: layer.layer_type,
                            x_0: layer.x_0,
                            x_1: layer.x_1,
                            x_2: layer.x_2,
                            x_3: layer.x_3,
                            padding: layer.padding,
                            activation: layer.activation,
                        }))
                    console.log("new_layers: ", new_layers)
                });
                draft['layers'] = new_layers;
            })
        })
    }
    const fillObject = () => {
        console.log("fillObject modelForm: ", modelForm)
        setSelectedModel((selectedModel) => {
            return produce(selectedModel, (draft) => {
                draft.modelName = modelForm['modelName'].value
                draft.description = modelForm['description'].value
                draft.layers = []
                modelForm['layers'].forEach(layer => {
                    draft.layers.push({
                        "id": layer.id,
                        "activation": layer.activation.value,
                        "layer_type": layer.layer_type,
                        "padding": layer.padding.value,
                        "x_0": layer.x_0.value,
                        "x_1": layer.x_1.value,
                        "x_2": layer.x_2.value,
                        "x_3": layer.x_3.value
                    }
                    )
                })
            })
        })
    }
    React.useEffect(() => {
        if (selectedModel) {
            fillForm()
        }
        if (selectedModel) {
            fetchData(`checkpoints/${selectedModel.value}`, setModelCheckpoints)
        }

    }, [selectedModel])
    React.useEffect(() => {
        console.log(modelCheckpoints)
    }, [modelCheckpoints])
    React.useEffect(() => {
        // console.log("selectedModel", selectedModel)
        // console.log("modelForm", modelForm)
    }, [modelForm])
    const handleModelSelectorChange = (event) => {
        if (event.target.value === -1) {
            const val = uuidv4().slice(0, 8);
            setModelForm(structuredClone(defaultForm))
            setSelectedModel({ ...defaultModel, value: val });
        }
        else {
            const model = modelData.find((option) => option.value === event.target.value);
            setModelForm(structuredClone(defaultForm))
            setSelectedModel(model)
        }
    };


    const handleLayerDelete = (index) => {
        setModelForm((prevModelForm) => {
            return produce(prevModelForm, (draft) => {
                if (index >= 0 && index < draft.layers.length) {
                    draft.layers.splice(index, 1);
                    layerCallbacks.splice(index, 1);
                } else {
                    console.error("Index out of bounds:", index);
                }
            })
        });

    };

    const handleLayerMove = (index, direction) => {
        setModelForm((prevModelForm) => {
            return produce(prevModelForm, (draft) => {
                if (index + direction >= 0 && index + direction < draft.layers.length) {
                    var layer = draft.layers.splice(index, 1)[0];
                    draft.layers.splice(index + direction, 0, layer)
                } else {
                    console.error("Index out of bounds:", index);
                }
            })
        });
    }

    const handleLayerAdd = (index, direction) => {
        setModelForm((prevModelForm) => {
            return produce(prevModelForm, (draft) => {
                draft.layers.splice(direction == -1 ? index : index + 1, 0, new Layer)
            })
        });
    }

    const handleModelDelete = () => {
        const val = uuidv4().slice(0, 8);
        setModelData((prevData) => {
            return produce(prevData, (draft) => {
                const delIndex = draft.findIndex((option) => option.value === selectedModel.value)
                if (delIndex != -1) {
                    draft.splice(delIndex, 1)
                }
            })
        })
        // setSelectedModel({ ...defaultModel, value: val });
        setSelectedModel(null)
        pushData('delete_model', selectedModel)
    }

    const handleModelSave = () => {
        if (document.activeElement) {
            document.activeElement.blur();
        }
        validateField({ key: "modelName", setFormState: setModelForm })
        validateField({ key: "description", setFormState: setModelForm })
        setTimeout(() => {
            var updatedLayersForm = []
            var updatedLayersObject = []
            layerCallbacks.map((callback, index) => {
                var layerForm = layerCallbacks[index]()
                updatedLayersForm.push(layerForm)
                updatedLayersObject.push({
                    "id": layerForm.id,
                    "activation": layerForm.activation,
                    "layer_type": layerForm.layer_type,
                    "padding": layerForm.padding.value,
                    "x_0": layerForm.x_0.value,
                    "x_1": layerForm.x_1.value,
                    "x_2": layerForm.x_2.value,
                    "x_3": layerForm.x_3.value
                })
            });

            const updatedTextFields = handleTextFieldSave();
            // console.log("constructed form: ",{
            //     modelName: updatedTextFields.modelName,
            //     description: updatedTextFields.description,
            //     layers: updatedLayersForm
            // })
            var formInvalid = validateForm({
                formElement: {
                    modelName: updatedTextFields.modelName,
                    description: updatedTextFields.description,
                    layers: updatedLayersForm
                }
            })
            // console.log("formInvalid ? : ", formInvalid)
            
            if (!formInvalid) {
                const modelToPush = {
                    value: selectedModel.value,
                    input: '',
                    output: '',
                    imageHeight: updatedTextFields.imageHeight.value,
                    imageWidth: updatedTextFields.imageWidth.value,
                    modelName: updatedTextFields.modelName.value,
                    description: updatedTextFields.description.value,
                    layers: updatedLayersObject
                }

                setModelData((prevModelData) => {
                    return produce(prevModelData, (draft) => {
                        const ind = prevModelData.findIndex((option) => option.value === modelToPush.value);
                        if (ind != -1) {
                            draft[ind] = modelToPush;
                        }
                        else {
                            draft.push(modelToPush);
                        }
                    })
                });

                setSelectedModel(modelToPush)
                pushData('submit_model', modelToPush).then((response) => { alert(response) })
            }
            else {
            }

        }, 0)




    }
    const textFieldUnblur = (newModelForm) => {
        console.log(newModelForm)
        setModelForm((prevModelForm) => {
            return produce(prevModelForm, (draft) => {

                draft.modelName.value = newModelForm.modelName.value;

                draft.description.value = newModelForm.description.value;
            });
        })
    }
    React.useEffect(() => {
        console.log(modelForm)
    }, [modelForm])
    React.useEffect(() => {
        console.log(selectedModel)
    }, [selectedModel])
    const updateLayer = (newLayer) => {
        console.log("updateLayer ran")
        setModelForm((prevModelForm) => {
            return produce(prevModelForm, (draft) => {
                const ind = draft.layers.findIndex((option) => option.id === newLayer.id)
                draft.layers[ind] = newLayer;
            })
        })
    }

    const delCheckpoint = (checkpointID) => {
        pushData(`delete_checkpoint/${selectedModel.value}/${checkpointID}`).then(() => {
            fetchData(`checkpoints/${selectedModel.value}`, setModelCheckpoints)
        })
    }
    return (
        <ThemeProvider theme={defaultTheme} >
            <Box sx={{ display: 'flex' }}>
                <Grid container>
                    <Grid item sm={6} xs={12} sx={{
                        display: "flex",
                        flexDirection: "column",
                        rowGap: "5px",
                        columnGap: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px"
                    }}>
                        <CssBaseline />
                        <FormControl fullWidth>
                            {modelData ? <SelectorModel selectedModel={selectedModel} handleChange={handleModelSelectorChange} modelOptions={modelData} isModify={true} /> : null}
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', paddingTop: '10px' }}>
                                {
                                    // selectedModel ? console.log("selectedModel.value:", selectedModel.value) : console.log("selectedModel is null")
                                }
                                {selectedModel ? <ModelPropertiesModifier
                                    updateTextField={textFieldUnblur}
                                    modelForm={modelForm}
                                    saveCallback={(saveFunction) => (handleTextFieldSave = saveFunction)} />
                                    : null}
                                {

                                    modelForm && selectedModel ? modelForm.layers.map((option, ind) => {

                                        // console.log("LayerCard about to be run");
                                        // console.log("LayerCard from layer: ", option)
                                        return <LayerCard
                                            key={option.id}
                                            layerUpdater={updateLayer}
                                            layer={option}
                                            layers={modelForm.layers}
                                            index={ind}
                                            saveCallback={(callback) => (layerCallbacks[ind] = callback)}
                                            delFunction={handleLayerDelete}
                                            moveFunction={handleLayerMove}
                                            addLayerFunction={handleLayerAdd}
                                            inputImageRes={{x: modelForm.imageWidth, y: modelForm.imageHeight}}
                                        />
                                    }
                                    ) : ''
                                }
                            </Box>{
                                selectedModel ?
                                    <>
                                        <Button variant="contained" style={{ width: '150px' }} onClick={handleModelSave}>Save</Button>
                                        <DeleteDialog
                                                            id="model"
                                                            open={delModelDialog}
                                                            handleClose={handleCloseDelDialog}
                                                            setDelDialog={setDelModelDialog}
                                                            delFunction={() => handleModelDelete()}
                                                        />
                                        <Button variant="contained" color='error' style={{ width: '150px' }} onClick={() => setDelModelDialog(true)}>Delete</Button>
                                    </> : null
                            }

                        </FormControl>
                    </Grid>
                    <Grid item sm={6} xs={12} sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <List disablePadding sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            gap: "10px",
                            padding: "10px",
                            border: 1,
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                            borderRadius: 1
                        }}>
                            <Typography sx={{ alignSelf: "flex-start" }}>Existing checkpoints for this model:</Typography>
                            {modelCheckpoints ? modelCheckpoints.map((option, ind) => {
                                return <Card key={option} sx={{ padding: "10px" }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
                                        <Typography sx={{ alignSelf: "center" }} color="text.primary">Checkpoint: {option.id}</Typography>
                                        <IconButton aria-label="delete" color="primary" onClick={() => { delCheckpoint(option.id) }}><DeleteIcon /></IconButton>
                                    </Box>
                                </Card>
                            }) : null}
                        </List>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    )
}

export default CreateModifyModel