// ============================================
// DATA PROVIDER FIRESTORE POUR REFINE
// ============================================
// Ce fichier connecte Refine à Firestore.
// Il traduit les opérations CRUD de Refine en requêtes Firestore.

import { DataProvider } from '@refinedev/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';

// ============================================
// HELPERS
// ============================================

/**
 * Convertir les Timestamps Firestore en objets Date JavaScript
 */
function convertTimestamps(data: any): any {
  const converted: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Récursif pour les objets imbriqués (ex: coords)
      converted[key] = convertTimestamps(value);
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

/**
 * Préparer les données avant envoi à Firestore
 * - Ajoute createdAt si nouveau document
 * - Met à jour updatedAt
 * - Supprime l'ID (géré par Firestore)
 */
function prepareData(data: any, isNew: boolean = false): any {
  const prepared = { ...data };
  
  // Timestamps
  if (isNew && !prepared.createdAt) {
    prepared.createdAt = Timestamp.now();
  }
  prepared.updatedAt = Timestamp.now();
  
  // Supprimer l'ID (Firestore le gère automatiquement)
  delete prepared.id;
  
  return prepared;
}

// ============================================
// DATA PROVIDER
// ============================================

export const firestoreDataProvider: DataProvider = {
  
  // ----------------------------------------
  // GET LIST - Récupérer une liste
  // ----------------------------------------
  getList: async ({ resource }) => {
      // Supprime le query() et le orderBy() pour le test
      const snapshot = await getDocs(collection(db, resource));
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      }));
      
      console.log(`Données reçues pour ${resource}:`, data.length); // Vérifie ton log
      
      return { 
        data, 
        total: data.length 
      };
  },

  // ----------------------------------------
  // GET ONE - Récupérer un document
  // ----------------------------------------
  getOne: async ({ resource, id }) => {
    const docRef = doc(db, resource, id as string);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Document ${id} non trouvé dans ${resource}`);
    }
    
    return {
      data: { 
        id: docSnap.id, 
        ...convertTimestamps(docSnap.data()) 
      },
    };
  },

  // ----------------------------------------
  // CREATE - Créer un document
  // ----------------------------------------
  create: async ({ resource, variables }) => {
    const data = prepareData(variables, true);
    
    const docRef = await addDoc(collection(db, resource), data);
    
    return { 
      data: { 
        id: docRef.id, 
        ...convertTimestamps(data) 
      } 
    };
  },

  // ----------------------------------------
  // UPDATE - Mettre à jour un document
  // ----------------------------------------
  update: async ({ resource, id, variables }) => {
    console.log('🔍 UPDATE CALLED:', { resource, id, variables }); // ← ADD

    const currentUser = auth.currentUser;
    console.log('👤 Current user in update():', currentUser?.uid, currentUser?.email);

    if (!currentUser) {
      console.error('❌ NO USER LOGGED IN!');
      throw new Error('User not authenticated');
    }

    const docRef = doc(db, resource, id as string);
    const data = prepareData(variables, false);

    console.log('📝 Data to update:', data); // ← ADD

    try {
      await updateDoc(docRef, data);
      console.log('✅ Update succeeded'); // ← ADD

      const updated = await getDoc(docRef);
      return {
        data: {
          id: updated.id,
          ...convertTimestamps(updated.data())
        }
      };
    } catch (error) {
      console.error('❌ Update failed:', error); // ← ADD
      throw error;
    }
  },

  // ----------------------------------------
  // DELETE ONE - Supprimer un document
  // ----------------------------------------
  deleteOne: async ({ resource, id }) => {
    const docRef = doc(db, resource, id as string);
    
    // Récupérer avant suppression (pour retourner les données)
    const docSnap = await getDoc(docRef);
    const data = { 
      id: docSnap.id, 
      ...convertTimestamps(docSnap.data() || {}) 
    };
    
    await deleteDoc(docRef);
    
    return { data };
  },

  // ----------------------------------------
  // GET MANY - Récupérer plusieurs documents par IDs
  // ----------------------------------------
  getMany: async ({ resource, ids }) => {
    const data = await Promise.all(
      ids.map(async (id) => {
        const docSnap = await getDoc(doc(db, resource, id as string));
        
        if (!docSnap.exists()) {
          return null;
        }
        
        return { 
          id: docSnap.id, 
          ...convertTimestamps(docSnap.data()) 
        };
      })
    );
    
    return { 
      data: data.filter(Boolean) as any[] 
    };
  },

  // ----------------------------------------
  // DELETE MANY - Supprimer plusieurs documents
  // ----------------------------------------
  deleteMany: async ({ resource, ids }) => {
    await Promise.all(
      ids.map((id) => deleteDoc(doc(db, resource, id as string)))
    );
    
    return { 
      data: ids.map((id) => ({ id })) as any[]
    };
  },

  // ----------------------------------------
  // UPDATE MANY - Mettre à jour plusieurs documents
  // ----------------------------------------
  updateMany: async ({ resource, ids, variables }) => {
    const data = await Promise.all(
      ids.map(async (id) => {
        const docRef = doc(db, resource, id as string);
        const preparedData = prepareData(variables, false);
        
        await updateDoc(docRef, preparedData);
        
        const updated = await getDoc(docRef);
        return { 
          id: updated.id, 
          ...convertTimestamps(updated.data()) 
        };
      })
    );
    
    return { data };
  },

  // ----------------------------------------
  // CUSTOM - Non utilisé
  // ----------------------------------------
  custom: async () => {
    throw new Error('Méthode custom non implémentée');
  },

  // ----------------------------------------
  // GET API URL - Non utilisé (pas de REST API)
  // ----------------------------------------
  getApiUrl: () => '',
};

export default firestoreDataProvider;
