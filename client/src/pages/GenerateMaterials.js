import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";
import Box from '@mui/material/Box';
import { Button, Card, CardMedia } from '@mui/material/';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import SelectorModel from '../components/SelectorModel/SelectorModel.js';
import SelectedModel from '../components/SelectedModel/SelectedModel.js'
import FileUpload from '../components/FileUpload/FileUpload.js';
import SelectorCheckpoint from '../components/SelectorCheckpoint/SelectorCheckpoint.js';
import { fetchData, handleSelectorFormChange, validateField, validateForm, Validation } from '../utils.js'

export default function GenerateMaterials() {
    const [generateMaterialForm, setGenerateMaterialForm] = useImmer(structuredClone({
        "model": new Validation({
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please select a model."
        }),
        "image_url": new Validation({
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please select an image."
        }),
        "image_path": new Validation({
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please select an image."
        }),
        "checkpoint": new Validation({
            value: "",
            error: false,
            regex: "",
            required: true,
            helper: "Please select a model, then a checkpoint."
        })
    }))
    const [renderURL, setRenderURL] = React.useState('');
    const [materialJSON, setMaterialJSON] = React.useState('');

    const [checkpointOptions, setCheckpointOptions] = React.useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = React.useState('');
    const [modelData, setModelData] = useImmer([]);
    const [selectedModel, setSelectedModel] = useImmer('');

    React.useEffect(() => {
        fetchData('models', setModelData)
    }, []);

    React.useEffect(() => {
        console.log("renderURL updated: ", renderURL)
    }, [renderURL])

    React.useEffect(() => {
        if (!selectedModel) return;
        fetchData(`checkpoints/${selectedModel.value}`, setCheckpointOptions)
    }, [selectedModel]);

    const handleUploadFile = (event) => {
        console.log("upload event handler called")
        const acceptable_filetypes = ["jpg", "png", "jpeg"]
        const formData = new FormData();
        const file = event.target.files[0]
        if (file) {
            if (acceptable_filetypes.includes(file.type.split('/')[1])) {
                formData.append('uploadFile', event.target.files[0])
                fetch('upload_file', {
                    method: 'POST',
                    body: formData
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // or response.json(), depending on your server response
                })
                    .then(data => {
                        console.log("Response received:", data);
                        setGenerateMaterialForm((prevVals) => {
                            return produce(prevVals, (draft) => {
                                console.log("data.url", data.url)
                                draft.image_url.value = data.url
                                draft.image_path.value = data.image_path
                            })
                        })
                        validateField({ key: 'image_url', setFormState: setGenerateMaterialForm })
                    })
                    .catch(error => {
                        console.error("Error:", error);
                    });
            }
            else {
                alert("unnacceptable filetype")
                setGenerateMaterialForm((prevVals) => {
                    return produce(prevVals, (draft) => {
                        draft.image_path.value = false
                        draft.image_url.value = false
                    })
                })
            }
        }
        

    }

    const handleGenerateMaterial = (event) => {
        for (let key in generateMaterialForm) {
            validateField({ key: key, setFormState: setGenerateMaterialForm })
        }

        setTimeout(() => {
            if (validateForm({ formElement: generateMaterialForm })) {
                return
            }
            const formToPush = {
                "model": generateMaterialForm.model.value,
                "image_url": generateMaterialForm.image_url.value,
                "image_path": generateMaterialForm.image_path.value,
                "checkpoint": generateMaterialForm.checkpoint.value
                }
            try {
                fetch('generate_material', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    title: 'title',
                    body: JSON.stringify(formToPush),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json(); // or response.json(), depending on your server response
                    })
                    .then(data => {
                        setRenderURL(data.render_url)
                        setMaterialJSON(JSON.stringify(data.predicted_props))
                    })

            } catch (error) {
                console.error('Error:', error);
            }
        }, 0)
    }


    return (
        <Box sx={{
            width: "100%",
            display: 'flex',
            flexDirection: "row",
            alignItems: "left",
            justifyContent: 'center',
            alignSelf: "left",
            gap: '10px'
        }}>
            <Box sx={{
                width: "50%",
                display: 'flex',
                flexDirection: "column",
                alignItems: "left",
                justifyContent: 'space-between',
                alignSelf: "left",
                gap: '10px'
            }}>

                {modelData ?
                    <SelectorModel
                        error={generateMaterialForm.model.error}
                        helperText={generateMaterialForm.model.error ? generateMaterialForm.model.helper : ''}
                        selectedModel={selectedModel}
                        handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedModel, setForm: setGenerateMaterialForm, options: modelData }) }}
                        modelOptions={modelData} /> : null}
                {selectedModel ? <SelectedModel selectedModel={selectedModel} /> : null}
                <SelectorCheckpoint
                    selectedCheckpoint={selectedCheckpoint}
                    error={generateMaterialForm.checkpoint.error}
                    helperText={generateMaterialForm.checkpoint.error ? generateMaterialForm.checkpoint.helper : ''}
                    handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedCheckpoint, setForm: setGenerateMaterialForm }) }}
                    checkpointOptions={checkpointOptions}
                    data-selectorID="checkpoint" />

                <FileUpload handleUpload={handleUploadFile}
                    error={generateMaterialForm.image_url.error}
                    helperText={generateMaterialForm.image_url.helper} />
                <Card sx={{
                    maxWidth: 300,
                    marginTop: "60px",
                    marginBottom: "60px",
                    alignSelf: "center"
                }}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={generateMaterialForm.image_url.value}
                        alt="Placeholder" />
                </Card>
                <Button variant="contained" style={{ width: '100%' }} onClick={handleGenerateMaterial}>Generate</Button>

            </Box>
            <Box sx={{
                width: "50%",
                display: 'flex',
                flexDirection: "column",
                alignItems: "left",
                justifyContent: 'flex-end',
                alignSelf: "left",
                gap: '10px'
            }}>
                <Card sx={{
                    maxWidth: 300,
                    marginTop: "60px",
                    marginBottom: "60px",
                    alignSelf: "center"
                }}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={renderURL}
                        alt="Placeholder" />
                    <CardContent>
                        <Typography>
                            Material Properties:
                            {materialJSON}
                        </Typography>
                    </CardContent>
                </Card>
                <Button variant="contained" disabled style={{ color: 'grey', width: '100%' }}>Download Material</Button>

            </Box>
        </Box>
    )
}