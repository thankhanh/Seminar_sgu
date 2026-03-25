import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock check token
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Decode mock user
      const savedUser = localStorage.getItem('admin_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser({
          id: '1',
          name: 'Super Admin',
          email: 'admin@system.com',
          role: 'admin',
          avatar: 'https://i.pravatar.cc/150?u=admin'
        });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (password === 'password') { // basic mock validation
          const isMerchant = email === 'merchant@gmail.com';
          const dummyUser: User = {
            id: isMerchant ? '2' : '1',
            name: isMerchant ? 'Chủ quán Test' : 'Admin Test',
            email,
            role: isMerchant ? 'manager' : 'admin',
            avatar: `https://i.pravatar.cc/150?u=${email}`
          };
          localStorage.setItem('admin_token', 'mock-jwt-token');
          localStorage.setItem('admin_user', JSON.stringify(dummyUser));
          setUser(dummyUser);
          resolve();
        } else {
          reject(new Error('Email hoặc mật khẩu không chính xác'));
        }
        setLoading(false);
      }, 1200);
    });
  };

  const register = async (name: string, email: string, _password: string) => {
    setLoading(true);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const dummyUser: User = {
          id: Date.now().toString(),
          name,
          email,
          role: 'manager',
          avatar: `https://i.pravatar.cc/150?u=${email}`
        };
        localStorage.setItem('admin_token', 'mock-jwt-token');
        localStorage.setItem('admin_user', JSON.stringify(dummyUser));
        setUser(dummyUser);
        resolve();
        setLoading(false);
      }, 1200);
    });
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
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
