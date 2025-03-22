import * as React from 'react';
import { useImmer } from 'use-immer';
import produce from "immer";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Paper, Tooltip } from '@mui/material/';
import Typography from '@mui/material/Typography';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import AddIcon from '@mui/icons-material/Add';

import SelectorLayerType from '../SelectorLayerType/SelectorLayerType.js'
import SelectorLayerActivation from '../SelectorLayerActivation/SelectorLayerActivation.js'
import { handleTextFieldChange } from '../../utils.js';

const LayerCard = ({layer, index, saveCallback, delFunction, moveFunction, addLayerFunction}) => {
    //console.log("LayerCard ran with props:", layer, index, delFunction);

    const [localLayer, setLocalLayer] = useImmer(layer);

    React.useEffect(() => {
        console.log("saveCallback, localLayer: ", localLayer)
        saveCallback(() => (localLayer))
    }, [localLayer, saveCallback])

    const handleLayerTypeChange = (newLayerType) => {
        setLocalLayer((localLayerData) => {
            return produce(localLayerData, (draft) => {
                draft.layer_type = newLayerType.layer_type
            })
        });
    };
    const handleActivationTypeChange = (newActivation) => {
        setLocalLayer((localLayerData) => {
            return produce(localLayerData, (draft) => {
                draft.activation = newActivation.activation
            })
        });
    };
    
    return ( 
        <Paper variant='outlined' >
            <Tooltip title="Move up."><IconButton color='primary' onClick={() => moveFunction(index, -1)}><VerticalAlignTopIcon /></IconButton></Tooltip>
            <Tooltip title="Add preceding layer."><IconButton color='primary' onClick={() => addLayerFunction(index, -1)}><AddIcon /></IconButton></Tooltip>
            <Box sx={{display:'flex', flexDirection: 'row', justifyContent:'space-between', padding: '10px' }}>
                <Typography>Layer {index+1}</Typography>
                <IconButton aria-label="delete" color="primary" onClick={() => delFunction(index)}><DeleteIcon /></IconButton>
                
            </Box>
            <Box sx={{display:'flex', flexDirection: 'row', justifyContent:'space-between', padding: '10px' }}>
                <SelectorLayerType  layerType={localLayer.layer_type} handleChange={handleLayerTypeChange}/>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px'}}>
                <TextField name="x_0" label="x_0" value={localLayer.x_0} onChange={(event) => {handleTextFieldChange({eve: event, setState: setLocalLayer})}}></TextField>
                <TextField name="x_1" label="x_1" value={localLayer.x_1} onChange={(event) => {handleTextFieldChange({eve: event, setState: setLocalLayer})}}></TextField>
                <TextField name="x_2" label="x_2" value={localLayer.x_2} onChange={(event) => {handleTextFieldChange({eve: event, setState: setLocalLayer})}}></TextField>
                <TextField name="x_3" label="x_3" value={localLayer.x_3} onChange={(event) => {handleTextFieldChange({eve: event, setState: setLocalLayer})}}></TextField>
            </Box>
                <TextField name="padding" label="padding" value={localLayer.padding} onChange={(event) => {handleTextFieldChange({eve: event, setState: setLocalLayer})}} sx={{display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px'}} ></TextField>
            <Box sx={{display:'flex', flexDirection: 'row', justifyContent:'space-between', padding: '10px' }}>
                <SelectorLayerActivation  activationType={localLayer.activation} handleChange={handleActivationTypeChange}/>
            </Box>
            <Tooltip title="Move down."><IconButton color='primary' onClick={() => moveFunction(index, +1)}><VerticalAlignBottomIcon /></IconButton></Tooltip>
            <Tooltip title="Add succeeding layer."><IconButton color='primary' onClick={() => addLayerFunction(index, +1)}><AddIcon /></IconButton></Tooltip>

        </Paper>
    )
}

export default LayerCard;