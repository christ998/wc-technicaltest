/**
 * Configuración de variables de entorno
 * Si VITE_API_URL no está definida, usa la API pública de GitHub por defecto
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.github.com',
} as const;
