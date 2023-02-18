import { SemVer } from 'semver';

import type { MastoConfigProps } from './config';
import { MastoConfig } from './config';
import { HttpNativeImpl } from './http';
import type { Logger } from './logger';
import { LoggerConsoleImpl } from './logger';
import { mastodon } from './mastodon';
import { SerializerNativeImpl } from './serializers';
import { WsNativeFactory } from './ws';

export type RequestParams = Pick<
  MastoConfigProps,
  | 'url'
  | 'logLevel'
  | 'timeout'
  | 'defaultRequestInit'
  | 'disableDeprecatedWarning'
>;

type HttpContext = {
  serializer: SerializerNativeImpl;
  config: MastoConfig;
  logger: Logger;
  http: HttpNativeImpl;
};

const buildHttpContext = (params: CreateClientParams): HttpContext => {
  const version =
    params.version && !params.disableVersionCheck
      ? new SemVer(params.version, true)
      : undefined;

  const props = { ...params, version };

  const serializer = new SerializerNativeImpl();
  const config = new MastoConfig(props, serializer);
  const logger = new LoggerConsoleImpl(config.getLogLevel());
  const http = new HttpNativeImpl(serializer, config, logger);
  return { serializer, config, logger, http };
};

export const fetchV1Instance = (
  params: RequestParams,
): Promise<mastodon.v1.Instance> => {
  const { http, config } = buildHttpContext(params);
  return new mastodon.v1.InstanceRepository(http, config).fetch();
};

export const fetchV2Instance = (
  params: RequestParams,
): Promise<mastodon.v2.Instance> => {
  const { http, config } = buildHttpContext(params);
  return new mastodon.v2.InstanceRepository(http, config).fetch();
};

export type CreateClientParams = Omit<MastoConfigProps, 'version'> & {
  readonly version?: string;
};

export const createClient = (params: CreateClientParams): mastodon.Client => {
  const { serializer, config, logger, http } = buildHttpContext(params);
  const ws = new WsNativeFactory(serializer);

  logger.debug('Masto.js initialised', config);
  return new mastodon.Client(http, ws, config);
};

export type LoginParams = Omit<
  CreateClientParams,
  'streamingApiUrl' | 'version'
>;

/**
 * Fetching instance information and create a client
 *
 * Shortcut of `fetchV1Instance` and `createClient`
 */
export const login = async (params: LoginParams): Promise<mastodon.Client> => {
  const instance = await fetchV1Instance(params);
  return createClient({
    ...params,
    version: instance.version,
    streamingApiUrl: instance.urls.streamingApi,
  });
};
