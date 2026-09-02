/*
 * Visual Workflow Builder — node-based pipeline canvas
 * Gaurav Shankar
 */
import React, { useState, useCallback } from 'react';
import {
  Paper, Typography, Button, Grid, Card, CardContent,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Box,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import LinkIcon from '@material-ui/icons/Link';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

const PLUGIN_TYPES = [
  'Util-Echo', 'DB-Postgres', 'DB-MySQL', 'IOT-Redis', 'IOT-Kafka',
  'Script-JS', 'File-SFTP', 'Script-SSH', 'Script-Shell', 'Util-Sentiment',
];

const NODE_COLORS = {
  input: '#2563EB',
  transform: '#7C3AED',
  output: '#10B981',
  condition: '#F59E0B',
};

function WorkflowNode({ node, onDelete, onConnect, isSelected, onSelect }) {
  const color = NODE_COLORS[node.category] || '#64748B';
  return (
    <Card
      style={{
        border: isSelected ? `2px solid ${color}` : '1px solid #E2E8F0',
        cursor: 'pointer',
        minWidth: 180,
        margin: 8,
      }}
      onClick={() => onSelect(node.id)}
    >
      <CardContent style={{ padding: 12 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip size="small" label={node.category} style={{ backgroundColor: color, color: '#fff', fontSize: 10 }} />
          <Box>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onConnect(node.id); }}>
              <LinkIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="subtitle2" style={{ marginTop: 8, fontWeight: 600 }}>
          {node.label}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {node.type} · {node.restmethod} {node.path || ''}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState([
    { id: '1', label: 'Health Check', type: 'Util-Echo', category: 'input', restmethod: 'GET', path: '/api/v1/statuschecks/healthcheck' },
    { id: '2', label: 'Process Data', type: 'Script-JS', category: 'transform', restmethod: 'POST', path: '/api/v1/jobs/process' },
    { id: '3', label: 'Store Result', type: 'DB-Postgres', category: 'output', restmethod: 'POST', path: '/api/v1/jobs/store' },
  ]);
  const [connections, setConnections] = useState([
    { from: '1', to: '2' },
    { from: '2', to: '3' },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNode, setNewNode] = useState({ label: '', type: 'Util-Echo', category: 'transform', restmethod: 'POST', path: '' });
  const [connectingFrom, setConnectingFrom] = useState(null);

  const addNode = () => {
    const id = String(Date.now());
    setNodes([...nodes, { ...newNode, id }]);
    setDialogOpen(false);
    setNewNode({ label: '', type: 'Util-Echo', category: 'transform', restmethod: 'POST', path: '' });
  };

  const deleteNode = (id) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setConnections(connections.filter((c) => c.from !== id && c.to !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleConnect = (fromId) => {
    if (connectingFrom && connectingFrom !== fromId) {
      setConnections([...connections, { from: connectingFrom, to: fromId }]);
      setConnectingFrom(null);
    } else {
      setConnectingFrom(fromId);
    }
  };

  const exportPipeline = () => {
    const pipeline = {
      JobDefinitions: nodes.map((n) => ({
        name: n.label.toLowerCase().replace(/\s+/g, '-'),
        type: n.type,
        tenant: 'Admin',
        restmethod: n.restmethod,
        path: n.path || undefined,
      })),
      connections,
    };
    const blob = new Blob([JSON.stringify(pipeline, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datatrucker-pipeline.json';
    a.click();
  };

  return (
    <Paper style={{ padding: 24, minHeight: 600 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Workflow Builder</Typography>
        <Box>
          <Button startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} color="primary" style={{ marginRight: 8 }}>
            Add Node
          </Button>
          <Button startIcon={<PlayArrowIcon />} onClick={exportPipeline} variant="outlined" color="primary">
            Export Pipeline
          </Button>
        </Box>
      </Box>

      {connectingFrom && (
        <Chip label={`Connecting from node ${connectingFrom} — click target node`} color="secondary" style={{ marginBottom: 16 }} />
      )}

      <Grid container spacing={2}>
        {['input', 'transform', 'output', 'condition'].map((cat) => (
          <Grid item xs={3} key={cat}>
            <Typography variant="overline" color="textSecondary" style={{ display: 'block', marginBottom: 8 }}>
              {cat.toUpperCase()}
            </Typography>
            {nodes.filter((n) => n.category === cat).map((node) => (
              <WorkflowNode
                key={node.id}
                node={node}
                onDelete={deleteNode}
                onConnect={handleConnect}
                isSelected={selectedId === node.id}
                onSelect={setSelectedId}
              />
            ))}
          </Grid>
        ))}
      </Grid>

      {connections.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>Connections</Typography>
          {connections.map((c, i) => (
            <Chip key={i} label={`${c.from} → ${c.to}`} size="small" style={{ margin: 4 }} variant="outlined" />
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Pipeline Node</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Label" value={newNode.label} onChange={(e) => setNewNode({ ...newNode, label: e.target.value })} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Plugin Type</InputLabel>
            <Select value={newNode.type} onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}>
              {PLUGIN_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select value={newNode.category} onChange={(e) => setNewNode({ ...newNode, category: e.target.value })}>
              <MenuItem value="input">Input</MenuItem>
              <MenuItem value="transform">Transform</MenuItem>
              <MenuItem value="output">Output</MenuItem>
              <MenuItem value="condition">Condition</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="REST Method" value={newNode.restmethod} onChange={(e) => setNewNode({ ...newNode, restmethod: e.target.value })} margin="normal" />
          <TextField fullWidth label="Path" value={newNode.path} onChange={(e) => setNewNode({ ...newNode, path: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={addNode} color="primary" disabled={!newNode.label}>Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
