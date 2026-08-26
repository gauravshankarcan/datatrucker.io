/*
 * Admin Portal — environment configs, secrets, connections, RBAC, deployment
 * Builder: Gaurav Shankar <gauravshankar.can@gmail.com>
 */
import React, { useState } from 'react';
import {
  Paper, Typography, Tabs, Tab, Box, TextField, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  Switch, FormControlLabel, Chip, Grid, Card, CardContent,
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import SecurityIcon from '@material-ui/icons/Security';
import SettingsIcon from '@material-ui/icons/Settings';
import CloudIcon from '@material-ui/icons/Cloud';

function TabPanel({ children, value, index }) {
  return value === index ? <Box p={3}>{children}</Box> : null;
}

export default function AdminPortal() {
  const [tab, setTab] = useState(0);
  const [envConfig, setEnvConfig] = useState({
    apiPort: '8080',
    uiPort: '9080',
    logLevel: 'info',
    keycloakEnabled: true,
    compressionThreshold: '2048',
    requestTimeout: '30',
  });
  const [rbacRoles, setRbacRoles] = useState([
    { name: 'admin', permissions: ['read', 'write', 'delete', 'deploy'], users: 2 },
    { name: 'developer', permissions: ['read', 'write'], users: 5 },
    { name: 'viewer', permissions: ['read'], users: 12 },
  ]);
  const [connections, setConnections] = useState([
    { name: 'primary-postgres', type: 'PostgreSQL', host: 'postgres:5432', status: 'connected' },
    { name: 'cache-redis', type: 'Redis', host: 'redis:6379', status: 'connected' },
    { name: 'iam-keycloak', type: 'Keycloak', host: 'keycloak:8080', status: 'connected' },
  ]);
  const [deployConfig, setDeployConfig] = useState({
    replicas: '2',
    imageTag: '2.1.0',
    registry: 'quay.io/datatrucker',
    namespace: 'datatrucker',
  });

  return (
    <Paper style={{ padding: 0 }}>
      <Box p={3} pb={0}>
        <Typography variant="h5" gutterBottom>Admin Portal</Typography>
        <Typography variant="body2" color="textSecondary">
          Manage environment configuration, secrets, connections, RBAC, and deployment settings.
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary">
        <Tab icon={<SettingsIcon />} label="Environment" />
        <Tab icon={<SecurityIcon />} label="RBAC" />
        <Tab icon={<CloudIcon />} label="Connections" />
        <Tab icon={<CloudIcon />} label="Deployment" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField fullWidth label="API Port" value={envConfig.apiPort}
              onChange={(e) => setEnvConfig({ ...envConfig, apiPort: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="UI Port" value={envConfig.uiPort}
              onChange={(e) => setEnvConfig({ ...envConfig, uiPort: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Log Level" value={envConfig.logLevel}
              onChange={(e) => setEnvConfig({ ...envConfig, logLevel: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Compression Threshold (bytes)" value={envConfig.compressionThreshold}
              onChange={(e) => setEnvConfig({ ...envConfig, compressionThreshold: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={envConfig.keycloakEnabled}
                onChange={(e) => setEnvConfig({ ...envConfig, keycloakEnabled: e.target.checked })} />}
              label="Keycloak IAM Enabled"
            />
          </Grid>
        </Grid>
        <Button startIcon={<SaveIcon />} color="primary" style={{ marginTop: 16 }}>Save Configuration</Button>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Users</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rbacRoles.map((role) => (
              <TableRow key={role.name}>
                <TableCell><strong>{role.name}</strong></TableCell>
                <TableCell>
                  {role.permissions.map((p) => <Chip key={p} label={p} size="small" style={{ margin: 2 }} />)}
                </TableCell>
                <TableCell>{role.users}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          {connections.map((conn) => (
            <Grid item xs={4} key={conn.name}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">{conn.name}</Typography>
                  <Typography variant="caption" color="textSecondary">{conn.type} · {conn.host}</Typography>
                  <Chip label={conn.status} size="small" color="primary" style={{ marginTop: 8 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField fullWidth label="Replicas" value={deployConfig.replicas}
              onChange={(e) => setDeployConfig({ ...deployConfig, replicas: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Image Tag" value={deployConfig.imageTag}
              onChange={(e) => setDeployConfig({ ...deployConfig, imageTag: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Registry" value={deployConfig.registry}
              onChange={(e) => setDeployConfig({ ...deployConfig, registry: e.target.value })} margin="normal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Namespace" value={deployConfig.namespace}
              onChange={(e) => setDeployConfig({ ...deployConfig, namespace: e.target.value })} margin="normal" />
          </Grid>
        </Grid>
        <Button startIcon={<SaveIcon />} color="primary" style={{ marginTop: 16 }}>Apply Deployment</Button>
      </TabPanel>
    </Paper>
  );
}
