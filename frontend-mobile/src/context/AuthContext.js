import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (userToken) {
        // Verify token is still valid
        const res = await api.get('/auth/test', {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      }
    } catch (e) {
      console.log('[Auth] Token restore failed:', e.message);
      await SecureStore.deleteItemAsync('userToken').catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData } = response.data;
      await SecureStore.setItemAsync('userToken', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUser(response.data.user);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken').catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
