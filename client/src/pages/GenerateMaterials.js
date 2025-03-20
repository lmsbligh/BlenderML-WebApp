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
import fetchData from '../utils.js'

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

    const handleCheckpointChange = (event) => {
        setSelectedCheckpoint(event.target.value)
        setGenerateMaterialForm((prevVals) => {
            return produce(prevVals, (draft) => {
                draft.checkpoint = event.target.value;
            }
            )
        })
    }

    const handleSelectorModelChange = (event) => {
        const model = modelData.find((option) => option.value === event.target.value);
        setSelectedModel(model)
        setGenerateMaterialForm((prevVals) => {
            return produce(prevVals, (draft) => {
                draft.model = event.target.value
            })
        })
    };

    const handleUploadFile = (event) => {
        console.log("upload event handler called")

        const formData = new FormData();
        formData.append('uploadFile', event.target.files[0])
        //console.log("image file: ", generateMaterialForm.image)
        fetch('uploadFile', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            //console.log("response: ", response.json())

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

    const handleGenerateMaterial = (event) => {
        console.log("handleGenerate ran")
        try {
            fetch('generateMaterial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(generateMaterialForm),
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                //console.log("response: ", response.json())

                return response.json(); // or response.json(), depending on your server response
            })
                .then(data => {
                    console.log("Response received:", data);
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

                {modelData ? <SelectorModel selectedModel={selectedModel} handleChange={handleSelectorModelChange} modelOptions={modelData} /> : null}
                {selectedModel ? <SelectedModel selectedModel={selectedModel} /> : null}
                <SelectorCheckpoint selectedCheckpoint={selectedCheckpoint} handleChange={handleCheckpointChange} checkpointOptions={checkpointOptions} />

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