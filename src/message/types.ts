/**
 * @fileoverview Global typings for `message` sub-module
 */

export interface MessageEnv {
  event?: ExtendableMessageEvent;
  state?: Record<string, any>;
}
