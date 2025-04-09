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

import { fetchData, pushData, Validation } from '../utils.js'
const defaultTheme = createTheme();

class Layer {
    constructor({ layer_type = 'Dense', activation = 'Linear', x_0 = '', x_1 = '', x_2 = '', x_3 = '', padding = '' } = {}) {
        this.id = uuidv4().slice(0, 8);
        this.layer_type = layer_type;
        this.x_0 = new Validation({ value: x_0, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.x_1 = new Validation({ value: x_1, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.x_2 = new Validation({ value: x_2, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.x_3 = new Validation({ value: x_3, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.padding = new Validation({ value: padding, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.activation = activation
    }
}
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
                selectedModel.layers.forEach(layer => {
                    console.log("layer: ", layer)
                    draft['layers'].push(
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
            })
        })
    }
    const fillObject = () => {
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
        console.log("fillForm selectedModel:", selectedModel)
        console.log("fillForm modelForm: ", modelForm)
        if (selectedModel) {
            fillForm()
        }
    }, [selectedModel])
    React.useEffect(() => {
        console.log("selectedModel", selectedModel)
        console.log("modelForm", modelForm)
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
        setSelectedModel({ ...defaultModel, value: val });
        pushData('delete_model', selectedModel)
    }

    const handleModelSave = () => {
        var err = ""
        for (var key in defaultModel) {
            if (!Boolean(defaultModel[key])) {
                err = err.concat(`${key}, `)
            }
        }
        if (err) {
            alert(`the following required fields are empty: ${err}`)
            return
        }
        const updatedLayers = layerCallbacks.map((callback, index) => {
            return layerCallbacks[index](); // Collect state from each child
        });
        const updatedTextFields = handleTextFieldSave();
        const updatedModel = {
            ...selectedModel,
            modelName: updatedTextFields.modelName,
            description: updatedTextFields.description,
            layers: updatedLayers,
        };
        setSelectedModel(updatedModel);

        setModelData((prevModelData) => {
            return produce(prevModelData, (draft) => {
                const ind = prevModelData.findIndex((option) => option.value === updatedModel.value);
                if (ind != -1) {
                    draft[ind] = updatedModel;
                }
                else {
                    draft.push(updatedModel);
                }
            })
        });

        pushData('submit_model', updatedModel)
    }
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
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
                <Grid container>
                    <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column" }}>
                        <CssBaseline />
                        <FormControl fullWidth>
                            {modelData ? <SelectorModel selectedModel={selectedModel} handleChange={handleModelSelectorChange} modelOptions={modelData} isModify={true} /> : null}
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', paddingTop: '10px' }}>
                                {
                                    selectedModel ? console.log("selectedModel.value:", selectedModel.value) : console.log("selectedModel is null")
                                }
                                {modelForm.modelName.value ? <ModelPropertiesModifier modelForm={modelForm} saveCallback={(saveFunction) => (handleTextFieldSave = saveFunction)} /> : null}
                                {
                                    modelForm ? modelForm.layers.map((option, ind) => {

                                        console.log("LayerCard about to be run");
                                        console.log("LayerCard from layer: ", option)
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