import createConfigWrapper from '../index';

describe('Config Wrapper', () => {
  const sampleConfig: { [key: string]: unknown } = {
    server: {
      port: 3000,
      host: 'localhost',
    },
    database: {
      host: 'localhost',
      port: 27017,
    },
  };

  const configWrapper = createConfigWrapper(sampleConfig);

  it('should return the correct value when key exists in config', () => {
    const port = configWrapper.get<number>('server.port');
    expect(port).toBe(3000);

    const databaseHost = configWrapper.get<string>('database.host');
    expect(databaseHost).toBe('localhost');
  });

  it('should return the default value when key does not exist in config', () => {
    const defaultValue = 'default';
    const nonExistingKey = configWrapper.get<string>('some.non.existing.key', defaultValue);
    expect(nonExistingKey).toBe(defaultValue);
  });

  it('should return the correct value when key exists but has a falsy value', () => {
    const falsyValue = false;
    const keyWithFalsyValue = configWrapper.get<boolean>('some.falsy.key', falsyValue);
    expect(keyWithFalsyValue).toBe(false);
  });
});
