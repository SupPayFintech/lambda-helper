import logger from '../index';

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve retornar um objeto de logger', () => {
    const log = logger();
    expect(log).toBeDefined();
    expect(typeof log).toBe('object');
  });

  test('Deve retornar a mesma instância do logger', () => {
    const log1 = logger();
    const log2 = logger();
    expect(log1).toBe(log2);
  });
});
