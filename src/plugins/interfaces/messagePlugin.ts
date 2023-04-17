import { MessageEnv } from '../../message/types.js';

export interface MessagePlugin {
  messageDidReceive?: (env: MessageEnv) => void;
  messageWillSend?: (env: MessageEnv) => void;
}
