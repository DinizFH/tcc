import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Ajuste o IP para o da sua máquina local (mesma rede do celular)
const api = axios.create({
  baseURL: 'http://192.168.8.4:5000', // Flask backend
  timeout: 8000,
});

// ✅ Interceptor de requisição — adiciona o token JWT automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor de resposta — detecta token inválido/expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;

      // Se o token estiver inválido ou expirado → remove e volta ao login
      if (status === 401 || status === 403) {
        console.warn('Sessão expirada. Faça login novamente.');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('tipo');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
