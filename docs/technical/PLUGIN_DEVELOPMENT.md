# Plugin Development Guide

## Creating a Custom Plugin

Plugins extend DataTrucker's job execution engine. Each plugin registers with the Fastify instance in `datatrucker_api/app/plugins/`.

## Plugin Structure

```javascript
const fp = require('fastify-plugin');

async function myPlugin(fastify, options) {
  fastify.decorate('myPlugin', {
    async execute(context, config) {
      // Business logic here
      return { result: 'success' };
    }
  });
}

module.exports = fp(myPlugin, { name: 'my-plugin' });
```

## Registration

Enable in `server.config.json`:

```json
{
  "pluginsEnable": {
    "MyPlugin": true
  }
}
```

## Job Definition Reference

```yaml
- name: my-job
  type: My-Plugin
  tenant: Admin
  restmethod: POST
  path: /api/v1/custom/endpoint
  validations:
    type: object
    required: [field]
    properties:
      field:
        type: string
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
