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
  console.log('🔑 Vérification admin pour UID:', uid); // ← ADD
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    console.log('📄 Admin doc exists?', adminDoc.exists(), adminDoc.data()); // ← ADD
    return adminDoc.exists() && adminDoc.data()?.role === 'admin';
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return false;
  }
}

// ============================================
// AUTH PROVIDER
// ============================================

export const authProvider: AuthProvider = {
  
  // ----------------------------------------
  // LOGIN - Connexion
  // ----------------------------------------
  login: async ({ email, password }) => {
    try {
      // 1. Authentifier avec Firebase Auth
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Vérifier le rôle admin
      const isAdmin = await checkIsAdmin(user.uid);
      
      if (!isAdmin) {
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
      
      // 3. Succès
      return {
        success: true,
        redirectTo: '/',
      };
      
    } catch (error: any) {
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
    await signOut(auth);
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  // ----------------------------------------
  // CHECK - Vérifier si connecté
  // ----------------------------------------
  check: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();

        if (user) {
          console.log('🔐 Utilisateur connecté:', user.uid, user.email); // ← ADD
          const isAdmin = await checkIsAdmin(user.uid);
          console.log('👤 Is admin?', isAdmin); // ← ADD

          if (isAdmin) {
            resolve({ authenticated: true });
          } else {
            await signOut(auth);
            resolve({
              authenticated: false,
              redirectTo: '/login',
              error: {
                name: 'Accès refusé',
                message: 'Droits administrateur requis.',
              },
            });
          }
        } else {
          resolve({
            authenticated: false,
            redirectTo: '/login',
          });
        }
      });
    });
  },

  // ----------------------------------------
  // ON ERROR - Gestion des erreurs
  // ----------------------------------------
  onError: async (error) => {
    console.error('Erreur auth:', error);
    return { error };
  },

  // ----------------------------------------
  // GET IDENTITY - Récupérer l'utilisateur actuel
  // ----------------------------------------
  getIdentity: async () => {
    const user = auth.currentUser;
    console.log('Current user in getIdentity:', user?.uid, user?.email);
    
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
    const user = auth.currentUser;
    
    if (user) {
      const isAdmin = await checkIsAdmin(user.uid);
      return isAdmin ? ['admin'] : [];
    }
    
    return [];
  },
};

export default authProvider;
