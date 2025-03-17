import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";
import {useRef} from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { Grid, Button, Paper, TextField } from '@mui/material/';

import ModelSelector from '../components/ModelSelector/ModelSelector.js';
import LayerCard from '../components/LayerCard/LayerCard.js';
import { v4 as uuidv4 } from 'uuid';
import ModelPropertiesModifier from '../components/ModelPropertiesModifier/ModelPropertiesModifier.js';


const defaultTheme = createTheme();

function CreateModifyModel() {
    const defaultModel = {
        "modelName": '', 
        "input": "", 
        "output": "", 
        "description": "",
        "layers": [
            { 
                "id": 1, 
                "layer_type": 'Dense', 
                "x_0": '0', 
                "x_1": '0', 
                "x_2": '0', 
                "x_3": '0', 
                "activation": 'Linear' 
            }]
    }
    //callbacks passed to children
    const layerCallbacks = [];
    let saveTextField = null;

    //Local states
    const [selectedModel, setSelectedModel] = useImmer('');
    //const [selectedModelLayers, setSelectedModelLayers] = useImmer([]);
    const [modelData, setModelData] = useImmer([]);


    React.useEffect(()=> {
        //response.json() creates an array from the JSON in the response
        fetch('models').then(response => response.json()).then(data => {
            setModelData(data)
        }).catch(error => console.error('Error fetching data:', error))
        console.log()
    }, []);

    const handleChange = (event) => {
        if (event.target.value === -1) {
            const val = uuidv4().slice(0, 8);
            //setSelectedModel({...structuredClone(defaultModel), value: val});
            //setSelectedModelLayers([...structuredClone(defaultModel.layers)]);
            console.log('new model selected')
            // setSelectedModel((prevSelectedModel) => {
            //     return produce(prevSelectedModel, (draft) => 
            //         {...defaultModel, value: val};
            //     )
            // })
            setSelectedModel({...defaultModel, value: val});
        }
        else {
            //setSelectedModel({...structuredClone(modelData.find((option) => option.value === event.target.value))})
            //setSelectedModelLayers([...structuredClone(modelData.find((option) => option.value === event.target.value).layers)]);
            const model = modelData.find((option) => option.value === event.target.value);

            setSelectedModel(model)
            }
        };
    

    const delHandleChange = (index) => {
        console.log("Prior to slice, setSelectedModel: ", selectedModel)
        setSelectedModel((prevSelectedModel) => {
            return produce(prevSelectedModel, (draft) => {
                console.log("Before splice, layers:", JSON.parse(JSON.stringify(draft.layers)));
                if (index >= 0 && index < draft.layers.length) {
                    console.log("draft.layers.splice(index, 1) ran")
                    draft.layers.splice(index, 1);
                    layerCallbacks.splice(index, 1);
                    console.log("After splice, layers:", JSON.parse(JSON.stringify(draft.layers)));
                } else {
                    console.error("Index out of bounds:", index);
                }
            })
        });
        console.log("Post slice, setSelectedModel: ", selectedModel)
    };
    
    const moveHandleChange = (index, direction) => {
        setSelectedModel((prevSelectedModel) => {
            return produce(prevSelectedModel, (draft) => {
                console.log("Before splice, layers:", JSON.parse(JSON.stringify(draft.layers)));
                if (index+direction >= 0 && index+direction < draft.layers.length) {
                    console.log("draft.layers.splice(index, 1) ran")
                    var layer = draft.layers.splice(index,1)[0];
                    draft.layers.splice(index+direction,0,layer)
                    console.log("After splice, layers:", JSON.parse(JSON.stringify(draft.layers)));
                } else {
                    console.error("Index out of bounds:", index);
                }
            })
        });
    }

    const addLayerHandle = (index, direction) => {
        setSelectedModel((prevSelectedModel) => {
            return produce(prevSelectedModel, (draft) => {
                console.log("Before splice, layers:", JSON.parse(JSON.stringify(draft.layers)));
                var layer = {"id": Date.now(), "layer_type":'Dense', "x_0":'0', "x_1":'0',"x_2":'0',"x_3":'0', "activation":'ReLU'};
                draft.layers.splice(direction == -1? index : index + 1,0,layer)
                console.log("After splice, layers:", JSON.parse(JSON.stringify(draft.layers)));
            })
        });
    }
    const delModel = () => {
        console.log('delModel called')
        // setSelectedModel((prev) => {
        //     return produce(prev, (draft) => {
        //         draft = ''
        //     })
        // })
        const val = uuidv4().slice(0, 8);
        //setSelectedModel({...structuredClone(defaultModel), value: val});
        //setSelectedModelLayers([...structuredClone(defaultModel.layers)]);
        console.log('new model selected')
        // setSelectedModel((prevSelectedModel) => {
        //     return produce(prevSelectedModel, (draft) => 
        //         {...defaultModel, value: val};
        //     )
        // })
        setModelData((prevData) => {
            return produce(prevData, (draft) => {
                const delIndex = draft.findIndex((option) => option.value === selectedModel.value)
                if (delIndex != -1) {
                    draft.splice(delIndex, 1)
                }
            })
        })
        setSelectedModel({...defaultModel, value: val});
        try {
            fetch('deleteModel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(selectedModel),
            })

        }catch (error) {
            console.error('Error:', error);
        }
    }
    const handleSave = () => {
        const updatedLayers = layerCallbacks.map((callback, index) => {
            return layerCallbacks[index](); // Collect state from each child
        });
        const updatedTextFields = saveTextField();
        const updatedModel = {
            ...selectedModel,
            modelName: updatedTextFields.modelName,
            description: updatedTextFields.description,
            layers: updatedLayers,
        };
        //console.log("updatedTextFields:", updatedTextFields)
        console.log('Saving model, updatedModel:', updatedModel);
        setSelectedModel(updatedModel);
        //modelData.find((option) => option.value === updatedModel.value)
        //setModelData(modelData.find((option) => option.value === updatedModel.value))

        setModelData((prevModelData) => {
            return produce(prevModelData, (draft) => {
                console.log("Before (updating model data):", JSON.parse(JSON.stringify(prevModelData)));
                const ind = prevModelData.findIndex((option) => option.value === updatedModel.value);
                if (ind != -1) {
                    draft[ind] = updatedModel;
                }
                else {
                    draft.push(updatedModel);
                }
            })
        });

        try {
            fetch('submitModel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(updatedModel),
            })

        }catch (error) {
            console.error('Error:', error);
        }
    }

    React.useEffect( () => {
        console.log('selectedModel Changed:', selectedModel)
    }, [selectedModel])

    React.useEffect( () => {
        console.log('modelData Changed:', modelData)
    }, [modelData])
    

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
            <Grid container>
                <Grid item  sm={6} xs={12} sx={{display: "flex", flexDirection: "column"}}>
                    <CssBaseline />
                    <FormControl fullWidth>
                        { modelData ? <ModelSelector selectedModel={selectedModel} handleChange={handleChange} modelOptions={modelData}/> : null}
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', paddingTop: '10px'}}>
                            {
                                selectedModel ? console.log("selectedModel.value:", selectedModel.value) : console.log("selectedModel is null")
                            }
                            {selectedModel ? <ModelPropertiesModifier model={selectedModel} saveCallback={(saveFunction) => (saveTextField = saveFunction)}/> : null} 
                            {
                                selectedModel ? selectedModel.layers.map((option, ind) => {
                                    console.log("LayerCard about to be run");
                                    return <LayerCard key={option.id} layer={option} index={ind} saveCallback={(callback) => (layerCallbacks[ind] = callback)} delFunction={delHandleChange} moveFunction={moveHandleChange} addLayerFunction={addLayerHandle} />

                                    // return <LayerCard key={useMemo(() => option.id, [option.id])} layer={useMemo(() => option, [option])} index={useMemo(() => ind, [ind])} delFunction={delHandleChange} moveFunction={moveHandleChange} addLayerFunction={addLayerHandle}/>
                                }
                                ) : ''
                            }
                        </Box>
                        <Button variant="contained" style={{ width: '150px' }} onClick={handleSave}>Save</Button>
                        <Button variant="contained" color='error' style={{ width: '150px' }} onClick={delModel}>Delete</Button>
                    </FormControl>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    )
}

export default CreateModifyModel