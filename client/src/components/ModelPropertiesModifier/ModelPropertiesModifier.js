import React from 'react';
import { useImmer } from 'use-immer';
import { Paper, TextField } from '@mui/material/';
import { handleTextFieldChange, validateField } from '../../utils';

function ModelPropertiesModifier({ modelForm, saveCallback }) {
    const [draftModelForm, setDraftModel] = useImmer(modelForm);
    React.useEffect(() => {
        saveCallback(() => ({ modelName: draftModelForm.modelName.value, description: draftModelForm.description.value }))
    }, [draftModelForm, saveCallback]
    )
    React.useEffect(() => {
        setDraftModel(modelForm)
    }, [modelForm]
    );

    return (
        <>
            {draftModelForm ? <Paper variant='outlined' sx={{ display: 'flex', padding: '10px' }} >
                <TextField 
                    name="modelName" 
                    label="Model Name" 
                    error={draftModelForm.modelName.error}
                    helperText={draftModelForm.modelName.error ? draftModelForm.modelName.helper : ''}
                    onChange={(event) => { 
                        handleTextFieldChange({ eve: event, setState: setDraftModel })
                        validateField({key: 'modelName', setFormState: setDraftModel}) 
                    }} 
                    value={draftModelForm.modelName.value} 
                    sx={{ width: "100%" }}/>
                <TextField 
                    name="description" 
                    label="Model Description" 
                    error={draftModelForm.description.error}
                    helperText={draftModelForm.description.error ? draftModelForm.description.helper : ''}
                    onChange={(event) => { 
                        handleTextFieldChange({ eve: event, setState: setDraftModel }) 
                        validateField({key: 'description', setFormState: setDraftModel})
                    }} 
                    value={draftModelForm.description.value} 
                    sx={{ width: "100%" }}></TextField>
            </Paper> : null}

        </>
    );
}

export default ModelPropertiesModifier;