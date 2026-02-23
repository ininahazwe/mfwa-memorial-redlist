// ============================================
// FIREBASE CLIENT - Récupération des données
// ============================================

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  QueryConstraint
} from 'firebase/firestore';
import type { Journalist, Country } from '@memoire-vive/shared/types';

// ============================================
// 1. INITIALISATION FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// 2. TYPES POUR LES RÉPONSES
// ============================================

export interface JournalistResponse extends Journalist {
  id: string;
}

export interface CountryResponse extends Country {
  id: string;
}

// ============================================
// 3. RÉCUPÉRER LES JOURNALISTES PUBLIÉS
// ============================================

/**
 * Récupère tous les journalistes publiés depuis Firestore
 * Filtrés par isPublished = true
 */
export async function getPublishedJournalists(): Promise<JournalistResponse[]> {
  try {
    const journalistsRef = collection(db, 'journalists');
    const q = query(journalistsRef, where('isPublished', '==', true));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as JournalistResponse));
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des journalistes:', error);
    return [];
  }
}

// ============================================
// 4. RÉCUPÉRER UN JOURNALISTE PAR SON ID
// ============================================

/**
 * ✅ NOUVEAU : Récupère un journaliste spécifique par son ID
 */
export async function getJournalistById(journalistId: string): Promise<JournalistResponse | null> {
  try {
    const journalistsRef = collection(db, 'journalists');
    const q = query(journalistsRef, where('isPublished', '==', true));
    
    const snapshot = await getDocs(q);
    
    // Cherche le journaliste avec l'ID correspondant
    const journalistDoc = snapshot.docs.find(doc => doc.id === journalistId);
    
    if (!journalistDoc) {
      console.warn(`⚠️ Journaliste non trouvé: ${journalistId}`);
      return null;
    }
    
    const data = journalistDoc.data();
    return {
      id: journalistDoc.id,
      name: data.name,
      countryId: data.countryId,
      countryName: data.countryName,
      role: data.role,
      yearOfDeath: data.yearOfDeath,
      photoUrl: data.photoUrl,
      bio: data.bio,
      placeOfDeath: data.placeOfDeath,
      circumstances: data.circumstances,
      isPublished: data.isPublished,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as JournalistResponse;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du journaliste ${journalistId}:`, error);
    return null;
  }
}

// ============================================
// 5. RÉCUPÉRER LES PAYS
// ============================================

/**
 * Récupère tous les pays avec le compte des journalistes publiés par pays
 */
export async function getCountries(): Promise<CountryResponse[]> {
  try {
    const countriesRef = collection(db, 'countries');
    const snapshot = await getDocs(countriesRef);
    
    const countries: CountryResponse[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as CountryResponse));

    // Récupérer les journalistes pour calculer le nombre par pays
    const journalists = await getPublishedJournalists();
    
    // Ajouter le compte des journalistes à chaque pays
    return countries.map(country => ({
      ...country,
      journalistCount: journalists.filter(
        j => j.countryId === country.id
      ).length,
    }));
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des pays:', error);
    return [];
  }
}

// ============================================
// 6. RÉCUPÉRER LES JOURNALISTES D'UN PAYS
// ============================================

/**
 * Récupère les journalistes publiés d'un pays spécifique
 */
export async function getJournalistsByCountry(countryId: string): Promise<JournalistResponse[]> {
  try {
    const journalistsRef = collection(db, 'journalists');
    const q = query(
      journalistsRef,
      where('countryId', '==', countryId),
      where('isPublished', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as JournalistResponse));
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des journalistes du pays ${countryId}:`, error);
    return [];
  }
}

// ============================================
// 7. RÉCUPÉRER UN PAYS PAR SON ID
// ============================================

/**
 * Récupère un pays spécifique par son ID
 */
export async function getCountryById(countryId: string): Promise<CountryResponse | null> {
  try {
    const countriesRef = collection(db, 'countries');
    const q = query(countriesRef, where('id', '==', countryId));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn(`⚠️ Pays non trouvé: ${countryId}`);
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as CountryResponse;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du pays ${countryId}:`, error);
    return null;
  }
}

// ============================================
// 8. RÉCUPÉRER TOUS LES JOURNALISTES ET PAYS
// (Pour la galerie au chargement initial)
// ============================================

/**
 * Récupère tous les journalistes et pays nécessaires pour le site
 * Utilisé dans la page d'accueil (index.astro)
 */
export async function getAllData() {
  try {
    const [journalists, countries] = await Promise.all([
      getPublishedJournalists(),
      getCountries(),
    ]);
    
    return {
      journalists,
      countries,
      totalJournalists: journalists.length,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    return {
      journalists: [],
      countries: [],
      totalJournalists: 0,
    };
  }
}