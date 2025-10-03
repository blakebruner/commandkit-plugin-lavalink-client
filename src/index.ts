import {
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
} from 'commandkit';
import { LavalinkManagerEvents } from 'lavalink-client';

export interface LavalinkClientPluginOptions {
  /**
   * Namespace for queue events.
   * @default 'lavalink-manager'
   */
  lavalinkManagerNamespace?: string;
  /**
   * Namespace for player events.
   * @default 'node-manager'
   */
  nodeManagerNamespace?: string;
}

export const LL_EVENT_NAMES = [
  'playerCreate','playerDestroy','playerMove','playerUpdate',
  'trackStart','trackEnd','trackStuck','trackError','queueEnd','debug'
] as const satisfies readonly (keyof LavalinkManagerEvents)[];

const LL_QUEUE_EVENTS = 'lavalink-manager';
const LL_PLAYER_EVENTS = 'node-manager';

export class LavalinkClientPlugin extends RuntimePlugin<LavalinkClientPluginOptions> {
  public readonly name = 'LavalinkClientPlugin';

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    Logger.info('LavalinkClientPlugin activated');

    if (ctx.commandkit.client.isReady()) {
      // lavalink.init({ ...client.user });
      this.initialize(ctx);
    } else {
      ctx.commandkit.client.once('ready', () => {
        this.initialize(ctx);
      });
    }
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    Logger.info('LavalinkClientPlugin deactivated');
  }

  private initialize(ctx: CommandKitPluginRuntime) {

    LL_EVENT_NAMES.forEach((event) => {
      ctx.commandkit.client.lavalink!.on(event, (...args: any[]) => {
        ctx.commandkit.events
          .to(this.options.lavalinkManagerNamespace!)
          .emit(event, ...args);
      });
    });

    // playerEvents.forEach((event) => {
    //   player.on(event, (...args: any[]) => {
    //     ctx.commandkit.events
    //       .to(this.options.playerEventsNamespace!)
    //       .emit(event, ...args);
    //   });
    // });
  }
}

export function lavalinkClient(options?: LavalinkClientPluginOptions) {
  return new LavalinkClientPlugin({
    lavalinkManagerNamespace: options?.lavalinkManagerNamespace ?? LL_PLAYER_EVENTS,
    nodeManagerNamespace: options?.nodeManagerNamespace ?? LL_QUEUE_EVENTS,
  });
}