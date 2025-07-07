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

function TrainingSessionCard({ session, models, chartData, setChartData}) {
    const isRunVisible = (runId) => chartData.some(run => run.runId === runId)
    const handleGraphClick = (event) => {
        const runId = event.currentTarget.getAttribute("data-run-id")

        console.log("data-run-id: ", runId)
        let wasPresent = false
        setChartData((prevChartData) => {
            const newChartData = prevChartData.filter((run) => {
                if (run.runId === runId) {
                    wasPresent = true;
                    return false; // remove this run
                }
                return true;
            });

            if (!wasPresent) {
                appendData(`/training_metrics/${runId}`, setChartData);
            }

            return newChartData;
        });

    }
    function modelIdToColor(modelId) {
        const hash = Array.from(modelId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;  // wrap around color wheel
        return `hsl(${hue}, 70%, 70%)`;  // adjust saturation/lightness for pastel feel
    }

    return (
        <ListItem key={session.id}>
            <Card sx={{ backgroundColor: "primary", variant: "outlined", padding: "5px" }}>
                <IconButton aria-label="graph" data-run-id={session.id} color="primary"
                    onClick={(event) => { handleGraphClick(event) }
                    }>
                    {isRunVisible(session.id)
                        ? <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: "8px", padding: "5px", bgcolor: `hsl(${chartData.findIndex((option) => (option.runId === session.id)) * 60}, 65%, 70%)` }}><TrendingDownIcon sx={{ borderLeft: 1, borderBottom: 1, color: "white" }} /></Box>
                        : <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: "8px", padding: "5px", bgcolor: "white" }}><TrendingDownOutlinedIcon sx={{ marginBottom: 0, borderLeft: 1, borderBottom: 1 }} color="primary" /></Box>
                    }
                </IconButton>
                <Typography>Run ID: {session.id}</Typography>
                <Box sx={{ backgroundColor: modelIdToColor(session.model_id) }}>
                    <Typography>
                        Model name: {models.length > 0 ? models.find((option) => option.value === session.model_id).modelName : null}
                    </Typography>
                    <Typography>
                        Model id: {session.model_id}
                    </Typography>

                </Box>
                <Typography>
                    Epochs: {session.epochs}
                </Typography>
                <Typography>
                    Batch size: {session.batch_size}
                </Typography><Typography>
                    Loss function: {session.loss_function}
                </Typography>
                <Typography>Base checkpoint: {session.checkpoint}</Typography>
                <Typography>Split: <b>{session.split}</b></Typography>
                {session.optimiser ? <Typography>Optimiser: {session.optimiser}</Typography> : null}
                {session.cv_dataset ? <Typography>CV Dataset: {session.cv_dataset}</Typography> : null}
                {session.test_dataset ? <Typography>Test Dataset: {session.test_dataset}</Typography> : null}
                {session.training_dataset ? <Typography>Training Dataset: {session.training_dataset}</Typography> : null}
            </Card>
        </ListItem>
    )
}

export default TrainingSessionCard