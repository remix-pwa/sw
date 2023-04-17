import { MessagePlugin } from '../plugins/interfaces/messagePlugin.js';
import { MessageEnv } from './types.js';

export abstract class MessageHandler {
  plugins: MessagePlugin[];
  state: MessageEnv;

  constructor(plugins: MessagePlugin[] = [], state: MessageEnv = {}) {
    this.plugins = plugins;
    this.state = state;
  }

  async handle(event: ExtendableMessageEvent, state: Record<string, any> = {}) {
    await this._handleMessage(event, state);
  }

  abstract _handleMessage(
    event: ExtendableMessageEvent,
    state: Record<string, any>
  ): Promise<void> | void;

  async runPlugins(hook: keyof MessagePlugin, env: MessageEnv) {
    for (const plugin of this.plugins) {
      if (plugin[hook]) {
        await plugin[hook]!(env);
      }
    }
  }
}
