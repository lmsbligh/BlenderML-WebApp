import produce from "immer";
import { v4 as uuidv4 } from 'uuid';
export const fetchData = (endpoint, setState) => {
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            setState(data)
        })
        .catch(error => console.error('Error fetching data:', error))
}
export const pushData = async (endpoint, data) => {
        return fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            title: 'title',
            body: JSON.stringify(data),
        });
    }

export const handleSelectorFormChange = ({ eve, setSelector, setForm, options }) => {
    if (options) {
        const option = options.find((option) => option.value === eve.target.value)
        setSelector(option)
    }
    else {
        setSelector(eve.target.value)
    }
    const selectLabel = eve.target.name
    setForm((prevVals) => {
        return produce(prevVals, (draft) => {
            draft[selectLabel].value = eve.target.value;
        })
    })
}

export const handleTextFieldChange = ({ eve, setState }) => {
    setState((prevVals) => {
        return produce(prevVals, (draft) => {
            console.log(draft[eve.target.name])
            console.log(eve.target.value)
            draft[eve.target.name].value = eve.target.value;
        })
    })
}

// export const validateForm = (setForm) => {
//     var formError = false
//     setForm((prevForm) => {
//         return produce(prevForm, (draft) => {
//             for (var key in draft) {

//                 if (draft[key].required && draft[key].value == "") {
//                     draft[key].error = true
//                     formError = true
//                 }
//                 else {
//                     draft[key].error = false
//                 }
//                 if (draft[key].regex && draft[key].value) {
//                     if (!draft[key].regex.test(draft[key].value)) {
//                         draft[key].error = true
//                         formError = true
//                     }
//                 }
//             }
//         })

//     })
//     console.log("formError: ", formError)
//     return formError
// }
export const validateForm = ({ formElement, elementParent = null }) => {

    console.log("validateForm(): ")
    console.log(formElement)
    //console.log(formElement.constructor.name)
    switch (formElement.constructor.name) {
        case "Array":
            var errorArray = []
            formElement.forEach(element => {
                errorArray.push(validateForm({ formElement: element, elementParent: formElement }))
            });
            return errorArray.includes(true)
        case "Object":
            if ("type" in formElement) {
                switch (formElement.type) {
                    case "Validation":
                        console.log("Validation: ", formElement)
                        console.log("Validation evaluation: ", validateValidator(formElement));
                        return validateValidator(formElement);
                    case "Layer":
                        console.log("Layer evaluation: ", validateLayer(formElement));
                        console.log("Rehydrated layer")
                        var layerIndex = elementParent.findIndex((option) => option.id === formElement.id)
                        if (layerIndex > 0) {
                            const [x_0_error, x_0_helper] = validateLayerDimensions({ layer: formElement, layers: elementParent[layerIndex - 1] });
                            if (x_0_error || validateLayer(formElement)) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                }
            }
            else {
                var errorArray = []
                for (var key in formElement) {
                    errorArray.push(validateForm({ formElement: formElement[key] }))
                }
                return errorArray.includes(true)
            }
        default:
            //console.log("Error: Invalid formElement.")
            console.log("default: formElement.constructor.name: ", formElement.constructor.name)
            break;
    }
}
export const validateField = ({ key, setFormState }) => {
    setFormState((prevForm) => {
        return produce(prevForm, (draft) => {
            if (draft[key].required && draft[key].value == "") {
                draft[key].error = true
            }
            else {
                draft[key].error = false
            }
            if (draft[key].regex && draft[key].value) {
                if (!draft[key].regex.test(draft[key].value)) {
                    draft[key].error = true
                }
            }
        })
    })
}
export class Layer {
    constructor({ layer_type = 'Dense', activation = 'Linear', x_0 = '', x_1 = '', x_2 = '', x_3 = '', padding = '' } = {}) {
        this.id = uuidv4().slice(0, 8);
        this.layer_type = layer_type;
        this.x_0 = new Validation({ value: x_0, required: true, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.x_1 = new Validation({ value: x_1, required: true, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.x_2 = new Validation({ value: x_2, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.x_3 = new Validation({ value: x_3, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.padding = new Validation({ value: padding, regex: /^(?:0|[1-9]\d{0,2}|1000)$/, helper: "Please enter an integer from 0 to 1000." });
        this.activation = activation
        this.type = "Layer"
    }

}
export const validateLayerDimensions = (layer, prevLayer) => {
    var layer_error = layer.error;
    var layer_helper = layer.helper;
    if (prevLayer) {
        // console.log("prevLayer.x_1",prevLayer.x_1)
        // console.log("localLayer.x_0",localLayer.x_0)
        if (layer.layer_type != 'Pooling' && prevLayer.layer_type != 'Pooling') {
            if (layer.x_0.value != prevLayer.x_1.value) {
                // console.log("layer missmatch error!!!!")
                // console.log("localLayer.x_0: ", localLayer.x_0)
                layer_error = true
                layer_helper = "Input size must match output size of previous layer."
            }
            else {
                layer_error = false
                // console.log("1NO layer missmatch error!!!!")
                // draft.x_0.helper = "Please enter an integer from 0 to 1000."
            }
        }
        else {
            layer_error = false
            // console.log("2NO layer missmatch error!!!!")
            layer_helper = "Please enter an integer from 0 to 1000."
        }
    }
    else {
        layer_error = false
        // console.log("3NO layer missmatch error!!!!")
        layer_helper = "Please enter an integer from 0 to 1000."
    }
    return [layer_error, layer_helper];
}

export const validateLayer = (layer) => {
    console.log("validateLayer(): ", layer)
    var layerValidation = [layer.x_0.error,
    layer.x_1.error,
    layer.x_2.error,
    layer.x_3.error,
    layer.padding.error].includes(true);

    return layerValidation
}
export const validateValidator = (validator) => {
    let validatorError = false
    if (validator.required && validator.value == "") {
        console.log("validator.value required but not provided")
        validatorError = true
    }
    else {
        validatorError = false
    }
    if (validator.regex && validator.value) {
        if (!validator.regex.test(validator.value)) {
            console.log("validator value does not meet requirements: ", validator.value)
            validatorError = true
        }
    }
    return validatorError
}
export class Validation {
    constructor({ value = "", error = false, regex = "", required = false, helper = "" } = {}) {
        this.value = value;
        this.error = error;
        this.regex = regex;
        this.required = required;
        this.helper = helper;
        this.type = "Validation";
    }
}