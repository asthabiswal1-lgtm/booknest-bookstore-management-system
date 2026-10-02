import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_USERS } from '../data/mockData';
import { AccountStatus, MembershipTier, User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCurator: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addUser: (newUser: Omit<User, 'id' | 'userCode' | 'ordersCount' | 'totalSpent' | 'libraryCount'>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string, newStatus: AccountStatus) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('booknest_users');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedId = localStorage.getItem('booknest_current_user_id');
      if (storedId) {
        const found = users.find((u) => u.id === storedId);
        if (found) return found;
      }
      // Default to Elena Rostova as per the user's mock screens
      return users.find((u) => u.id === 'usr-8902') || users[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('booknest_auth_token') || 'mock_jwt_token_curator_session_xyz';
  });

  useEffect(() => {
    try {
      localStorage.setItem('booknest_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('booknest_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('booknest_current_user_id');
    }
  }, [currentUser]);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message: string }> => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'suspended') {
        return { success: false, message: 'This account has been suspended by administration.' };
      }
      setCurrentUser(found);
      const generatedToken = `jwt_mock_${Date.now()}_${found.id}`;
      setToken(generatedToken);
      localStorage.setItem('booknest_auth_token', generatedToken);
      return { success: true, message: `Welcome back, ${found.name}` };
    }
    // If not found, provide a graceful message
    return { success: false, message: 'No registered reader account found with this email. Please check your credentials or register.' };
  };

  const register = async (name: string, email: string, _password?: string): Promise<{ success: boolean; message: string }> => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Try signing in.' };
    }

    const newId = `usr-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: User = {
      id: newId,
      userCode: `#USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'customer',
      roleTitle: 'Verified Reader',
      membershipTier: 'Standard Reader',
      status: 'active',
      city: 'New York',
      state: 'NY',
      ordersCount: 0,
      totalSpent: 0,
      libraryCount: 0,
      shippingAddress: '123 Reading Nook Way, New York, NY 10001',
      phone: '+1 (555) 000-0000',
      subscriptions: {
        weeklyLetters: true,
        smsAlerts: false,
        auctionNotifications: false,
      },
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    const generatedToken = `jwt_mock_${Date.now()}_${newUser.id}`;
    setToken(generatedToken);
    localStorage.setItem('booknest_auth_token', generatedToken);
    return { success: true, message: `Welcome to the BookNest circle, ${name}!` };
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('booknest_auth_token');
    localStorage.removeItem('booknest_current_user_id');
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      const generatedToken = `jwt_mock_${Date.now()}_${found.id}`;
      setToken(generatedToken);
      localStorage.setItem('booknest_auth_token', generatedToken);
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const updated = { ...user, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return user;
      })
    );
  };

  const addUser = (newUserPartial: Omit<User, 'id' | 'userCode' | 'ordersCount' | 'totalSpent' | 'libraryCount'>) => {
    const id = `usr-${Math.floor(1000 + Math.random() * 9000)}`;
    const userCode = `#USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullUser: User = {
      ...newUserPartial,
      id,
      userCode,
      ordersCount: 0,
      totalSpent: 0,
      libraryCount: 0,
    };
    setUsers((prev) => [fullUser, ...prev]);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(users.find((u) => u.id !== id) || null);
    }
  };

  const toggleUserStatus = (id: string, newStatus: AccountStatus) => {
    updateUser(id, { status: newStatus });
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'curator';
  const isCurator = currentUser?.role === 'curator';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        token,
        isAuthenticated: !!currentUser,
        isAdmin,
        isCurator,
        login,
        register,
        logout,
        switchUser,
        updateUser,
        addUser,
        deleteUser,
        toggleUserStatus,
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
