export class ProviderError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code = 'PROVIDER_ERROR', status?: number) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
  }
}

export function friendlyHttpError(status: number): string {
  switch (status) {
    case 401:
      return 'Your session is not authorized. Please sign in again.';
    case 422:
      return 'Please check your message and try again.';
    case 429:
      return 'Too many requests, please wait';
    case 503:
      return 'Assistant is unavailable';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
