import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Grid, FormHelperText, IconButton } from '@mui/material/';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



function SessionAnalysis(session) {
    return (

        <>
            <Typography>Training Session Analysis</Typography>
            <List dense>
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
                                Model name: {modelData.length > 0 ? modelData.find((option) => option.value === session.model_id).modelName : null}
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
            </List>
        </>
    )
}

export default SessionAnalysis