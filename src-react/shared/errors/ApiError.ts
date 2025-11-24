/**
 * Classe de erro personalizada para erros da API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromHttpError(statusCode: number, message: string, originalError?: unknown): ApiError {
    return new ApiError(statusCode, message, originalError);
  }

  static fromNetworkError(message: string, originalError?: unknown): ApiError {
    return new ApiError(0, message, originalError);
  }
}


