import produce from "immer";
export const fetchData = (endpoint, setState) => {
    fetch(endpoint)
        .then(response => response.json())
        .then (data => {
            setState(data)
        })
        .catch(error => console.error('Error fetching data:', error))
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
            draft[selectLabel] = eve.target.value;
        })
    })
}
