import React from 'react'
import GenerateMaterials from './pages/GenerateMaterials'
import DatasetGenerator from './pages/DatasetGenerator'
import CreateModifyModel from './pages/CreateModifyModel'
import Training from './pages/Training'
import Analysis from './pages/Analysis'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {CssBaseline, Box, Tabs, Tab, IconButton, Tooltip, Typography } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import getTheme from './theme';

const defaultTheme = createTheme();

function App() {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const [mode, setMode] = React.useState(() => localStorage.getItem("color-mode") || (prefersDark ? "dark" : "light"));
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const [selectedTab, setSelectedTab] = React.useState('GENERATE_MATERIALS');
  const handleSelectorPageChange = (event, newSelectedTab) => {
    setSelectedTab(newSelectedTab);
  };
  const availabeTabs = ['MODEL_SELECTION', 'CREATE_MODEL', 'TRAINING', 'GENERATE_MATERIALS']

  const [appData, setAppData] = React.useState([]);

  const toggleMode = () => {
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      localStorage.setItem("color-mode", next);
      return next;
    });
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%', 
          position: 'sticky',
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderBottomColor: "outline.paper",
          top: '0px',
          zIndex: 2,
          padding: '10px'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', pr: 1 }}>
            <Tooltip title={mode === "light" ? "Switch to dark" : "Switch to light"}>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Tabs
            value={selectedTab}
            onChange={handleSelectorPageChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="GENERATE_MATERIALS" label="Generate Materials" />
            <Tab value="CREATE_MODEL" label="Create Model" />
            <Tab value="TRAINING" label="Training" />
            <Tab value="ANALYSIS" label="Analysis" />
            <Tab value="DATASET_GENERATOR" label="Generate Dataset" />

          </Tabs>
          
        </Box>
        <Box sx={{ width: '100%', p: 1 }}>
          {(() => {
            switch (selectedTab) {
              case "DATASET_GENERATOR":
                return <DatasetGenerator />
              case "CREATE_MODEL":
                return <CreateModifyModel />;
              case "TRAINING":
                return <Training />;
              case "GENERATE_MATERIALS":
                return <GenerateMaterials />;
              case "ANALYSIS":
                return <Analysis />
              default:
                return <Typography>Default</Typography>;
            }
          })()
          }
        </Box>
    </ThemeProvider>
  )
}

export default App;
