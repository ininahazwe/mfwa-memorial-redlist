// ============================================
// TYPES PARTAGÉS - MÉMOIRE VIVE
// ============================================
// Utilisé par web/ et admin/
// Location: packages/shared/types.ts

// Note: Timestamp est défini dans les fichiers qui l'utilisent (admin, web)
// Ici on type comme Date | any pour une meilleure compatibilité

// ============================================
// JOURNALISTE
// ============================================

export interface Journalist {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  yearOfDeath: number;
  countryId: string;
  countryName?: string; // Optionnel (dénormalisation)
  bio?: string;
  placeOfDeath?: string;
  circumstances?: string;
  isPublished: boolean;
  createdAt: Date | any; // Firebase Timestamp ou Date JS
  updatedAt: Date | any; // Firebase Timestamp ou Date JS
}

// Pour les formulaires (sans id ni timestamps)
export type JournalistFormData = Omit<
  Journalist,
  'id' | 'createdAt' | 'updatedAt'
>;

// ============================================
// PAYS
// ============================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export type RiskLevel = 'high' | 'critical' | 'extreme';

export interface Country {
  id: string;
  name: string;
  code: string; // Code ISO 3166-1 alpha-2 (ex: ML, SN)
  coords: Coordinates;
  riskLevel: RiskLevel;
  description: string;
  journalistCount?: number; // Optionnel (calculé ou dénormalisé)
  createdAt: Date | any; // Firebase Timestamp ou Date JS
  updatedAt: Date | any; // Firebase Timestamp ou Date JS
}

// Pour les formulaires (sans id ni timestamps)
export type CountryFormData = Omit<
  Country,
  'id' | 'createdAt' | 'updatedAt' | 'journalistCount'
>;

// ============================================
// CONSTANTES UI - RISK LEVELS
// ============================================

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  high: 'Élevé',
  critical: 'Critique',
  extreme: 'Extrême',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  high: '#c4a77d',
  critical: '#d4845f',
  extreme: '#a65d57',
};

export const RISK_LEVEL_EMOJIS: Record<RiskLevel, string> = {
  high: '🟡',
  critical: '🟠',
  extreme: '🔴',
};

// ============================================
// ADMIN USER
// ============================================

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin'; // Pour l'avenir (moderator, viewer, etc.)
  createdAt: Date | any; // Firebase Timestamp ou Date JS
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    name: string;
    message: string;
  };
}

export type ApiListResponse<T> = ApiResponse<T[]> & { total?: number };