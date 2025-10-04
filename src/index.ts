import {
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
} from 'commandkit';
import { LavalinkManager, LavalinkManagerEvents, NodeManagerEvents } from 'lavalink-client';

export interface LavalinkClientPluginOptions {
  /**
   * Namespace for lavalink manager.
   * @default 'lavalink-manager'
   */
  lavalinkManagerNamespace?: string;
  /**
   * Namespace for node events.
   * @default 'node-manager'
   */
  nodeManagerNamespace?: string;
}

export const LL_EVENT_NAMES = [
  'playerCreate','playerDestroy','playerMove','playerUpdate',
  'trackStart','trackEnd','trackStuck','trackError','queueEnd','debug'
] as const satisfies readonly (keyof LavalinkManagerEvents)[];

export const NODE_EVENT_NAMES = [
  'create', 'destroy', 'connect', 'reconnecting', 'reconnectinprogress', 'disconnect', 'error', 'raw', 'resumed'
] as const satisfies readonly (keyof NodeManagerEvents)[];


const LL_MANAGER_EVENTS = 'lavalink-manager';
const LL_NODE_EVENTS = 'node-manager';

let lavalink: LavalinkManager | null = null;

export function setLavalinkManager(manager: LavalinkManager) {
  lavalink = manager;
}

export function getLavalinkManager(): LavalinkManager {
  if (!lavalink) {
    throw new Error('LavalinkManager is not set. Please set it using setLavalinkManager().');
  }

  return lavalink;
}

export class LavalinkClientPlugin extends RuntimePlugin<LavalinkClientPluginOptions> {
  public readonly name = 'LavalinkClientPlugin';

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    Logger.info('LavalinkClientPlugin activated');

    if (!lavalink) {
      throw new Error('LavalinkManager is not set. Please set it using setLavalinkManager().');
    }

    if (ctx.commandkit.client.isReady()) {
      this.initialize(ctx);
    } else {
      ctx.commandkit.client.once('ready', () => {
        this.initialize(ctx);
      });
    }
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    Logger.info('LavalinkClientPlugin deactivated');
    lavalink = null;
  }

  private initialize(ctx: CommandKitPluginRuntime) {
    const client = ctx.commandkit.client;
    if (!client.isReady()) {
      throw new Error('LavalinkManagerPlugin initialization failed: Client is not ready.');
    }

    LL_EVENT_NAMES.forEach((event) => {
      lavalink!.on(event, (...args: any[]) => {
        ctx.commandkit.events
          .to(this.options.lavalinkManagerNamespace!)
          .emit(event, ...args);
      });
    });

    NODE_EVENT_NAMES.forEach((event) => {
      lavalink!.nodeManager.on(event, (...args: any[]) => {
        ctx.commandkit.events
          .to(this.options.nodeManagerNamespace!)
          .emit(event, ...args);
      });
    });

    ctx.commandkit.client.on("raw", d => lavalink!.sendRawData(d));
    lavalink!.init({ ...client.user });
  }
}

export function lavalinkClient(options?: LavalinkClientPluginOptions) {
  return new LavalinkClientPlugin({
    lavalinkManagerNamespace: options?.lavalinkManagerNamespace ?? LL_MANAGER_EVENTS,
    nodeManagerNamespace: options?.nodeManagerNamespace ?? LL_NODE_EVENTS,
  });
}