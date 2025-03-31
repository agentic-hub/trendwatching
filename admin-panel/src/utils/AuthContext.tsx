import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { nhost } from './nhost';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated using Nhost
    const checkAuthState = async () => {
      const isAuthenticated = nhost.auth.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      setLoading(false);
    };
    
    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { session, error } = await nhost.auth.signIn({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (session) {
        setIsAuthenticated(true);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { session, error } = await nhost.auth.signUp({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (session) {
        setIsAuthenticated(true);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await nhost.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 