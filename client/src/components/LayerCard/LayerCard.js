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
import { fetchData, handleTextFieldChange, pushData, validateField, validateLayerDimensions } from '../../utils.js';

const LayerCard = ({ layerUpdater, layer, layers, index, saveCallback, delFunction, moveFunction, addLayerFunction, inputImageRes }) => {
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
    const [x_0_req, setX_0_req] = React.useState(null)
    const prevLayer = index > 0 ? layers[index - 1] : null
    React.useEffect(() => {
        //console.log("saveCallback, localLayer: ", localLayer)
        saveCallback(() => (localLayer))
    }, [localLayer, saveCallback])
    // React.useEffect(() => {
    //     layerUpdater(localLayer)
    // }, [localLayer])
    React.useEffect(() => {
        console.log("updated LayerCard Layers:", layers)
        let layersToPush = []
        layers.slice(0, index + 1).map((ind_layer) => {
            layersToPush.push({
                "id": ind_layer.id,
                "activation": ind_layer.activation,
                "layer_type": ind_layer.layer_type,
                "padding": ind_layer.padding.value,
                "x_0": ind_layer.x_0.value,
                "x_1": ind_layer.x_1.value,
                "x_2": ind_layer.x_2.value,
                "x_3": ind_layer.x_3.value
            })
        })

        const data = {
            layers: layersToPush,
            input_image_res: {
                x: inputImageRes.x.value,
                y: inputImageRes.y.value
            }
        }
        pushData(`/layer_dimension_requirement`, data)
            .then(response => response.json()
            )
            .then(
                (json) => {
                    console.log("LayerCard: /layer_dimension_requirement response: ", json)
                    if (json.required_input_size) {
                        setX_0_req({ value: json.required_input_size, helper: json.helper })

                    }
                }
            )
            .catch(error => {
                console.error("Error fetching required input size:", error);
            });
    }, [layers, inputImageRes])

    React.useEffect(() => {
        console.log("LayerCard x_0_req: ", x_0_req)
    }, [x_0_req])
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

    const updateLayerError = (error, helper) => {
        setLocalLayer((localLayerData) => {
            return produce(localLayerData, (draft) => {
                draft.x_0.error = error;
                draft.x_0.conditionalHelper = helper;
            })
        })
    }

    // React.useEffect(() => {
    //     if (localLayer && prevLayer) {
    //         const [x_0_error, x_0_helper] = validateLayerDimensions(localLayer, prevLayer);
    //         console.log("x_0_error: ", x_0_error)
    //         updateLayerError(x_0_error, x_0_helper);
    //     }
    // }, [prevLayer])
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
                {localLayer.layer_type === 'Pooling' ?
                    null
                    :
                    <><TextField
                        name="x_0"
                        label={localLayer.layer_type === "CNN" ? "Input channels" : "Input size"}
                        error={localLayer.x_0.error}
                        helperText={x_0_req ? x_0_req.helper : localLayer.x_0.error ? (localLayer.x_0.conditionalHelper ? localLayer.x_0.conditionalHelper : localLayer.x_0.helper) : ''}
                        value={x_0_req ? x_0_req.value : localLayer.x_0.value}
                        onBlur={() => {
                            layerUpdater(localLayer);
                            // const [x_0_error, x_0_helper] = validateLayerDimensions(localLayer, prevLayer);
                            // console.log("x_0_error: ", x_0_error)
                            // updateLayerError(x_0_error, x_0_helper);
                        }}
                        disabled={x_0_req}
                        onChange={
                            (event) => {
                                if (!x_0_req) {
                                    handleTextFieldChange({ eve: event, setState: setLocalLayer });
                                    validateField({ key: 'x_0', setFormState: setLocalLayer });
                                }

                            }} />
                        <TextField
                            name="x_1"
                            label={localLayer.layer_type === "CNN" ? "Number of filters" : "Output size"}
                            error={localLayer.x_1.error}
                            helperText={localLayer.x_1.error ? localLayer.x_1.helper : ''}
                            value={localLayer.x_1.value}
                            onBlur={() => layerUpdater(localLayer)}
                            onChange={
                                (event) => {
                                    handleTextFieldChange({ eve: event, setState: setLocalLayer });
                                    validateField({ key: 'x_1', setFormState: setLocalLayer });
                                    validateLayerDimensions(localLayer, prevLayer)
                                }} />
                    </>
                }

            </Box>
            {/* <TextField
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
                sx={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px' }} /> */}
            {localLayer.layer_type === 'Pooling' ?
                null : 
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
                    <SelectorLayerActivation activationType={localLayer.activation} handleChange={handleActivationTypeChange} />
                </Box>}

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