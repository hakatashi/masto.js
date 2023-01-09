/* eslint-disable unicorn/no-thenable */
import type { Http } from './http';

export class Paginator<Entity, Params = never>
  implements AsyncIterableIterator<Entity>, PromiseLike<Entity>
{
  constructor(
    private readonly http: Http,
    private nextPath?: string,
    private nextParams?: Params,
  ) {}

  async next(): Promise<IteratorResult<Entity, undefined>> {
    if (this.nextPath == undefined) {
      return { done: true, value: undefined };
    }

    const response = await this.http.request({
      requestInit: { method: 'GET' },
      path: this.nextPath,
      searchParams: this.nextParams as Record<string, unknown>,
    });

    const next = this.pluckNext(response.headers.get('link'))?.split('?');
    this.nextPath = next?.[0];
    this.nextParams = Object.fromEntries(
      new URLSearchParams(next?.[1]).entries(),
    ) as Params;

    return {
      done: false,
      value: response.data as Entity,
    };
  }

  async return<T, U>(value: U | Promise<U>): Promise<IteratorResult<T, U>> {
    return {
      done: true,
      value: await value,
    };
  }

  async throw<T, U>(e: unknown): Promise<IteratorResult<T, U>> {
    throw e;
  }

  then<TResult1 = Entity, TResult2 = never>(
    onfulfilled: (
      value: Entity,
    ) => TResult1 | PromiseLike<TResult1> = Promise.resolve,
    onrejected: (
      reason: unknown,
    ) => TResult2 | PromiseLike<TResult2> = Promise.reject,
  ): Promise<TResult1 | TResult2> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.next().then((value) => onfulfilled(value.value!), onrejected);
  }

  [Symbol.asyncIterator](): AsyncGenerator<
    Entity,
    undefined,
    Params | undefined
  > {
    return this;
  }

  private pluckNext = (link: string | null): string | undefined => {
    if (link == undefined) {
      return undefined;
    }

    const path = link
      .match(/<(.+?)>; rel="next"/)?.[1]
      .replace(/^https?:\/\/[^/]+/, '');

    return path;
  };

  clone(): Paginator<Entity, Params> {
    return new Paginator(this.http, this.nextPath, this.nextParams);
  }
}
