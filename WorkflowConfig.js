import React, { useState, useCallback } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { generateConfig } from './generateConfig';

const WorkflowConfig = ({ nodes, edges, onImport }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');

  const handleGenerateConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const config = generateConfig(appName, appDescription, nodes, edges);
      
      // Make API POST request
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-workflow.zip';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appName, appDescription, nodes, edges]);

  const handleImportConfig = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        onImport(config);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  }, [onImport]);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="App Name"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
        variant="outlined"
        size="small"
      />
      <TextField
        fullWidth
        label="App Description"
        value={appDescription}
        onChange={(e) => setAppDescription(e.target.value)}
        variant="outlined"
        size="small"
        multiline
        rows={2}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleGenerateConfig}
        disabled={isLoading}
        sx={{
          background: 'linear-gradient(90deg, #a084e8 0%, #7B68EE 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #7B68EE 0%, #a084e8 100%)',
          },
        }}
      >
        {isLoading ? 'Generating...' : 'Export Configuration'}
      </Button>
      <Button
        variant="outlined"
        fullWidth
        component="label"
        sx={{
          borderColor: '#7B68EE',
          color: '#7B68EE',
          '&:hover': {
            borderColor: '#a084e8',
            backgroundColor: 'rgba(123, 104, 238, 0.05)',
          },
        }}
      >
        Import Configuration
        <input
          type="file"
          hidden
          accept=".json"
          onChange={handleImportConfig}
        />
      </Button>
    </Box>
  );
};

export default WorkflowConfig; 
