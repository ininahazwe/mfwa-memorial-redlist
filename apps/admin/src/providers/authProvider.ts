// ============================================
// AUTH PROVIDER — JWT sans Firebase
// Remplace : apps/admin/src/providers/authProvider.ts
// ============================================

import type { AuthProvider } from '@refinedev/core';

const API_URL     = import.meta.env.VITE_API_URL ?? 'http://localhost:4321';
const TOKEN_KEY   = 'mv_admin_token';
const USER_KEY    = 'mv_admin_user';

// ============================================
// HELPER — Headers avec JWT
// ============================================

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token
      ? { Authorization: `Bearer ${token}` }
      : {};
}

// ============================================
// AUTH PROVIDER
// ============================================

export const authProvider: AuthProvider = {

  // ------------------------------------------
  // LOGIN
  // ------------------------------------------
  login: async ({ email, password }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: {
            name:    'Connexion échouée',
            message: json.error ?? 'Identifiants incorrects',
          },
        };
      }

      // Stocker le token et l'utilisateur
      localStorage.setItem(TOKEN_KEY, json.token);
      localStorage.setItem(USER_KEY, JSON.stringify(json.user));

      return { success: true, redirectTo: '/' };

    } catch {
      return {
        success: false,
        error: {
          name:    'Erreur réseau',
          message: 'Impossible de contacter le serveur',
        },
      };
    }
  },

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { success: true, redirectTo: '/login' };
  },

  // ------------------------------------------
  // CHECK (appelé à chaque navigation)
  // ------------------------------------------
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, redirectTo: '/login' };
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return { authenticated: false, redirectTo: '/login' };
      }

      return { authenticated: true };

    } catch {
      // En cas d'erreur réseau, on garde la session locale
      return { authenticated: false, redirectTo: '/login' };
    }
  },

  // ------------------------------------------
  // ON ERROR (401 depuis l'API)
  // ------------------------------------------
  onError: async (error) => {
    if (error?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return { logout: true, redirectTo: '/login' };
    }
    return { error };
  },

  // ------------------------------------------
  // GET IDENTITY (affichage dans le header)
  // ------------------------------------------
  getIdentity: async () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw);
      return {
        id:     user.id,
        name:   user.name ?? user.email,
        email:  user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? user.email)}&background=c4a77d&color=0a0a0a`,
      };
    } catch {
      return null;
    }
  },

  // ------------------------------------------
  // GET PERMISSIONS
  // ------------------------------------------
  getPermissions: async () => 'admin',
};