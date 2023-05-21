export class ClientHttpUnexpectedError extends Error {
  override name = 'ClientHttpUnexpectedError';

  constructor(message: string, cause: unknown) {
    super(message, { cause });
    Object.setPrototypeOf(this, ClientHttpUnexpectedError.prototype);
  }
}
