import { ApiError } from './ApiError';
import { AxiosError } from 'axios';

/**
 * Utilitário para tratamento centralizado de erros
 */
export class ErrorHandler {
  /**
   * Converte um erro do Axios em ApiError
   */
  static handleAxiosError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (this.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 0;
      const message = this.getErrorMessage(axiosError);
      return ApiError.fromHttpError(statusCode, message, error);
    }

    if (error instanceof Error) {
      return ApiError.fromNetworkError(error.message, error);
    }

    return ApiError.fromNetworkError('Erro desconhecido', error);
  }

  /**
   * Verifica se o erro é um AxiosError
   */
  private static isAxiosError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as { isAxiosError: boolean }).isAxiosError
    );
  }

  /**
   * Extrai mensagem de erro do AxiosError
   */
  private static getErrorMessage(axiosError: AxiosError): string {
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      if (typeof data === 'string') {
        return data;
      }
      if (typeof data === 'object' && 'message' in data) {
        return String(data.message);
      }
      if (typeof data === 'object' && 'error' in data) {
        return String(data.error);
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }

    return this.getDefaultMessage(axiosError.response?.status || 0);
  }

  /**
   * Retorna mensagem padrão baseada no código HTTP
   */
  private static getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Requisição inválida',
      401: 'Não autorizado',
      403: 'Acesso negado',
      404: 'Recurso não encontrado',
      409: 'Conflito - recurso já existe',
      500: 'Erro interno do servidor',
      502: 'Erro de gateway',
      503: 'Serviço indisponível',
    };

    return messages[statusCode] || `Erro HTTP ${statusCode}`;
  }
}


