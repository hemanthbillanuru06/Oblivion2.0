import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  updateUser: (user: Partial<IUser>) => void;
  toggleBookmark: (type: 'course' | 'resource', itemId: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = localStorage.getItem('oblivion_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('oblivion_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('oblivion_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('oblivion_user', JSON.stringify(res.data.user));
          }
        } catch {
          // If token expired, clear state
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchMe();
  }, []);

  const login = (newToken: string, newUser: IUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('oblivion_token', newToken);
    localStorage.setItem('oblivion_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('oblivion_token');
    localStorage.removeItem('oblivion_user');
  };

  const updateUser = (updatedFields: Partial<IUser>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('oblivion_user', JSON.stringify(updated));
    }
  };

  const toggleBookmark = async (type: 'course' | 'resource', itemId: string) => {
    try {
      const res = await api.post('/auth/bookmark', { type, itemId });
      if (res.data.success && user) {
        updateUser({ bookmarks: res.data.bookmarks });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor' || isAdmin;
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        toggleBookmark,
        isAuthenticated,
        isAdmin,
        isInstructor,
        isStudent,
      }}
    >
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
