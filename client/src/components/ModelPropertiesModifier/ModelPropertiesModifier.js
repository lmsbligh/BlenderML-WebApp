import React from 'react';
import { useImmer } from 'use-immer';
import { Paper, TextField } from '@mui/material/';
import { handleTextFieldChange } from '../../utils';

function ModelPropertiesModifier({ model, saveCallback }) {
    const [draftModel, setDraftModel] = useImmer(model);
    React.useEffect(() => {
        saveCallback(() => ({ modelName: draftModel.modelName, description: draftModel.description }))
    }, [draftModel, saveCallback]
    )
    React.useEffect(() => {
        setDraftModel(model)
    }, [model]
    );

    return (
        <>
            {draftModel ? <Paper variant='outlined' sx={{ display: 'flex', padding: '10px' }} >
                <TextField name="modelName" label="Model Name" onChange={(event) => { handleTextFieldChange({ eve: event, setState: setDraftModel }) }} value={draftModel.modelName} sx={{ width: "100%" }}></TextField>
                <TextField name="description" label="Model Description" onChange={(event) => { handleTextFieldChange({ eve: event, setState: setDraftModel }) }} value={draftModel.description} sx={{ width: "100%" }}></TextField>
            </Paper> : null}

        </>
    );
}

export default ModelPropertiesModifier;