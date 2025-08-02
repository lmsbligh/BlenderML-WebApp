import React from 'react'
import GenerateMaterials from './pages/GenerateMaterials'
import DatasetGenerator from './pages/DatasetGenerator'
import CreateModifyModel from './pages/CreateModifyModel'
import Training from './pages/Training'
import { createTheme, ThemeProvider } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

const defaultTheme = createTheme();

function App() {

  const [selectedTab, setSelectedTab] = React.useState('GENERATE_MATERIALS');
  const handleSelectorPageChange = (event, newSelectedTab) => {
    setSelectedTab(newSelectedTab);
  };
  const availabeTabs = ['MODEL_SELECTION', 'CREATE_MODEL', 'TRAINING', 'GENERATE_MATERIALS']

  const [appData, setAppData] = React.useState([]);


  return (
    <div>
      <Box sx={{
        width: '100%', position: 'sticky',
        top: '0px', // distance from the top of the viewport
        zIndex: 2,
        backgroundColor: 'white', // helps avoid content bleed
        padding: '10px'
      }}>
        <Tabs
          value={selectedTab}
          onChange={handleSelectorPageChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
        >
          <Tab value="GENERATE_MATERIALS" label="Generate Materials" />
          <Tab value="CREATE_MODEL" label="Create Model" />
          <Tab value="TRAINING" label="Training" />
          <Tab value="DATASET_GENERATOR" label="Generate Dataset" />

        </Tabs>
      </Box>
      <Box sx={{ width: '100%', p: 1 }}>
        <ThemeProvider theme={defaultTheme}>
          <CssBaseline />
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
              default:
                return <Typography>Default</Typography>;
            }
          })()
          }
        </ThemeProvider>
      </Box>
    </div>
  )
}

export default App;
