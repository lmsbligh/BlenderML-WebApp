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
import { fetchData, handleSelectorFormChange } from '../utils.js'

export default function GenerateMaterials() {
    const [generateMaterialForm, setGenerateMaterialForm] = useImmer({
        "model": "",
        "image_url": "",
        "image_path": "",
        "render_url": "",
        "checkpoint": ""
    })

    const [checkpointOptions, setCheckpointOptions] = React.useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = React.useState('');
    const [modelData, setModelData] = useImmer([]);
    const [selectedModel, setSelectedModel] = useImmer('');

    React.useEffect(() => {
        fetchData('models', setModelData)
    }, []);

    React.useEffect(() => {
        if (!selectedModel) return;
        fetchData(`checkpoints/${selectedModel.value}`, setCheckpointOptions)
    }, [selectedModel]);

    const handleUploadFile = (event) => {
        console.log("upload event handler called")
        const acceptable_filetypes = ["jpg", "png", "jpeg"]
        const formData = new FormData();
        const file = event.target.files[0]

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
                            draft.image_url = data.url
                            draft.image_path = data.image_path
                        })
                    })
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        }
        else {
            alert("unnacceptable filetype")
            setGenerateMaterialForm((prevVals) => {
                return produce(prevVals, (draft) => {
                    draft.image_path = false
                    draft.image_url = false
                })
            })
        }

    }

    const handleGenerateMaterial = (event) => {
        if (!generateMaterialForm.image_path && !generateMaterialForm.image_url) {
            alert("please select an image")
            return
        }
        if (!generateMaterialForm.model) {
            alert("please select a model")
            return
        }
        if(!generateMaterialForm.checkpoint) {
            alert("please select a checkpoint")
            return
        }

        try {
            fetch('generate_material', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(generateMaterialForm),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // or response.json(), depending on your server response
                })
                .then(data => {
                    setGenerateMaterialForm((prevVals) => {
                        return produce(prevVals, (draft) => {
                            console.log("data.url", data.url)
                            draft.render_url = data.render_url
                        })
                    })
                })

        } catch (error) {
            console.error('Error:', error);
        }
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

                {modelData ? <SelectorModel selectedModel={selectedModel} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedModel, setForm: setGenerateMaterialForm, options: modelData }) }} modelOptions={modelData} /> : null}
                {selectedModel ? <SelectedModel selectedModel={selectedModel} /> : null}
                <SelectorCheckpoint selectedCheckpoint={selectedCheckpoint} handleChange={(event) => { handleSelectorFormChange({ eve: event, setSelector: setSelectedCheckpoint, setForm: setGenerateMaterialForm }) }} checkpointOptions={checkpointOptions} data-selectorID="checkpoint" />

                <FileUpload handleUpload={handleUploadFile} />
                <Card sx={{
                    maxWidth: 300,
                    marginTop: "60px",
                    marginBottom: "60px",
                    alignSelf: "center"
                }}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={generateMaterialForm.image_url}
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
                        image={generateMaterialForm.render_url}
                        alt="Placeholder" />
                    <CardContent>
                        <Typography>
                            Material Properties:
                            &#123;
                            RGB:...etc
                            &#125;
                        </Typography>
                    </CardContent>
                </Card>
                <Button variant="contained" disabled style={{ color: 'grey', width: '100%' }}>Download Material</Button>

            </Box>
        </Box>
    )
}