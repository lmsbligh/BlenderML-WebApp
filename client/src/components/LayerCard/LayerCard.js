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
import { handleTextFieldChange, validateField, validateLayerDimensions } from '../../utils.js';

const LayerCard = ({ layerUpdater, layer, prevLayer, index, saveCallback, delFunction, moveFunction, addLayerFunction }) => {
    //console.log("LayerCard ran with props:", layer, index, delFunction);

    // const [blocalLayer, bsetLocalLayer] = useImmer({
    //     "activation": layer.activation,
    //     "id": layer.id,
    //     "layer_type": layer.layer_type,
    //     "padding": structuredClone(layer.padding),
    //     "x_0": structuredClone(layer.x_0),
    //     "x_1": structuredClone(layer.x_1),
    //     "x_2": structuredClone(layer.x_2),
    //     "x_3": structuredClone(layer.x_3)
    // });
    const [localLayer, setLocalLayer] = useImmer(structuredClone(layer));

    React.useEffect(() => {
        //console.log("saveCallback, localLayer: ", localLayer)
        saveCallback(() => (localLayer))
    }, [localLayer, saveCallback])
    // React.useEffect(() => {
    //     layerUpdater(localLayer)
    // }, [localLayer])
    
    
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

    const updateLayerError = (error, helper)  => {
        setLocalLayer((localLayerData) => {
            return produce(localLayerData, (draft) => {
                draft.x_0.error = error;
                draft.x_0.conditionalHelper = helper;
            })
        })
    }

    React.useEffect(() => {
        if(localLayer && prevLayer) {
            const [x_0_error, x_0_helper] = validateLayerDimensions(localLayer, prevLayer);
            console.log("x_0_error: ", x_0_error)
            updateLayerError(x_0_error, x_0_helper);
        }
    }, [prevLayer])
    // console.log(localLayer.padding)
    return (
        <Paper variant='outlined' >
            <Tooltip title="Move up."><IconButton color='primary' onClick={() => moveFunction(index, -1)}><VerticalAlignTopIcon /></IconButton></Tooltip>
            <Tooltip title="Add preceding layer."><IconButton color='primary' onClick={() => addLayerFunction(index, -1)}><AddIcon /></IconButton></Tooltip>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
                <Typography>Layer {index + 1}</Typography>
                <IconButton aria-label="delete" color="primary" onClick={() => delFunction(index)}><DeleteIcon /></IconButton>

            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
                <SelectorLayerType layerType={localLayer.layer_type} handleChange={handleLayerTypeChange} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px' }}>
                <TextField 
                    name="x_0" 
                    label="x_0" 
                    error={localLayer.x_0.error}
                    helperText={localLayer.x_0.error ? (localLayer.x_0.conditionalHelper ? localLayer.x_0.conditionalHelper : localLayer.x_0.helper) : ''}
                    value={localLayer.x_0.value}
                    onBlur={() => {
                        layerUpdater(localLayer);
                        const [x_0_error, x_0_helper] = validateLayerDimensions(localLayer, prevLayer);
                        console.log("x_0_error: ", x_0_error)
                        updateLayerError(x_0_error, x_0_helper);
                    }} 
                    onChange={
                        (event) => {
                            handleTextFieldChange({ eve: event, setState: setLocalLayer });
                            validateField({ key: 'x_0', setFormState: setLocalLayer });
                        }}/>
                <TextField 
                    name="x_1" 
                    label="x_1"
                    error={localLayer.x_1.error}
                    helperText={localLayer.x_1.error ? localLayer.x_1.helper : ''}
                    value={localLayer.x_1.value}
                    onBlur={() => layerUpdater(localLayer)} 
                    onChange={
                        (event) => { 
                            handleTextFieldChange({ eve: event, setState: setLocalLayer });
                            validateField({ key: 'x_1', setFormState: setLocalLayer });
                            validateLayerDimensions(localLayer, prevLayer)
                            }}/>
                <TextField 
                    name="x_2" 
                    label="x_2" 
                    error={localLayer.x_2.error}
                    helperText={localLayer.x_2.error ? localLayer.x_2.helper : ''}
                    value={localLayer.x_2.value} 
                    onChange={
                        (event) => { 
                            handleTextFieldChange({ eve: event, setState: setLocalLayer });
                            validateField({ key: 'x_2', setFormState: setLocalLayer });
                            }}/>
                <TextField 
                    name="x_3" 
                    label="x_3"
                    error={localLayer.x_3.error}
                    helperText={localLayer.x_3.error ? localLayer.x_3.helper : ''} 
                    value={localLayer.x_3.value} 
                    onChange={
                        (event) => { 
                            handleTextFieldChange({ eve: event, setState: setLocalLayer }) 
                            validateField({ key: 'x_3', setFormState: setLocalLayer });
                            }}/>
            </Box>
            <TextField 
                name="padding" 
                label="padding" 
                error={localLayer.padding.error}
                helperText={localLayer.padding.error ? localLayer.padding.helper : ''}
                value={localLayer.padding.value} 
                onChange={
                    (event) => { 
                        handleTextFieldChange({ eve: event, setState: setLocalLayer })
                        validateField({ key: 'padding', setFormState: setLocalLayer }); 
                        }} 
                sx={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px' }} />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
                <SelectorLayerActivation activationType={localLayer.activation} handleChange={handleActivationTypeChange} />
            </Box>
            <Tooltip title="Move down."><IconButton color='primary' onClick={() => moveFunction(index, +1)}><VerticalAlignBottomIcon /></IconButton></Tooltip>
            <Tooltip title="Add succeeding layer."><IconButton color='primary' onClick={() => addLayerFunction(index, +1)}><AddIcon /></IconButton></Tooltip>

        </Paper>
    )
}

// export default React.memo(LayerCard, (prevProps, nextProps) => {
//     return (

//     )
// })
export default LayerCard;