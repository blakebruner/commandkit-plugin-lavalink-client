# CommandKit Plugin Lavalink Client

This is a CommandKit plugin that allows you to use commandkit's event system to listen to lavalink-client events.

## Installation

```bash
npm install commandkit-plugin-lavalink-client
```

## Usage

In your `commandkit.config.ts` file, the plugin like this:

```ts
import { defineConfig } from 'commandkit';
import { lavalinkClient } from 'commandkit-plugin-lavalink-client';

export default defineConfig({
  plugins: [ lavalinkClient() ],
});
```

Once your config is setup, you must add the LavalinkManager instance:

```ts
import { LavalinkManager } from 'lavalink-client';
import { setLavalinkManager } from 'commandkit-plugin-lavalink-client';

const lavalink = new LavalinkManager({
  // lavalink manager options here
});

setLavalinkManager(lavalink);
```

Your bot will now be able to use lavalink-client events and hooks.

## Options

The plugin accepts the following options:

- `lavalinkManagerNamespace`: The namespace for the LavalinkManagerEvents. Defaults to `lavalink-manager` (aka uses `(lavalink-manager)` folder).
- `nodeManagerNamespace`: The namespace for the NodeManagerEvents. Defaults to `node-manager` (aka uses `(node-manager)` folder).