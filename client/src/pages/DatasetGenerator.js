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

import { fetchData, handleSelectorFormChange } from '../utils.js'

export default function DatasetGenerator() {
    const defaultProfile = {
        "description": "",
        "datasetName": '',
        "datasetSize": '10',
        "skyboxPath": '',
        "imageWidth": '250',
        "imageHeight": '250',
        "meshes": {
            "cube": true,
            "sphere": false,
            "monkey": true,
            "car": false
        },
        "randomOrientation": false
    }
    
    const [profileOptions, setProfileOptions] = useImmer([]);
    const [selectedDatasetProfile, setSelectedDatasetProfile] = useImmer('');
    const [sampleImages, setSampleImages] = useImmer([]);
    
    React.useEffect(()=> {
            fetchData('datasetProfiles', setProfileOptions)
        }, []);

    const handleProfileChange = (event) => {
        event.target.value == -1 ? setSelectedDatasetProfile({...structuredClone(defaultProfile), value: uuidv4().slice(0, 8)}) : setSelectedDatasetProfile(structuredClone(profileOptions.find((option) => option.value === event.target.value)));
        console.log("selected dataset profile: ", selectedDatasetProfile)
        //console.log("selected dataset profile value: ", selectedDatasetProfile.value)
    }
    const handleTextFieldChange = (event) => {
        const { name, value } = event.target;
        setSelectedDatasetProfile((prevDatasetProfile) => {
            return produce(prevDatasetProfile, (draft) => {
                if (name in draft) {
                    draft[name] = value;
                }
                else {
                    console.error(`Invalid key '${name}' in draft.`);
                }
            })
        });
    };

    const handleMeshListChange = (event) => {
        const { name, checked } = event.target;
        setSelectedDatasetProfile((prevDatasetProfile) => {
            return produce(prevDatasetProfile, (draft) => {
            draft.meshes[name] = checked;
                    })})
        console.log("updated selectedDatasetProfile:")
    };

    const handleRandomOrientationChange = (event) => {
        const { name, checked } = event.target;
        setSelectedDatasetProfile((prevDatasetProfile) => {
            return produce(prevDatasetProfile, (draft) => {
            draft.randomOrientation = selectedDatasetProfile.randomOrientation ? false : true;
                    })})
    };

    const handleProfileDelete = (value) => {
        console.log("delProfile ran!!!")
        setProfileOptions((prevOptions) => {
                    return produce(prevOptions, (draft) => {
                        const index = prevOptions.findIndex((option) => option.value === value)
                        draft.splice(index, 1)
                            })})
        try {
            fetch('deleteDatasetProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(selectedDatasetProfile),
            })
            .then(setSelectedDatasetProfile(null))
        }
        catch (error) {
            console.error('Error:', error);
        }
    }

    const handleProfileSave = (event) => {
        event.preventDefault();
        setProfileOptions((prevOptions) => 
            produce(prevOptions, (draft) => {
                const selected = prevOptions.findIndex((option) => option.value === selectedDatasetProfile.value);
                if (selected == -1 ){
                    draft.push(selectedDatasetProfile)
                    console.log("Profile is new, draft: ", draft)
                }
                else {
                    draft[selected] = structuredClone(selectedDatasetProfile);
                }
            })
        );
        
        
        try {
            fetch('submitDatasetProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(selectedDatasetProfile),
            })
            
            
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleGenerateDataset = (event) => {
        handleProfileSave(event)
        try {
            fetch('submitGenerateDataset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                title: 'title',
                body: JSON.stringify(selectedDatasetProfile),
            }).then( response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then( data => {
                console.log("generateDataset response received: ", data);
                console.log("generateDataset, sample_URLs: ", data.sample_URLs);

                setSampleImages(data.sample_URLs);
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
            gap: '10px',
        }}>
            <Grid container>
                <Grid item  sm={6} xs={12} sx={{display: "flex", flexDirection: "column", rowGap: "5px", columnGap: "5px"}}>
                        <SelectorDatasetProfile selectedDatasetProfile={selectedDatasetProfile}
                            handleChange={handleProfileChange} 
                            profileOptions={profileOptions}
                        />
                        {console.log()}
                        {selectedDatasetProfile ? <Box>
                            <TextField name="datasetName" onChange={handleTextFieldChange} sx={{width: "50%", padding: "5px"}} label="Dataset Name" value={selectedDatasetProfile.datasetName}></TextField>
                        <TextField name="datasetSize" onChange={handleTextFieldChange} sx={{width: "50%", padding: "5px"}} label="Dataset Size" value={selectedDatasetProfile.datasetSize}></TextField>
                        <TextField name="skyboxPath" onChange={handleTextFieldChange} sx={{width: "50%", padding: "5px"}}label="Skybox path" value={selectedDatasetProfile.skyboxPath}></TextField>
                        <Box sx={{display: "flex",
                            flexDirection: "horizontal"
                        }}>
                            <TextField name="imageWidth" onChange={handleTextFieldChange} label="Image width" value={selectedDatasetProfile.imageWidth} sx={{padding: "5px"}}></TextField>
                            <TextField name="imageHeight" onChange={handleTextFieldChange} label="Image height" value={selectedDatasetProfile.imageHeight} sx={{padding: "5px"}}></TextField>
                        </Box>
                        <TextField name="description" multiline maxRows={4} onChange={handleTextFieldChange} label="Profile description" value={selectedDatasetProfile.description} sx={{padding: "5px", width: "100%"}}></TextField>
                        <Paper variant='outlined'>
                            <Typography>
                                Available meshes:
                            </Typography>
                            <List sx={{display: "flex", flexDirection: "column"}}>
                                <ListItem>
                                    <FormControlLabel control={<Checkbox checked={selectedDatasetProfile.meshes["cube"] ||false} name="cube" onChange={handleMeshListChange}  sx={{padding: "5px"}}/>} label="Cube" />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel control={<Checkbox checked={selectedDatasetProfile.meshes["sphere"] ||false} name="sphere" onChange={handleMeshListChange}  sx={{padding: "5px"}}/>} label="Sphere" />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel control={<Checkbox checked={selectedDatasetProfile.meshes["monkey"] ||false} name="monkey" onChange={handleMeshListChange}  sx={{padding: "5px"}}/>} label="Monkey" />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel control={<Checkbox checked={selectedDatasetProfile.meshes["car"] ||false} name="car" onChange={handleMeshListChange}  sx={{padding: "5px"}}/>} label="Car" />
                                </ListItem>
                            </List>
                            
                        </Paper>
                        <FormControlLabel control={<Checkbox checked={selectedDatasetProfile.randomOrientation ||false}  onChange={handleRandomOrientationChange} sx={{padding: "10px"}}/>} label="Randomized orientation" />
                        <Box sx={{display: "flex",
                            flexDirection: "horizontal",
                            justifyContent:'space-between'
                        }}>
                            <Button variant="contained" sx={{width: "49%"}} label="Save Profile" onClick={handleProfileSave}>Save Preset</Button>
                            <Button variant="contained" color="error" sx={{width: "49%"}} label="Delete Profile" onClick={() => handleProfileDelete(selectedDatasetProfile.value)}>Delete Profile</Button>
                            <Button variant="contained" sx={{width: "49%"}} label="Generate Dataset" onClick={handleGenerateDataset}>Generate Dataset</Button>
                        </Box>
                        </Box> : console.log("NULL profile selected")}
                </Grid>
                <Grid item  sm={6} xs={12} sx={{padding: "10px", display: "flex", flexDirection: "column", rowGap: "5px", columnGap: "5px"}}>
                <Box sx={{display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "horizontal",
                            justifyContent:'space-between',
                            padding: "10px"}}>
                                { sampleImages ?  sampleImages.map((option, ind) => {
                                    return <Card key={ind} sx={{ maxWidth: 345 }}>
                                    <CardMedia
                                      component="img"
                                      sx={{ height: 140 }}
                                      image={option}
                                      onError={() => console.error("Image failed to load:", option)}
                                    />

                                    </Card>
                                }) 
                                : null }
                        </Box>
                </Grid>
            </Grid>
        </Box> 
    )
}