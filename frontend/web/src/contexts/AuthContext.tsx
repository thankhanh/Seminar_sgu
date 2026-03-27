import React, { createContext, useContext, useState, useEffect } from 'react';

import { authApi } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'merchant' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string, businessName?: string, taxCode?: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const data = await authApi.getMe() as any;
          const { user: userData } = data;
          setUser(userData);
        } catch (err) {
          console.error('Token expired or invalid', err);
          localStorage.removeItem('admin_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      // response is { success, data: { accessToken, user } }
      const { accessToken, user: userData } = response.data;
      
      localStorage.setItem('admin_token', accessToken);
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'user', businessName?: string, taxCode?: string) => {
    setLoading(true);
    try {
      // In this system, registration is for Merchants mostly
      // Or general users. We use the auth registration first.
      const result = await authApi.register({ name, email, password, role, businessName, taxCode });
      
      const { accessToken, user: userData } = result.data;
      if (accessToken) {
        localStorage.setItem('admin_token', accessToken);
        setUser(userData);
      }
      return result.data;
    } catch (err: any) {
      throw new Error(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
