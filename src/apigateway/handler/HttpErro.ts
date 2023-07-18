export default class HttpError extends Error {
  statusCode: number;

  constructor(message: string | undefined, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
  }
}
