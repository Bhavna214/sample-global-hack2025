import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import { Handle, Position, useReactFlow } from 'reactflow';
import './CustomNode.css';

const nodeColors = {
  file: 'file-node',
  pdfLoader: 'pdf-loader-node',
  csvLoader: 'csv-loader-node',
  parser: 'parser-node',
  prompt: 'prompt-node',
  openai: 'openai-node',
  chatinput: 'chatinput-node',
  chatoutput: 'chatoutput-node',
  default: 'default-node',
};

const nodeIcons = {
  file: '📁',
  pdfLoader: '📄',
  csvLoader: '🧾',
  parser: '{}',
  prompt: '📝',
  openai: '🧠',
  chatinput: '💬',
  chatoutput: '💬',
  default: '⚙️',
};

export default function CustomNode({ data, type, id }) {
  const { setNodes } = useReactFlow();
  const [file, setFile] = useState(null);
  const colorClass = nodeColors[type] || nodeColors.default;
  const icon = nodeIcons[type] || nodeIcons.default;

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    // Update node data with file information
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              fields: node.data.fields.map((field) => {
                if (field.label.toLowerCase().includes('file')) {
                  return {
                    ...field,
                    value: uploadedFile,
                    type: 'file'
                  };
                }
                return field;
              }),
            },
          };
        }
        return node;
      })
    );
  };

  const handleFieldChange = (fieldIndex, newValue) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          const updatedFields = [...node.data.fields];
          updatedFields[fieldIndex] = {
            ...updatedFields[fieldIndex],
            value: newValue
          };
          return {
            ...node,
            data: {
              ...node.data,
              fields: updatedFields
            }
          };
        }
        return node;
      })
    );
  };

  return (
    <div className={`custom-node ${colorClass}`}>
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="custom-node-handle left" />
      <Handle type="source" position={Position.Right} className="custom-node-handle right" />

      {/* Header */}
      <div className="custom-node-header">
        <span className="custom-node-icon">{icon}</span>
        <Typography variant="subtitle1" className="custom-node-title">
          {data.title || (type.charAt(0).toUpperCase() + type.slice(1))}
        </Typography>
      </div>
      {/* Description */}
      {data.description && (
        <Typography variant="body2" className="custom-node-description">
          {data.description}
        </Typography>
      )}
      {/* Fields */}
      {type === 'pdfLoader' || type === 'csvLoader' ? (
        <label className="file-upload-area">
          <span className="file-upload-icon">{icon}</span>
          <span className="file-upload-text">
            {file ? file.name : `Click or drag ${type === 'pdfLoader' ? 'PDF' : 'CSV'} here to upload`}
          </span>
          <input
            type="file"
            accept={type === 'pdfLoader' ? '.pdf' : '.csv'}
            hidden
            onChange={handleFileUpload}
          />
        </label>
      ) : (
        data.fields && data.fields.map((field, idx) => (
          <div key={idx} className="custom-node-field">
            <Typography variant="caption" className="custom-node-field-label">
              {field.label}
            </Typography>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              value={field.value || ''}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              placeholder={field.placeholder}
              InputProps={{ readOnly: field.readOnly }}
              className="custom-node-textfield"
            />
          </div>
        ))
      )}
      {/* Action Button */}
      {data.button && (
        <Button
          variant="contained"
          fullWidth
          className="custom-node-action-btn"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          {data.button}
        </Button>
      )}
      {/* Divider for sections */}
      {data.divider && <Divider className="custom-node-divider" />}
    </div>
  );
} 
