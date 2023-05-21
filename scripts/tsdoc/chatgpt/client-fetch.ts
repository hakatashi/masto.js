import type {
  ChatParameters,
  ChatParametersStream,
  ChatParametersSync,
  Client,
} from './client';
import type { Completion, CompletionChunk } from './entities';
import { ClientHttpUnexpectedError } from './error';

const pattern = /data:\s(.+)/;
const DONE_TOKEN = '[DONE]';

export class ClientFetch implements Client {
  constructor(
    private readonly apiKey: string,
    private readonly organizationId?: string,
  ) {}

  chat(parameters: ChatParametersSync): Promise<Completion>;
  chat(parameters: ChatParametersStream): AsyncIterable<CompletionChunk>;
  chat(
    parameters: ChatParameters,
  ): Promise<Completion> | AsyncIterable<CompletionChunk> {
    return parameters.stream
      ? this.chatAsync(parameters)
      : this.chatSync(parameters);
  }

  private async chatSync(parameters: ChatParametersSync): Promise<Completion> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'OpenAI-Organization': this.organizationId ?? '',
      },
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new ClientHttpUnexpectedError(error, response);
      } catch {
        throw new ClientHttpUnexpectedError(
          'Unexpected error occurred',
          response,
        );
      }
    }

    const data = (await response.json()) as Completion;
    return data;
  }

  private async *chatAsync(
    parameters: ChatParametersStream,
  ): AsyncIterable<CompletionChunk> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'OpenAI-Organization': this.organizationId ?? '',
      },
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new ClientHttpUnexpectedError(error, response);
      } catch {
        throw new ClientHttpUnexpectedError(
          'Unexpected error occurred',
          await response.json(),
        );
      }
    }

    const reader = response.body?.getReader();
    const utf8Decoder = new TextDecoder();

    if (reader == undefined) {
      throw new Error('ReadableStream not supported');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        throw new Error('Unexpected end of stream');
      }

      let chunk = utf8Decoder.decode(value);

      let message;
      while ((message = chunk.match(pattern)?.[1])) {
        if (message === DONE_TOKEN) {
          return;
        }
        yield JSON.parse(message) as CompletionChunk;
        chunk = chunk.slice(message.length);
      }
    }
  }
}
