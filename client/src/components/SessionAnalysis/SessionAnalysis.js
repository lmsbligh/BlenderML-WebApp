import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Grid, FormHelperText, IconButton } from '@mui/material/';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

import React from 'react';
import { appendData } from '../../utils';
import TrainingSessionCard from '../TrainingSessionCard/TrainingSessionCard';
import TrainingChart from '../TrainingChart/TrainingChart';
import TestChart from '../TestChart/TestChart';


function SessionAnalysis({ trainingSessions, modelData, split }) {

    const [chartData, setChartData] = React.useState([]);
    React.useEffect(() => {
        console.log("SessionAnalysis chartData changed to: ", chartData)
    }, [chartData])
    React.useEffect(() => {
        console.log("trainingSessions (SessionAnalysis): ", trainingSessions)
    }, [trainingSessions])
    const split_enum = split === "train" ? [split] : ["test", "CV"]

    const parseSessionId = (id) => {
        // converts session_id into date time object for sorting
        const [day, month, year, hourMin, second] = id.split(/[-]/);
        const hour = hourMin.slice(0, 2)
        const minute = hourMin.slice(2, 4)
        const dateObj = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        return dateObj
    }
    return (

        <>
            <Typography>{split === "train" ? "Training" : "Test"} Session Analysis</Typography>
            {chartData.length > 0 ? split === "train" ? <TrainingChart data={chartData} /> : <TestChart data={chartData} /> : null}
            {
                trainingSessions ?
                    trainingSessions.filter((session) => (split_enum.includes(session.split)))
                        .sort((a, b) => parseSessionId(b.session_id) - parseSessionId(a.session_id)).map((session, i) => (
                            <TrainingSessionCard key={session.id}session={session} models={modelData ? modelData : null} chartData={chartData} setChartData={setChartData} />
                        ))
                    :
                    null
            }
        </>
    )
}

export default SessionAnalysis