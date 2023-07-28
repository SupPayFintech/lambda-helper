import { get, assign } from 'radash';

interface Config {
  [key: string]: unknown;
}

export default (configs: Config, homologConfig?: Config) => {
  return {
    get<T>(path: string, defaultValue?: unknown): T {
      const userMerge = !['homolog', 'production'].includes(process.env.NODE_ENV || '');

      return get(userMerge ? assign(configs, homologConfig || {}) : configs, path, defaultValue) as T;
    },
  };
};
