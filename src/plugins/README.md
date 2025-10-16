# Plugins

This directory contains Fastify plugins that extend the application's functionality.

## Creating a Plugin

Plugins should use `fastify-plugin` to ensure they are registered at the application level:

```typescript
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

const myPlugin: FastifyPluginAsync = async (fastify, options) => {
  // Plugin logic here
};

export default fp(myPlugin, {
  name: 'my-plugin',
});
```

## Available Plugins

- **env.ts** - Exposes validated environment variables via `fastify.config`
