import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const token = await AsyncStorage.getItem('token');
        const tipo = await AsyncStorage.getItem('tipo');
        if (token) {
          setIsAuthenticated(true);
          setUserType(tipo);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  async function login({ token, tipo }) {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('tipo', tipo);
      setIsAuthenticated(true);
      setUserType(tipo);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('tipo');
      setIsAuthenticated(false);
      setUserType(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userType, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
