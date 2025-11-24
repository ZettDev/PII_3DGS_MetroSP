import { HttpClient } from './HttpClient';
import { AxiosRequestConfig } from 'axios';

/**
 * Serviço genérico com métodos REST
 */
export class ApiService {
  protected httpClient: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.httpClient = httpClient || new HttpClient();
  }

  /**
   * GET request genérico
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.httpClient.get<T>(url, config);
  }

  /**
   * POST request genérico
   */
  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.httpClient.post<T>(url, data, config);
  }

  /**
   * PUT request genérico
   */
  protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.httpClient.put<T>(url, data, config);
  }

  /**
   * DELETE request genérico
   */
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.httpClient.delete<T>(url, config);
  }

  /**
   * PATCH request genérico
   */
  protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.httpClient.patch<T>(url, data, config);
  }

  /**
   * POST request para multipart/form-data (upload de arquivos)
   */
  protected async postFormData<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.httpClient.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  /**
   * GET request para download de arquivos
   */
  protected async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    return this.httpClient.getBlob(url, config);
  }
}


