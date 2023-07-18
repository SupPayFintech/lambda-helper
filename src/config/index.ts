import { get } from 'radash';

interface Config {
  [key: string]: unknown;
}

export default (configs: Config) => {
  return {
    get<T>(path: string, defaultValue?: unknown): T {
      return get(configs, path, defaultValue) as T;
    },
  };
};
