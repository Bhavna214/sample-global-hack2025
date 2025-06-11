import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Paper, Typography, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import ReactFlow, { Background, Controls, Edge, Node, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode.js';
import { generateConfig } from './generateConfig';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7B68EE' },
    background: { default: '#0F0F1A', paper: '#1A1A2E' },
  },
});

const nodeTypes = [
  { type: 'loaders', label: 'Loaders', icon: '📁', children: [
    { type: 'pdfLoader', label: 'PDF Loader', icon: '📄' },
    { type: 'csvLoader', label: 'CSV Loader', icon: '🧾' },
  ] },
  { type: 'parser', label: 'Parser', icon: '{}' },
  { type: 'prompt', label: 'Prompt', icon: '📝' },
  { type: 'openai', label: 'OpenAI', icon: '🧠' },
  { type: 'chatinput', label: 'Chat Input', icon: '💬' },
  { type: 'chatoutput', label: 'Chat Output', icon: '💬' },
];

const nodeTemplates = {
  pdfLoader: {
    title: 'PDF Loader',
    description: 'Load a PDF file to be used in your project.',
    button: 'Select PDF',
    fields: [
      { label: 'PDF File', value: '', placeholder: '', readOnly: true },
    ],
    divider: true,
  },
  csvLoader: {
    title: 'CSV Loader',
    description: 'Load a CSV file to be used in your project.',
    button: 'Select CSV',
    fields: [
      { label: 'CSV File', value: '', placeholder: '', readOnly: true },
    ],
    divider: true,
  },
};

const initialNodes = [];

const initialEdges = [];

const nodeTypesMap = {
  pdfLoader: CustomNode,
  csvLoader: CustomNode,
};

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [loadersOpen, setLoadersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

    const generateConfiguration = useCallback(() => {
    const config = generateConfig(nodes, edges);
    console.log('Generated Configuration:', config);
    return config;
  }, [nodes, edges]);

  const handleGenerateConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const config = generateConfiguration();
      
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
      link.download = 'generated-workflow.zip'; // Name of the downloaded file
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  }, [generateConfiguration]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !nodeTemplates[type]) return;
      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };
      const newNode = {
        id: `${nodes.length + 1}`,
        type,
        position,
        data: { ...nodeTemplates[type] },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [nodes]
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="app-root">
        {/* Sidebar */}
        <Paper elevation={0} className="sidebar">
          <Typography variant="h6" className="sidebar-title">
            Node Types
          </Typography>
          <List>
            {/* Loaders expandable item */}
            <ListItem
              key="loaders"
              button
              onClick={() => setLoadersOpen((open) => !open)}
              className="sidebar-listitem sidebar-listitem-expandable"
            >
              <span className="sidebar-listitem-icon">📁</span>
              <ListItemText primary="Loaders" className="sidebar-listitem-text" />
              <Typography className="sidebar-listitem-expandicon">
                {loadersOpen ? '−' : '+'}
              </Typography>
            </ListItem>
            {loadersOpen && (
              <div className="sidebar-sublist">
                <ListItem
                  key="pdfLoader"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', 'pdfLoader');
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  className="sidebar-listitem"
                >
                  <span className="sidebar-listitem-icon">📄</span>
                  <ListItemText primary="PDF Loader" className="sidebar-listitem-text" />
                </ListItem>
                <ListItem
                  key="csvLoader"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', 'csvLoader');
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  className="sidebar-listitem"
                >
                  <span className="sidebar-listitem-icon">🧾</span>
                  <ListItemText primary="CSV Loader" className="sidebar-listitem-text" />
                </ListItem>
              </div>
            )}
            {/* Render other node types */}
            {nodeTypes.filter((node) => node.type !== 'loaders').map((node) => (
              <ListItem
                key={node.type}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', node.type);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                className="sidebar-listitem"
              >
                <span className="sidebar-listitem-icon">{node.icon}</span>
                <ListItemText primary={node.label} className="sidebar-listitem-text" />
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            fullWidth
            onClick={handleGenerateConfig}
            disabled={isLoading}
            sx={{
              mt: 2,
              background: 'linear-gradient(90deg, #a084e8 0%, #7B68EE 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #7B68EE 0%, #a084e8 100%)',
              },
            }}
          >
            {isLoading ? 'Generating...' : 'Export Configuration'}
          </Button>
        </Paper>
        {/* Main Flow Area */}
        <Box className="main-flow-area">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            nodeTypes={nodeTypesMap}
            style={{ background: 'transparent' }}
          >
            <Background color="rgba(123, 104, 238, 0.1)" gap={24} size={1} style={{ opacity: 0.2 }} />
            <Controls />
          </ReactFlow>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App; 
