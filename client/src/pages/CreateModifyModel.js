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
    constructor(layer_type='Dense', activation='Linear') {
        this.id = Date.now();
        this.layer_type = layer_type;
        this.x_0 = new Validation({regex: /^(?:[1-9]\d{0,2}|1000)$/})
        this.x_1 = new Validation({regex: /^(?:[1-9]\d{0,2}|1000)$/})
        this.x_2 = new Validation({regex: /^(?:[1-9]\d{0,2}|1000)$/})
        this.x_3 = new Validation({regex: /^(?:[1-9]\d{0,2}|1000)$/})
        this.padding = new Validation({regex: /^(?:[1-9]\d{0,2}|1000)$/})
        this.activation = activation
    }
}

function CreateModifyModel() {
    const defaultModel = {
        "modelName": '', 
        "description": "",
        "layers": [new Layer()]
    }
    const [modelForm, setModelForm] = useImmer({
        "modelName": {
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please enter an alphanumeric name for your model."
        }, 
        "description": {
            value: "",
            error: false,
            regex: "",
            required: false,
            helper: ""
        },
        "layers": [
            { 
                "id": 1, 
                "layer_type": 'Dense', 
                "x_0": {
                    value: "",
                    error: false,
                    regex: "",
                    required: false,
                    helper: ""
                }, 
                "x_1": {
                    value: "",
                    error: false,
                    regex: "",
                    required: false,
                    helper: ""
                }, 
                "x_2": {
                    value: "",
                    error: false,
                    regex: "",
                    required: false,
                    helper: ""
                }, 
                "x_3": {
                    value: "",
                    error: false,
                    regex: "",
                    required: false,
                    helper: ""
                }, 
                "activation": 'Linear' 
            }]
    });

    //callbacks passed to children
    const layerCallbacks = [];
    let handleTextFieldSave = null;

    //Local states
    const [selectedModel, setSelectedModel] = useImmer('');
    const [modelData, setModelData] = useImmer([]);

    React.useEffect(()=> {
        fetchData('models', setModelData)
    }, []);
    React.useEffect(() => {
        console.log("layers changed!!!")
    },[modelData.layers] )
    const handleModelSelectorChange = (event) => {
        if (event.target.value === -1) {
            const val = uuidv4().slice(0, 8);
            setSelectedModel({...defaultModel, value: val});
        }
        else {
            const model = modelData.find((option) => option.value === event.target.value);
            setSelectedModel(model)
            }
        };
    

    const handleLayerDelete = (index) => {
        setSelectedModel((prevSelectedModel) => {
            return produce(prevSelectedModel, (draft) => {
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
        setSelectedModel((prevSelectedModel) => {
            return produce(prevSelectedModel, (draft) => {
                if (index+direction >= 0 && index+direction < draft.layers.length) {
                    var layer = draft.layers.splice(index,1)[0];
                    draft.layers.splice(index+direction,0,layer)
                } else {
                    console.error("Index out of bounds:", index);
                }
            })
        });
    }

    const handleLayerAdd = (index, direction) => {
        setSelectedModel((prevSelectedModel) => {
            return produce(prevSelectedModel, (draft) => {
                //var layer = {"id": Date.now(), "layer_type":'Dense', "x_0":'0', "x_1":'0',"x_2":'0',"x_3":'0', "activation":'ReLU'};
                draft.layers.splice(direction == -1? index : index + 1,0, new Layer)
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
        setSelectedModel({...defaultModel, value: val});
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

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
            <Grid container>
                <Grid item  sm={6} xs={12} sx={{display: "flex", flexDirection: "column"}}>
                    <CssBaseline />
                    <FormControl fullWidth>
                        { modelData ? <SelectorModel selectedModel={selectedModel} handleChange={handleModelSelectorChange} modelOptions={modelData} isModify={true}/> : null}
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', paddingTop: '10px'}}>
                            {
                                selectedModel ? console.log("selectedModel.value:", selectedModel.value) : console.log("selectedModel is null")
                            }
                            {selectedModel ? <ModelPropertiesModifier model={selectedModel} saveCallback={(saveFunction) => (handleTextFieldSave = saveFunction)}/> : null} 
                            {
                                selectedModel ? selectedModel.layers.map((option, ind) => {
                                    console.log("LayerCard about to be run");
                                    return <LayerCard key={option.id} layer={option} index={ind} saveCallback={(callback) => (layerCallbacks[ind] = callback)} delFunction={handleLayerDelete} moveFunction={handleLayerMove} addLayerFunction={handleLayerAdd} />
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