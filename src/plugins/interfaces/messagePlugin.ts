import { MessageEnv } from '../../message/types.js';

/**
 * A plugin that can be used to modify the message environment
 */
export interface MessagePlugin {
  /**
   * A function that is called when a message is received
   */
  messageDidReceive?: (env: MessageEnv) => void;
  /**
   * A function that is called before a message is sent
   * or broadcasted back to the client
   */
  messageWillSend?: (env: MessageEnv) => void;
}
