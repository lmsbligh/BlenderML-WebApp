import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import { Button, Card, Paper, Grid, TextField, List, ListItem, Input, FormControl, FormLabel, OutlinedInput, InputLabel } from '@mui/material/';
import Slider from '@mui/material/Slider';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import SelectorDatasetProfile from '../components/SelectorDatasetProfile/SelectorDatasetProfile.js';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { v4 as uuidv4 } from 'uuid';

import { fetchData, handleCloseDelDialog, handleSelectorFormChange, handleTextFieldChange, pushData, validateField, validateForm, Validation } from '../utils.js'
import DeleteDialog from '../components/DeleteDialog/DeleteDialog.js';
import DatasetCard from '../components/DatasetCard/DatasetCard.js';

export default function DatasetGenerator() {
    const defaultProfile = {
        "description": "",
        "datasetName": '',
        "datasetSize": '10',
        "CVPercentage": '20',
        "TestSetPercentage": '20',
        "imageWidth": '250',
        "imageHeight": '250',
        "randomOrientation": false
    }

    const [profileOptions, setProfileOptions] = useImmer([]);
    const [selectedDatasetProfile, setSelectedDatasetProfile] = useImmer({});
    const [sampleImages, setSampleImages] = useImmer([]);
    const [profileDatasets, setProfileDatasets] = useImmer([])
    const [profileForm, setProfileForm] = useImmer(structuredClone(
        {
            "description": new Validation({
                value: "",
                error: false,
                regex: /^[A-Za-z0-9 -,.]{1,150}$/,
                required: false,
                helper: "Descriptions are limited to 150 characters."
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
            "CVPercentage": new Validation({
                value: "",
                error: false,
                regex: /^(?:[0-9]|[1-2][0-9]|30)$/,
                required: true,
                helper: ""
            }),
            "TestSetPercentage": new Validation({
                value: "",
                error: false,
                regex: /^(?:[0-9]|[1-2][0-9]|30)$/,
                required: true,
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
            "randomOrientation": new Validation({
                value: false,
                error: false,
                regex: "",
                required: false,
                helper: ""
            })
        }));
    const marks = [
        {
            value: 0,
            label: '0%',
        },
        {
            value: 10,
            label: '10%',
        },
        {
            value: 20,
            label: '20%',
        },
        {
            value: 30,
            label: `30%`,
        },
    ];
    const [delProfileDialog, setDelProfileDialog] = React.useState(false);
    
    function valuetext(value) {
        return `${Math.ceil(value)}%`;
    }

    React.useEffect(() => {
        fetchData('dataset_profiles', setProfileOptions)
    }, []);
    React.useEffect(() => {
        if (selectedDatasetProfile.value) {
            fetchData(`datasets/${selectedDatasetProfile.value}`, setProfileDatasets)
        }
    }, [selectedDatasetProfile]);

    React.useEffect(() => {
        // console.log(profileDatasets)
    }, [profileDatasets])
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

    const delDataset = (datasetID) => {
        pushData(`delete_dataset/${datasetID}`, datasetID).then(() => {
            fetchData(`datasets/${selectedDatasetProfile.value}`, setProfileDatasets)
            setSampleImages([])
        })
    }
    const sliderHandleChange = (event) => {
        setProfileForm((prevVals) => {
            return produce(prevVals, (draft) => {
                draft[event.target.name].value = Math.ceil(event.target.value)
            })
        })
    }
    const handleProfileSave = () => {
        //event.preventDefault();
        for (let key in profileForm) {
            validateField({ key: key, setFormState: setProfileForm })
        }
        const updatedProfile = {};
        for (const key in profileForm) {
            updatedProfile[key] = profileForm[key].value;
        }
        setSelectedDatasetProfile((prev) => ({ ...prev, ...updatedProfile }));

        setTimeout(() => {
            if (!validateForm({ formElement: profileForm })) {
                pushData('submit_dataset_profile', { ...selectedDatasetProfile, ...updatedProfile })
                    .then(async (response) => {
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data.error);
                        }
                        else {
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
                        }
                    })
                    .catch(error => {
                        alert(`Server error: ${error.message}`);
                    })
            }
            else {
                console.log("validateForm error!!!")
            }
        }, 0)
        return { ...selectedDatasetProfile, ...updatedProfile }
    }

    const handleGenerateDataset = () => {
        const updatedProfile = handleProfileSave()
        if (!validateForm({ formElement: profileForm })) {
            try {
                fetch('submit_generate_dataset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    title: 'title',
                    body: JSON.stringify(updatedProfile),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        setSampleImages(data.sample_URLs);
                        fetchData(`datasets/${selectedDatasetProfile.value}`, setProfileDatasets)
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
                <Grid item sm={6} xs={12} sx={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "5px",
                    columnGap: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px"
                }}>
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
                            onBlur={() => { validateField({ key: 'datasetName', setFormState: setProfileForm }) }}
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
                            onBlur={() => { validateField({ key: 'datasetSize', setFormState: setProfileForm }) }}
                            sx={{ width: "50%", padding: "5px" }}
                            label="Dataset Size"
                            error={profileForm.datasetSize.error}
                            helperText={profileForm.datasetSize.error ? profileForm.datasetSize.helper : ''}
                            value={profileForm.datasetSize.value}></TextField>

                        <Box sx={{ position: 'relative', mt: 2, padding: "5px" }}>
                            <InputLabel
                                shrink
                                sx={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '12px',
                                    backgroundColor: 'white',
                                    paddingX: '4px',
                                }}
                            >
                                Cross Validation Set %:
                            </InputLabel>

                            <Box
                                sx={{
                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                    borderRadius: '4px',
                                    padding: '16px',
                                    width: '50%'

                                }}
                            >
                                <Slider
                                    aria-label="Always visible"
                                    label="CVPercentage"
                                    name="CVPercentage"
                                    onChange={sliderHandleChange}
                                    value={Number(profileForm.CVPercentage.value)}
                                    getAriaValueText={(value) => `${value}%`}
                                    step={1}
                                    min={0}
                                    max={30}
                                    valueLabelDisplay="auto"
                                    marks={marks}
                                // valueLabelFormat={(x) => Math.ceil(x * 0.3)}

                                />
                            </Box>
                        </Box>
                        <Box sx={{ position: 'relative', mt: 2, padding: '5px' }}>
                            <InputLabel
                                shrink
                                sx={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '12px',
                                    backgroundColor: 'white',
                                    paddingX: '4px',
                                }}
                            >
                                Test Set %:
                            </InputLabel>

                            <Box
                                sx={{
                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                    borderRadius: '4px',
                                    padding: '16px',
                                    width: '50%'
                                }}
                            >
                                <Slider
                                    aria-label="Always visible"
                                    label="TestSetPercentage"
                                    name="TestSetPercentage"
                                    onChange={sliderHandleChange}
                                    value={Number(profileForm.TestSetPercentage.value)}
                                    getAriaValueText={(value) => `${value}%`}
                                    step={1}
                                    min={0}
                                    max={30}
                                    valueLabelDisplay="auto"
                                    marks={marks}
                                />
                            </Box>
                        </Box>

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
                        <FormControlLabel control={<Checkbox checked={Boolean(profileForm.randomOrientation.value || false)} onChange={handleRandomOrientationChange} sx={{ padding: "10px" }} />} label="Randomized orientation" />
                        <Box sx={{
                            display: "flex",
                            flexDirection: "horizontal",
                            justifyContent: 'space-between'
                        }}>
                            <Button variant="contained" sx={{ width: "49%" }} label="Save Profile" onClick={handleProfileSave}>Save Preset</Button>
                            <DeleteDialog id={"checkpoint"} open={delProfileDialog} handleClose={handleCloseDelDialog} setDelDialog={setDelProfileDialog} delFunction={() => handleProfileDelete(selectedDatasetProfile.value)} />
                            <Button variant="contained" color="error" sx={{ width: "49%" }} label="Delete Profile" onClick={() => setDelProfileDialog(true)}>Delete Profile</Button>
                            <Button variant="contained" sx={{ width: "49%" }} label="Generate Dataset" onClick={handleGenerateDataset}>Generate Dataset</Button>
                        </Box>
                    </Box> : null}
                </Grid>
                {selectedDatasetProfile?.value ? (
                    <Grid item sm={6} xs={12} sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <Box sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "horizontal",
                            justifyContent: 'flex-start',
                        }}>
                            {Array.isArray(sampleImages) && sampleImages.length > 0 ? (
                                <Box sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    flexDirection: "column",
                                    justifyContent: 'space-between',
                                    padding: "10px",
                                }}>
                                    {sampleImages.map((option, ind) => (
                                        <Card key={ind} sx={{ maxWidth: 345 }}>
                                            <CardMedia
                                                component="img"
                                                sx={{ height: 140 }}
                                                image={option}
                                                onError={() => console.error("Image failed to load:", option)}
                                            />
                                        </Card>
                                    ))}
                                </Box>
                            ) : null}
                            <List disablePadding sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                gap: "10px",
                                padding: "10px",
                                border: 1,
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                borderRadius: 1
                            }}>
                                <Typography>Existing datasets generated by this profile: </Typography>
                                {profileDatasets ? profileDatasets.map((dataset, ind) => (
                                    <DatasetCard dataset={dataset} delDataset={delDataset}/>
                                )) : null}
                            </List>
                        </Box>
                    </Grid>
                ) : null}

            </Grid>
        </Box >
    )
}