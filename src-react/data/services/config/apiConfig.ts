/**
 * Configuração da API
 */
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 300000, // 5 minutos para uploads grandes
  headers: {
    'Content-Type': 'application/json',
  },
};


