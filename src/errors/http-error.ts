const defaultNames: Record<number, string> = {
  400: 'BadRequestError',
  401: 'UnauthorizedError',
  403: 'ForbiddenError',
  404: 'NotFoundError',
  409: 'ConflictError',
};

export type HttpError = Error & { statusCode: number };

export function createHttpError(statusCode: number, message: string, name?: string): HttpError {
  const error = new Error(message) as HttpError;
  error.name = name ?? defaultNames[statusCode] ?? 'ApplicationError';
  error.statusCode = statusCode;
  return error;
}
