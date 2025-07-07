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


function SessionAnalysis({trainingSessions, modelData}) {

    const [chartData, setChartData] = React.useState([]);
    React.useEffect(()=>{
        console.log("SessionAnalysis chartData changed to: ", chartData)
    }, [chartData])

    return (

        <>
                <Typography>Training Session Analysis</Typography>
                {chartData.length > 0 ? <TrainingChart data={chartData}/> : null}
                {trainingSessions ? trainingSessions.filter((session) => (session.split === "train")).map((session, i) => (
                        <TrainingSessionCard session={session} models={modelData ? modelData : null} chartData={chartData} setChartData={setChartData} />
                    )) : null}
        </>
    )
}

export default SessionAnalysis