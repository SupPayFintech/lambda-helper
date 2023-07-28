import { get, assign } from 'radash';

interface Config {
  [key: string]: unknown;
}

export default (configs: Config, homologConfig?: Config) => {
  return {
    get<T>(path: string, defaultValue?: unknown): T {
      return get(
        process.env.NODE_ENV === 'homolog' ? assign(configs, homologConfig || {}) : configs,
        path,
        defaultValue,
      ) as T;
    },
  };
};
