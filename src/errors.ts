export class VerityError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "VerityError";
    this.code = code;
  }
}

export function fail(code: string, message: string): never {
  throw new VerityError(code, message);
}
