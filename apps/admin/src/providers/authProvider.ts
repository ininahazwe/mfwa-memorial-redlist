// ============================================
// AUTH PROVIDER FIREBASE POUR REFINE
// ============================================
// Gère l'authentification des administrateurs :
// - Connexion par email/mot de passe
// - Vérification du rôle admin dans Firestore
// - Déconnexion
// - Récupération de l'identité

import { AuthProvider } from '@refinedev/core';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// ============================================
// HELPER : Vérifier si l'utilisateur est admin
// ============================================

/**
 * Vérifie si l'utilisateur a le rôle admin dans Firestore
 * Collection "admins" avec document ID = UID de l'utilisateur
 */
async function checkIsAdmin(uid: string): Promise<boolean> {
  console.log('🔑 [AUTH] Checking admin status for UID:', uid);
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    const isAdmin = adminDoc.exists() && adminDoc.data()?.role === 'admin';
    console.log('👤 [AUTH] Is admin?', isAdmin, 'Doc data:', adminDoc.data());
    return isAdmin;
  } catch (error) {
    console.error('❌ [AUTH] Error checking admin status:', error);
    return false;
  }
}

// ============================================
// HELPER : Attendre Firebase Auth avec timeout
// ============================================

/**
 * Attend que Firebase Auth soit prêt avec un timeout
 * En prod, onAuthStateChanged peut prendre du temps
 */
function waitForAuthStateChange(timeoutMs: number = 5000): Promise<User | null> {
  return new Promise((resolve) => {
    console.log('⏱️ [AUTH] Waiting for auth state change (timeout: ' + timeoutMs + 'ms)');

    let resolved = false;

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('⚠️ [AUTH] Auth state check timed out after ' + timeoutMs + 'ms, assuming not authenticated');
        resolve(null);
      }
    }, timeoutMs);

    // Écouter les changements d'état
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        unsubscribe();
        console.log('✅ [AUTH] Auth state received:', user ? user.email : 'null');
        resolve(user);
      }
    });
  });
}

// ============================================
// AUTH PROVIDER
// ============================================

export const authProvider: AuthProvider = {

  // ----------------------------------------
  // LOGIN - Connexion
  // ----------------------------------------
  login: async ({ email, password }) => {
    console.log('🔐 [AUTH] Login attempt for:', email);

    try {
      // 1. Authentifier avec Firebase Auth
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ [AUTH] Firebase auth successful:', user.uid);

      // 2. Vérifier le rôle admin
      const isAdmin = await checkIsAdmin(user.uid);

      if (!isAdmin) {
        console.warn('⛔ [AUTH] User is not admin, logging out');
        // Pas admin → déconnecter et refuser
        await signOut(auth);
        return {
          success: false,
          error: {
            name: 'Accès refusé',
            message: "Vous n'avez pas les droits administrateur.",
          },
        };
      }

      console.log('🎉 [AUTH] Login successful for admin:', email);
      // 3. Succès
      return {
        success: true,
        redirectTo: '/',
      };

    } catch (error: any) {
      console.error('❌ [AUTH] Login error:', error.message);
      // Erreur d'authentification
      return {
        success: false,
        error: {
          name: 'Erreur de connexion',
          message: error.message || 'Email ou mot de passe incorrect.',
        },
      };
    }
  },

  // ----------------------------------------
  // LOGOUT - Déconnexion
  // ----------------------------------------
  logout: async () => {
    console.log('👋 [AUTH] Logout');
    await signOut(auth);
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  // ----------------------------------------
  // CHECK - Vérifier si connecté (CRITIQUE!)
  // ----------------------------------------
  check: async () => {
    console.log('🔍 [AUTH] Checking authentication state...');

    try {
      // Attendre Firebase avec timeout (5 secondes max)
      const user = await waitForAuthStateChange(5000);

      if (!user) {
        console.log('❌ [AUTH] No user, redirecting to login');
        return {
          authenticated: false,
          redirectTo: '/login',
        };
      }

      console.log('🔐 [AUTH] User found:', user.uid, user.email);

      // Vérifier le rôle admin
      const isAdmin = await checkIsAdmin(user.uid);

      if (!isAdmin) {
        console.warn('⛔ [AUTH] User is not admin');
        await signOut(auth);
        return {
          authenticated: false,
          redirectTo: '/login',
          error: {
            name: 'Accès refusé',
            message: 'Droits administrateur requis.',
          },
        };
      }

      console.log('✅ [AUTH] Authentication check passed, user is admin');
      return { authenticated: true };

    } catch (error) {
      console.error('❌ [AUTH] Check error:', error);
      return {
        authenticated: false,
        redirectTo: '/login',
        error: {
          name: 'Erreur',
          message: 'Erreur lors de la vérification de l\'authentification',
        },
      };
    }
  },

  // ----------------------------------------
  // ON ERROR - Gestion des erreurs
  // ----------------------------------------
  onError: async (error) => {
    console.error('🚨 [AUTH] Auth error:', error);
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }
    return { error };
  },

  // ----------------------------------------
  // GET IDENTITY - Récupérer l'utilisateur actuel
  // ----------------------------------------
  getIdentity: async () => {
    console.log('👤 [AUTH] Getting identity...');
    const user = auth.currentUser;
    console.log('Current user:', user?.uid, user?.email);

    if (user) {
      return {
        id: user.uid,
        name: user.displayName || user.email || 'Admin',
        email: user.email,
        avatar: user.photoURL || undefined,
      };
    }

    return null;
  },

  // ----------------------------------------
  // GET PERMISSIONS - Récupérer les permissions
  // ----------------------------------------
  getPermissions: async () => {
    console.log('🔑 [AUTH] Getting permissions...');
    const user = auth.currentUser;

    if (user) {
      const isAdmin = await checkIsAdmin(user.uid);
      return isAdmin ? ['admin'] : [];
    }

    return [];
  },
};

export default authProvider;
