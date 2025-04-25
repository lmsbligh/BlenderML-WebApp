import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import { Button, Card, Paper, Grid, TextField, List, ListItem } from '@mui/material/';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import SelectorDatasetProfile from '../components/SelectorDatasetProfile/SelectorDatasetProfile.js';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { v4 as uuidv4 } from 'uuid';

import { fetchData, handleSelectorFormChange, handleTextFieldChange, pushData, validateField, validateForm, Validation } from '../utils.js'

export default function DatasetGenerator() {
    const defaultProfile = {
        "description": "",
        "datasetName": '',
        "datasetSize": '10',
        "skyboxPath": '',
        "imageWidth": '250',
        "imageHeight": '250',
        "meshes": {
            "cube": false,
            "sphere": false,
            "monkey": false,
            "car": false
        },
        "randomOrientation": false
    }

    const [profileOptions, setProfileOptions] = useImmer([]);
    const [selectedDatasetProfile, setSelectedDatasetProfile] = useImmer({});
    const [sampleImages, setSampleImages] = useImmer([]);

    const [profileForm, setProfileForm] = useImmer(structuredClone(
        {
            "description": new Validation({
                value: "",
                error: false,
                regex: "",
                required: false,
                helper: ""
            }),
            "datasetName": new Validation({
                value: "",
                error: false,
                regex: /^[A-Za-z0-9 -]{1,15}$/,
                required: true,
                helper: "Please enter a name for this dataset."
            }),
            "datasetSize": new Validation({
                value: "",
                error: false,
                regex: /^(?:[1-9]\d{0,2}|[1-4]\d{3}|5000)$/,
                required: true,
                helper: "Please enter a number between 1 and 5000."
            }),
            "skyboxPath": new Validation({
                value: "",
                error: false,
                regex: "",
                required: false,
                helper: ""
            }),
            "imageWidth": new Validation({
                value: "",
                error: false,
                regex: /^(?:[1-9]\d{0,2}|1000)$/,
                required: true,
                helper: "Please enter a number between 1 and 1000."
            }),
            "imageHeight": new Validation({
                value: "",
                error: false,
                regex: /^(?:[1-9]\d{0,2}|1000)$/,
                required: true,
                helper: "Please enter a number between 1 and 1000."
            }),
            "meshes": new Validation({
                value: {
                    "cube": false,
                    "sphere": false,
                    "monkey": false,
                    "car": false
                },
                error: false,
                regex: "",
                required: false,
                helper: ""
            }),
            "randomOrientation": new Validation({
                value: false,
                error: false,
                regex: "",
                required: false,
                helper: ""
            })
        }));


    React.useEffect(() => {
        fetchData('dataset_profiles', setProfileOptions)
    }, []);
    const fillForm = () => {
        setProfileForm((prevVals) => {
            return produce(prevVals, (draft) => {
                for (var key in draft) {
                    draft[key].value = selectedDatasetProfile[key]
                }
            })
        })
    }
    React.useEffect(() => {
        if (selectedDatasetProfile && Object.keys(selectedDatasetProfile).length > 0) {
            fillForm()
        }
    }, [selectedDatasetProfile])


    const handleProfileChange = (event) => {
        if (event.target.value == -1) {
            setSelectedDatasetProfile({ ...structuredClone(defaultProfile), value: uuidv4().slice(0, 8) })
        }
        else {
            setSelectedDatasetProfile(structuredClone(profileOptions.find((option) => option.value === event.target.value)))
        }
    }

    const handleMeshListChange = (event) => {
        const { name, checked } = event.target;
        setProfileForm((prevDatasetProfile) => {
            return produce(prevDatasetProfile, (draft) => {
                draft.meshes.value[name] = checked;
            })
        })
    };

    const handleRandomOrientationChange = (event) => {
        const { name, checked } = event.target;
        setProfileForm((prevDatasetProfile) => {
            return produce(prevDatasetProfile, (draft) => {
                draft.randomOrientation.value = profileForm.randomOrientation.value ? false : true;
            })
        })
    };

    const handleProfileDelete = (value) => {

        setProfileOptions((prevOptions) => {
            return produce(prevOptions, (draft) => {
                const index = prevOptions.findIndex((option) => option.value === value)
                draft.splice(index, 1)
            })
        })
        pushData('delete_dataset_profile', selectedDatasetProfile)
        setSelectedDatasetProfile(defaultProfile)
    }
    const fillObject = () => {
        setSelectedDatasetProfile((prevVals) => {
            return produce(prevVals, (draft) => {
                for (var key in profileForm) {
                    draft[key] = profileForm[key].value
                }
            })
        })
    }
    React.useEffect(() => {
        fillObject()
    }, [profileForm])

    const handleProfileSave = (event) => {
        //event.preventDefault();
        for (let key in profileForm) {
            validateField({ key: key, setFormState: setProfileForm })
        }
        setTimeout(() => {
            if (!validateForm({ formElement: profileForm })) {
                setProfileOptions((prevOptions) =>
                    produce(prevOptions, (draft) => {
                        const selected = prevOptions.findIndex((option) => option.value === selectedDatasetProfile.value);
                        if (selected == -1) {
                            draft.push(selectedDatasetProfile)
                        }
                        else {
                            draft[selected] = structuredClone(selectedDatasetProfile);
                        }
                    })
                );
                pushData('submit_dataset_profile', selectedDatasetProfile)
            }
        }, 0)

    }

    const handleGenerateDataset = (event) => {
            handleProfileSave(event)
            if (!validateForm({ formElement: profileForm })) {
            try {
                fetch('submit_generate_dataset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    title: 'title',
                    body: JSON.stringify(selectedDatasetProfile),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        setSampleImages(data.sample_URLs);
                    })
            } catch (error) {
                console.error('Error:', error);
            }
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
            gap: '10px',
        }}>
            <Grid container>
                <Grid item sm={6} xs={12} sx={{ display: "flex", flexDirection: "column", rowGap: "5px", columnGap: "5px" }}>
                    <SelectorDatasetProfile
                        selectedDatasetProfile={selectedDatasetProfile}
                        handleChange={handleProfileChange}
                        profileOptions={profileOptions}
                    />
                    {'value' in selectedDatasetProfile ? <Box>
                        <TextField
                            name="datasetName"
                            onChange={(event) => {
                                handleTextFieldChange({ eve: event, setState: setProfileForm })
                                validateField({ key: 'datasetName', setFormState: setProfileForm })
                            }}
                            sx={{ width: "50%", padding: "5px" }}
                            label="Dataset Name"
                            error={profileForm.datasetName.error}
                            helperText={profileForm.datasetName.error ? profileForm.datasetName.helper : ''}
                            value={profileForm.datasetName.value}></TextField>
                        <TextField
                            name="datasetSize"
                            onChange={(event) => {
                                handleTextFieldChange({ eve: event, setState: setProfileForm })
                                validateField({ key: 'datasetSize', setFormState: setProfileForm })
                            }}
                            sx={{ width: "50%", padding: "5px" }}
                            label="Dataset Size"
                            error={profileForm.datasetSize.error}
                            helperText={profileForm.datasetSize.error ? profileForm.datasetSize.helper : ''}
                            value={profileForm.datasetSize.value}></TextField>
                        <TextField
                            name="skyboxPath"
                            onChange={(event) => {
                                handleTextFieldChange({ eve: event, setState: setProfileForm })
                                validateField({ key: 'skyboxPath', setFormState: setProfileForm })
                            }}
                            sx={{ width: "50%", padding: "5px" }}
                            label="Skybox path"
                            error={profileForm.skyboxPath.error}
                            helperText={profileForm.skyboxPath.error ? profileForm.skyboxPath.helper : ''}
                            value={profileForm.skyboxPath.value}></TextField>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "horizontal"
                        }}>
                            <TextField
                                name="imageWidth"
                                onChange={(event) => {
                                    handleTextFieldChange({ eve: event, setState: setProfileForm })
                                    validateField({ key: 'imageWidth', setFormState: setProfileForm })
                                }}
                                label="Image width"
                                error={profileForm.imageWidth.error}
                                helperText={profileForm.imageWidth.error ? profileForm.imageWidth.helper : ''}
                                value={profileForm.imageWidth.value}
                                sx={{ padding: "5px" }}></TextField>
                            <TextField
                                name="imageHeight"
                                onChange={(event) => {
                                    handleTextFieldChange({ eve: event, setState: setProfileForm })
                                    validateField({ key: 'imageHeight', setFormState: setProfileForm })
                                }}
                                label="Image height"
                                error={profileForm.imageHeight.error}
                                helperText={profileForm.imageHeight.error ? profileForm.imageHeight.helper : ''}
                                value={profileForm.imageHeight.value}
                                sx={{ padding: "5px" }}></TextField>
                        </Box>
                        <TextField
                            name="description"
                            multiline
                            maxRows={4}
                            onChange={(event) => {
                                handleTextFieldChange({ eve: event, setState: setProfileForm })
                                validateField({ key: 'description', setFormState: setProfileForm })
                            }}
                            label="Profile description"
                            error={profileForm.description.error}
                            helperText={profileForm.description.error ? profileForm.description.helper : ''}
                            value={profileForm.description.value}
                            sx={{ padding: "5px", width: "100%" }}></TextField>
                        <Paper variant='outlined'>
                            <Typography>
                                Available meshes:
                            </Typography>
                            <List sx={{ display: "flex", flexDirection: "column" }}>
                                <ListItem>
                                    <FormControlLabel
                                        control={<Checkbox checked={profileForm.meshes.value["cube"] || false}
                                            name="cube" onChange={handleMeshListChange}
                                            sx={{ padding: "5px" }} />}
                                        label="Cube" />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={profileForm.meshes.value["sphere"] || false}
                                            name="sphere" onChange={handleMeshListChange}
                                            sx={{ padding: "5px" }} />}
                                        label="Sphere" />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel
                                        control={<Checkbox checked={profileForm.meshes.value["monkey"] || false}
                                            name="monkey"
                                            onChange={handleMeshListChange}
                                            sx={{ padding: "5px" }} />}
                                        label="Monkey" />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel
                                        control={<Checkbox checked={profileForm.meshes.value["car"] || false}
                                            name="car" onChange={handleMeshListChange}
                                            sx={{ padding: "5px" }} />}
                                        label="Car" />
                                </ListItem>
                            </List>

                        </Paper>
                        <FormControlLabel control={<Checkbox checked={profileForm.randomOrientation.value || false} onChange={handleRandomOrientationChange} sx={{ padding: "10px" }} />} label="Randomized orientation" />
                        <Box sx={{
                            display: "flex",
                            flexDirection: "horizontal",
                            justifyContent: 'space-between'
                        }}>
                            <Button variant="contained" sx={{ width: "49%" }} label="Save Profile" onClick={handleProfileSave}>Save Preset</Button>
                            <Button variant="contained" color="error" sx={{ width: "49%" }} label="Delete Profile" onClick={() => handleProfileDelete(selectedDatasetProfile.value)}>Delete Profile</Button>
                            <Button variant="contained" sx={{ width: "49%" }} label="Generate Dataset" onClick={handleGenerateDataset}>Generate Dataset</Button>
                        </Box>
                    </Box> : null}
                </Grid>
                <Grid item sm={6} xs={12} sx={{ padding: "10px", display: "flex", flexDirection: "column", rowGap: "5px", columnGap: "5px" }}>
                    <Box sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        flexDirection: "horizontal",
                        justifyContent: 'space-between',
                        padding: "10px"
                    }}>
                        {sampleImages ? sampleImages.map((option, ind) => {
                            return <Card key={ind} sx={{ maxWidth: 345 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ height: 140 }}
                                    image={option}
                                    onError={() => console.error("Image failed to load:", option)}
                                />

                            </Card>
                        })
                            : null}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}