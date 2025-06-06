import React from 'react';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import { Handle, Position } from 'reactflow';
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
  const colorClass = nodeColors[type] || nodeColors.default;
  const icon = nodeIcons[type] || nodeIcons.default;

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
      {type === 'pdfLoader' ? (
        <label className="pdf-upload-area">
          <span className="pdf-upload-icon">📄</span>
          <span className="pdf-upload-text">Click or drag PDF here to upload</span>
          <input type="file" accept=".pdf" hidden onChange={() => {}} />
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
              value={field.value}
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
        >
          {data.button}
        </Button>
      )}
      {/* Divider for sections */}
      {data.divider && <Divider className="custom-node-divider" />}
    </div>
  );
} 