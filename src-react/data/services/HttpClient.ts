import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from './config/apiConfig';
import { ErrorHandler } from '../../shared/errors/ErrorHandler';
import { ApiError } from '../../shared/errors/ApiError';

/**
 * Cliente HTTP base usando Axios
 */
export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: apiConfig.headers,
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptors de request e response
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Aqui pode ser adicionado token de autenticação
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(ErrorHandler.handleAxiosError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(ErrorHandler.handleAxiosError(error));
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error);
    }
  }

  /**
   * GET request para download de arquivos (retorna blob)
   */
  async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    try {
      const response = await this.client.get(url, {
        ...config,
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error);
    }
  }

  /**
   * Retorna a instância do Axios (para casos especiais)
   */
  getInstance(): AxiosInstance {
    return this.client;
  }
}


