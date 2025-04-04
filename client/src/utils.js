import produce from "immer";

export const fetchData = (endpoint, setState) => {
    fetch(endpoint)
        .then(response => response.json())
        .then (data => {
            setState(data)
        })
        .catch(error => console.error('Error fetching data:', error))
}

export const pushData = (endpoint, data) => {
    try {
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            title: 'title',
            body: JSON.stringify(data),
        })

    }
    catch (error) {
        console.error('Error:', error);
    }
}
export const handleSelectorFormChange = ({eve, setSelector, setForm, options}) => {
    if (options) {
        const option = options.find((option) => option.value === eve.target.value )
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

export const handleTextFieldChange = ({eve, setState}) => {
    setState((prevVals) => {
        return produce(prevVals, (draft) => {
            draft[eve.target.name].value = eve.target.value;
        })
    })
}

export const validateForm = (setForm) => {
    var formError = false
    setForm((prevForm) => {
        return produce(prevForm, (draft) => {
            for (var key in draft) {
                if (draft[key].required && draft[key].value == "") {
                    draft[key].error = true
                    formError = true
                }
                else {
                    draft[key].error = false
                }
                if (draft[key].regex && draft[key].value) {
                    if (!draft[key].regex.test(draft[key].value)) {
                        draft[key].error = true
                        formError = true
                    }
                }
            }
        })

    })
    console.log("formError: ", formError)
    return formError
}

export const validateField = ({key, setFormState}) => {
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