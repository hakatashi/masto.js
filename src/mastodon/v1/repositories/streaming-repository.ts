import type WebSocket from 'isomorphic-ws';

import type { MastoConfig } from '../../../config';
import type { Logger } from '../../../logger';
import type {
  WsNativeAsyncImpl,
  WsNativeFactory,
} from '../../../ws/ws-native-async-impl';

export class StreamingRepository {
  constructor(
    private readonly wsFactory: WsNativeFactory,
    readonly config: MastoConfig,
    readonly logger?: Logger,
  ) {}

  streamPublic(connection: WebSocket): WsNativeAsyncImpl<undefined> {
    const ws = this.wsFactory.create<undefined>(connection, 'public');
    ws.subscribe();
    return ws;
  }
}
