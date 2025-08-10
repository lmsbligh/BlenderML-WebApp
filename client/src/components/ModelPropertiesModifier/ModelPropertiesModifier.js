import React from 'react';
import { useImmer } from 'use-immer';
import { Paper, TextField, Box } from '@mui/material/';
import { handleTextFieldChange, validateField } from '../../utils';

function ModelPropertiesModifier({ onBlurTextField, modelForm, saveCallback }) {
    const [draftModelForm, setDraftModel] = useImmer(modelForm);
    React.useEffect(() => {
        console.log("modelProperties savecallback")
        saveCallback(() => ({
            modelName: draftModelForm.modelName,
            description: draftModelForm.description,
            imageWidth: draftModelForm.imageWidth,
            imageHeight: draftModelForm.imageHeight
        }))
    }, [draftModelForm, saveCallback]
    )
    React.useEffect(() => {
        setDraftModel(modelForm)
    }, [modelForm]
    );
    React.useEffect(() => {
        console.log("ModelPropertiesModifier: modelForm: ", modelForm)
    }, [modelForm])
    return (
        <>
            {draftModelForm ? <Paper variant='outlined'  >
                <Box sx={{ display: 'flex', padding: '10px' }}>
                    <TextField
                        name="modelName"
                        label="Model Name"
                        error={draftModelForm.modelName.error}
                        helperText={draftModelForm.modelName.error ? draftModelForm.modelName.helper : ''}
                        onChange={(event) => {
                            handleTextFieldChange({ eve: event, setState: setDraftModel })
                            validateField({ key: 'modelName', setFormState: setDraftModel })
                        }}
                        onBlur={() => {
                            onBlurTextField(draftModelForm)
                            validateField({ key: 'modelName', setFormState: setDraftModel })
                        }}
                        value={draftModelForm.modelName.value}
                        sx={{ width: "100%" }} />
                    <TextField
                        name="description"
                        label="Model Description"
                        error={draftModelForm.description.error}
                        helperText={draftModelForm.description.error ? draftModelForm.description.helper : ''}
                        onChange={(event) => {
                            handleTextFieldChange({ eve: event, setState: setDraftModel })
                            validateField({ key: 'description', setFormState: setDraftModel })
                        }}
                        onBlur={() => {
                            onBlurTextField(draftModelForm)
                            validateField({ key: 'description', setFormState: setDraftModel })
                        }}
                        value={draftModelForm.description.value}
                        sx={{ width: "100%" }} />

                </Box>
                <Box sx={{ display: 'flex', padding: '10px' }}>
                    <TextField
                        name="imageWidth"
                        label="Image Width"
                        error={draftModelForm.imageWidth.error}
                        helperText={draftModelForm.imageWidth.error ? draftModelForm.imageWidth.helper : ''}
                        onChange={(event) => {
                            handleTextFieldChange({ eve: event, setState: setDraftModel })
                            validateField({ key: 'imageWidth', setFormState: setDraftModel })
                        }}
                        onBlur={() => {
                            onBlurTextField(draftModelForm)
                            validateField({ key: 'imageWidth', setFormState: setDraftModel })
                        }}
                        value={draftModelForm.imageWidth.value}
                        sx={{ width: "100%" }} />


                    <TextField
                        name="imageHeight"
                        label="Image Height"
                        error={draftModelForm.imageHeight.error}
                        helperText={draftModelForm.imageHeight.error ? draftModelForm.imageHeight.helper : ''}
                        onChange={(event) => {
                            handleTextFieldChange({ eve: event, setState: setDraftModel })
                            validateField({ key: 'imageHeight', setFormState: setDraftModel })
                        }}
                        onBlur={() => {
                            onBlurTextField(draftModelForm)
                            validateField({ key: 'imageHeight', setFormState: setDraftModel })
                        }}
                        value={draftModelForm.imageHeight.value}
                        sx={{ width: "100%" }} />
                </Box>

            </Paper> : null}

        </>
    );
}

export default ModelPropertiesModifier;