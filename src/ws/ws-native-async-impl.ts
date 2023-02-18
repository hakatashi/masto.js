import type { MessageEvent } from 'isomorphic-ws';
import WebSocket from 'isomorphic-ws';

import type { mastodon } from '../mastodon';
import type { Serializer } from '../serializers';

type Resolver<T> = (resolve: IteratorResult<T, unknown>) => void;

export class WsNativeFactory {
  constructor(private readonly serializer: Serializer) {}

  create<Params>(
    connection: WebSocket,
    stream: string,
  ): WsNativeAsyncImpl<Params> {
    return new WsNativeAsyncImpl(connection, stream, this.serializer);
  }
}

export class WsNativeAsyncImpl<Params>
  implements AsyncIterableIterator<mastodon.v1.Event>
{
  constructor(
    private readonly connection: WebSocket,
    private readonly stream: string,
    private readonly serializer: Serializer,
  ) {}

  private readonly resolvers: Resolver<mastodon.v1.Event>[] = [];
  private readonly events: mastodon.v1.Event[] = [];

  subscribe(params?: Params): void {
    this.connection.send(
      this.serializer.serialize('application/json', {
        ...params,
        type: 'subscribe',
        stream: this.stream,
      }) as string,
    );

    this.connection.addEventListener('message', this.handleMessage);
  }

  unsubscribe(): void {
    this.connection.send(
      this.serializer.serialize('application/json', {
        type: 'unsubscribe',
        stream: this.stream,
      }) as string,
    );
  }

  next(): Promise<IteratorResult<mastodon.v1.Event>> {
    if (this.connection.readyState === WebSocket.CLOSED) {
      return Promise.resolve({ value: undefined, done: true });
    }

    const value = this.events.shift();

    if (value != undefined) {
      return Promise.resolve({
        value,
        done: false,
      });
    }

    return new Promise((resolve) => {
      this.resolvers.push(resolve);
    });
  }

  async return(
    value?: mastodon.v1.Event | PromiseLike<mastodon.v1.Event>,
  ): Promise<IteratorResult<mastodon.v1.Event>> {
    this.unsubscribe();
    return { value: await value, done: true };
  }

  throw(error: unknown): Promise<never> {
    this.unsubscribe();
    return Promise.reject(error);
  }

  [Symbol.asyncIterator](): this {
    return this;
  }

  private handleMessage = (message: MessageEvent): void => {
    const data = message.data as string;
    const raw = this.serializer.deserialize<mastodon.v1.RawEvent>(
      'application/json',
      data,
    );

    if (!raw.stream.includes(this.stream)) {
      return;
    }

    // https://github.com/neet/masto.js/issues/750
    if (raw.event === 'delete') {
      const resolve = this.resolvers.shift();
      if (resolve == undefined) {
        this.events.push(raw);
      } else {
        resolve({ value: raw, done: false });
      }
    }

    try {
      const payload = this.serializer.deserialize<mastodon.v1.Event['payload']>(
        'application/json',
        raw.payload,
      );

      const event = {
        stream: raw.stream,
        event: raw.event,
        payload,
      } as mastodon.v1.Event;

      const resolve = this.resolvers.shift();
      if (resolve == undefined) {
        this.events.push(event);
      } else {
        resolve({ value: event, done: false });
      }
    } catch (error) {
      throw new Error('Error', { cause: error });
    }
  };
}
