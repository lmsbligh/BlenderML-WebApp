const fetchData = (endpoint, setState) => {
    fetch(endpoint)
        .then(response => response.json())
        .then (data => {
            setState(data)
        })
        .catch(error => console.error('Error fetching data:', error))
}

export default fetchData