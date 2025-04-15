import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { Grid, Button } from '@mui/material/';

import { v4 as uuidv4 } from 'uuid';

import SelectorModel from '../components/SelectorModel/SelectorModel.js';
import LayerCard from '../components/LayerCard/LayerCard.js';
import ModelPropertiesModifier from '../components/ModelPropertiesModifier/ModelPropertiesModifier.js';

import { fetchData, validateForm, pushData, Validation, Layer } from '../utils.js'
const defaultTheme = createTheme();



function CreateModifyModel() {
    const defaultModel = {
        "modelName": '',
        "description": "",
        "layers": [{ layer_type: 'Dense', activation: 'Linear', x_0: '', x_1: '', x_2: '', x_3: '', padding: '' }]
    }
    const defaultForm = {
        "modelName": new Validation({ required: true, regex: /^[A-Za-z0-9 -]{1,15}$/, helper: "Please enter an alphanumeric name for your model." }),
        "description": new Validation({ regex: /^[A-Za-z0-9 -]{1,150}$/, helper: "Please enter an alphanumeric description for your model." }),
        "layers": []
    }
    const [modelForm, setModelForm] = useImmer(structuredClone(defaultForm));

    //callbacks passed to children
    const layerCallbacks = [];
    let handleTextFieldSave = null;

    //Local states
    const [selectedModel, setSelectedModel] = useImmer('');
    const [modelData, setModelData] = useImmer([]);

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
                var new_layers = []
                selectedModel.layers.forEach(layer => {
                    // console.log("layer: ", layer)
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
    }, [selectedModel])
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
        console.log("constructed form: ",{
            modelName: updatedTextFields.modelName,
            description: updatedTextFields.description,
            layers: updatedLayersForm
        })
        var formInvalid = validateForm({formElement: {
            modelName: updatedTextFields.modelName,
            description: updatedTextFields.description,
            layers: updatedLayersForm
        }})
        console.log("formInvalid ? : ", formInvalid)
        if (!formInvalid) {
            const modelToPush = {
                value: selectedModel.value,
                input: '',
                output: '',
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
            pushData('submit_model', modelToPush).then((response) => {alert(response)})
        }
        else {
            alert("!!!!!Form error")
        }




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
    return (
        <ThemeProvider theme={defaultTheme} >
            <Box sx={{ display: 'flex' }}>
                <Grid container>
                    <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column" }}>
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
                                            prevLayer={ind > 0 ? modelForm.layers[ind - 1] : null}
                                            index={ind}
                                            saveCallback={(callback) => (layerCallbacks[ind] = callback)}
                                            delFunction={handleLayerDelete}
                                            moveFunction={handleLayerMove}
                                            addLayerFunction={handleLayerAdd}
                                        />
                                    }
                                    ) : ''
                                }
                            </Box>
                            <Button variant="contained" style={{ width: '150px' }} onClick={handleModelSave}>Save</Button>
                            <Button variant="contained" color='error' style={{ width: '150px' }} onClick={handleModelDelete}>Delete</Button>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    )
}

export default CreateModifyModel