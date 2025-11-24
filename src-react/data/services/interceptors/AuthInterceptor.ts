import { AxiosRequestConfig } from 'axios';

/**
 * Interceptor de autenticação
 * Preparado para uso futuro quando autenticação for implementada
 */
export class AuthInterceptor {
  /**
   * Obtém o token de autenticação
   * TODO: Implementar quando autenticação for necessária
   */
  static getToken(): string | null {
    // Exemplo: return localStorage.getItem('authToken');
    return null;
  }

  /**
   * Adiciona o token de autenticação ao header da requisição
   */
  static addAuthHeader(config: AxiosRequestConfig): AxiosRequestConfig {
    const token = this.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  /**
   * Remove o token de autenticação
   */
  static clearToken(): void {
    // Exemplo: localStorage.removeItem('authToken');
  }

  /**
   * Define o token de autenticação
   */
  static setToken(token: string): void {
    // Exemplo: localStorage.setItem('authToken', token);
  }
}


