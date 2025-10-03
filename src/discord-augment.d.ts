import 'discord.js';
import type { LavalinkManager } from 'lavalink-client';

declare module 'discord.js' {
  interface Client {
    lavalink?: LavalinkManager;
  }
}
