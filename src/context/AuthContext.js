'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// ─── Simple hash helper (XOR-based, not cryptographic — for demo only) ───────
// In production, use bcrypt on the server side.
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('baya_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Auth load error:', e);
    }
    setIsAuthLoaded(true);
  }, []);

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('baya_users') || '[]');
    } catch {
      return [];
    }
  };

  const register = ({ firstName, lastName, email, phone, password, city, address }) => {
    const existing = getUsers().find((u) => u.email === email);
    if (existing) {
      throw new Error('Un compte avec cet e-mail existe déjà.');
    }

    const newUser = {
      id: 'u_' + Date.now(),
      firstName,
      lastName,
      email,
      phone,
      city,
      address,
      passwordHash: simpleHash(password), // never store plain text
      createdAt: new Date().toISOString(),
      avatar: firstName.charAt(0).toUpperCase(),
    };

    const users = getUsers();
    users.push(newUser);
    localStorage.setItem('baya_users', JSON.stringify(users));

    // Auto-login after register — session object has NO passwordHash
    const { passwordHash: _ph, ...sessionUser } = newUser;
    localStorage.setItem('baya_auth_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.passwordHash === simpleHash(password)
    );
    if (!found) {
      throw new Error('E-mail ou mot de passe incorrect.');
    }
    const { passwordHash: _ph, ...sessionUser } = found;
    localStorage.setItem('baya_auth_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem('baya_auth_user');
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    localStorage.setItem('baya_auth_user', JSON.stringify(updated));

    // Also update in users list (preserve passwordHash)
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedData };
      localStorage.setItem('baya_users', JSON.stringify(users));
    }

    setUser(updated);
  };

  const changePassword = (currentPassword, newPassword) => {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) throw new Error('Utilisateur introuvable.');

    // Verify current password
    if (users[idx].passwordHash !== simpleHash(currentPassword)) {
      throw new Error('Mot de passe actuel incorrect.');
    }

    users[idx].passwordHash = simpleHash(newPassword);
    localStorage.setItem('baya_users', JSON.stringify(users));
  };

  // Get orders for current user — filtered by userId OR email for backward compat
  const getUserOrders = () => {
    if (!user) return [];
    try {
      const all = JSON.parse(localStorage.getItem('baya_customer_orders_history') || '[]');
      return all
        .filter((o) => o.userId === user.id || o.customer?.email === user.email)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
      return [];
    }
  };

  const getLoyaltyPoints = () => {
    const orders = getUserOrders();
    const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return Math.floor(total / 1000);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoaded,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        getUserOrders,
        getLoyaltyPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
