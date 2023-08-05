import { HttpError } from '../';

describe('HttpError', () => {
  test('Deve criar um HttpError com a mensagem e o statusCode corretos', () => {
    const message = 'Erro de teste';
    const statusCode = 404;

    const httpError = new HttpError(message, statusCode);

    expect(httpError.message).toBe(message);
    expect(httpError.statusCode).toBe(statusCode);
  });

  test('Deve criar um HttpError com statusCode padrão (500) quando não for fornecido', () => {
    const message = 'Erro de teste';

    const httpError = new HttpError(message);

    expect(httpError.message).toBe(message);
    expect(httpError.statusCode).toBe(500);
  });
});
