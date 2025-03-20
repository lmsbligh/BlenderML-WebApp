import React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";
import { Paper, TextField } from '@mui/material/';

function ModelPropertiesModifier({model, saveCallback}) {
    const [draftModel, setDraftModel] = useImmer(model);
    React.useEffect(() => {
        saveCallback(() => ({modelName: draftModel.modelName, description: draftModel.description}))}, [draftModel, saveCallback]
    )
    React.useEffect(() =>{
        console.log("ModelPropertiesModifier updated with model:", model);
        setDraftModel(model)
    }, [model]
    );

    const handleTextFieldChange = (event) => {
            const { name, value } = event.target;
            
            setDraftModel((prevModel) => {
                return produce(prevModel, (draft) => {
                    if (name in draft) {
                        draft[name] = value;
                    }
                    else {
                        console.error(`Invalid key '${name}' in '${draft}'.`)
                    }
                })
            })
        }

    return (
        <>
        { draftModel ?  <Paper variant='outlined' sx={{ display: 'flex', padding: '10px'}} >
                                    <TextField name="modelName" label="Model Name" onChange={handleTextFieldChange} value={draftModel.modelName} sx={{width: "100%"}}></TextField>
                                    <TextField name="description" label="Model Description" onChange={handleTextFieldChange} value={draftModel.description} sx={{width: "100%"}}></TextField>
                            </Paper> : null }
        
        </>
    );
}

export default ModelPropertiesModifier;