import * as mysql from 'mysql2/promise';
import type { Journalist, Country } from '../../../../packages/shared';

// ============================================
// 1. TYPES DE RÉPONSE
// (Country et Journalist ont déjà id dans shared/types)
// ============================================

export type JournalistResponse = Journalist;
export type CountryResponse    = Country;

// ============================================
// 2. CONNEXION MYSQL (pool réutilisable)
// ============================================

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    // Astro injecte toutes les variables .env via import.meta.env (SSR inclus)
    // On cast en 'any' pour contourner la vérification statique TypeScript
    // @ts-ignore
    const env = (import.meta as any).env as Record<string, string>;
    const url: string | undefined = env.DATABASE_URL ?? process.env.DATABASE_URL;

    if (!url) {
      throw new Error('❌ Variable DATABASE_URL manquante dans .env');
    }

    const u = new URL(url);

    pool = (mysql as any).createPool({
      host:                  u.hostname,
      port:                  Number(u.port) || 3306,
      user:                  decodeURIComponent(u.username),
      password:              decodeURIComponent(u.password),
      database:              u.pathname.replace('/', ''),
      waitForConnections:    true,
      connectionLimit:       5,
      charset:               'utf8mb4',
      enableKeepAlive:       true,
      keepAliveInitialDelay: 10000,
      connectTimeout:        30000,
    }) as mysql.Pool;
  }

  return pool;
}

// ============================================
// 3. HELPER — Ligne DB → Journalist
// ============================================

function rowToJournalist(row: any): JournalistResponse {
  return {
    id:            row.id,
    name:          row.name,
    role:          row.role,
    photoUrl:      row.photo_url,
    yearOfDeath:   row.year_of_death,
    countryId:     row.country_id,
    countryName:   row.country_name ?? undefined,
    bio:           row.bio ?? undefined,
    placeOfDeath:  row.place_of_death ?? undefined,
    circumstances: row.circumstances ?? undefined,
    isPublished:   Boolean(row.is_published),
    createdAt:     new Date(row.created_at),
    updatedAt:     new Date(row.updated_at),
  };
}

// ============================================
// 4. HELPER — Ligne DB → Country
// ============================================

function rowToCountry(row: any): CountryResponse {
  return {
    id:              row.id,
    name:            row.name,
    code:            row.code,
    coords: {
      lat: Number(row.lat),
      lng: Number(row.lng),
    },
    riskLevel:       row.risk_level,
    description:     row.description ?? '',
    journalistCount: row.journalist_count ? Number(row.journalist_count) : 0,
    createdAt:       new Date(row.created_at),
    updatedAt:       new Date(row.updated_at),
  };
}

// ============================================
// 5. RÉCUPÉRER LES JOURNALISTES PUBLIÉS
// ============================================

export async function getPublishedJournalists(): Promise<JournalistResponse[]> {
  try {
    const db = getPool();
    const [rows] = await db.execute(
        'SELECT * FROM journalists WHERE is_published = 1 ORDER BY year_of_death DESC'
    );
    return (rows as any[]).map(rowToJournalist);
  } catch (error) {
    console.error('❌ getPublishedJournalists:', error);
    return [];
  }
}

// ============================================
// 6. RÉCUPÉRER UN JOURNALISTE PAR ID
// ============================================

export async function getJournalistById(id: string): Promise<JournalistResponse | null> {
  try {
    const db = getPool();
    const [rows] = await db.execute(
        'SELECT * FROM journalists WHERE id = ? AND is_published = 1 LIMIT 1',
        [id]
    );
    const list = rows as any[];
    if (list.length === 0) {
      console.warn(`⚠️ Journaliste non trouvé: ${id}`);
      return null;
    }
    return rowToJournalist(list[0]);
  } catch (error) {
    console.error(`❌ getJournalistById(${id}):`, error);
    return null;
  }
}

// ============================================
// 7. RÉCUPÉRER LES JOURNALISTES D'UN PAYS
// ============================================

export async function getJournalistsByCountry(countryId: string): Promise<JournalistResponse[]> {
  try {
    const db = getPool();
    const [rows] = await db.execute(
        'SELECT * FROM journalists WHERE country_id = ? AND is_published = 1 ORDER BY year_of_death DESC',
        [countryId]
    );
    return (rows as any[]).map(rowToJournalist);
  } catch (error) {
    console.error(`❌ getJournalistsByCountry(${countryId}):`, error);
    return [];
  }
}

// ============================================
// 8. RÉCUPÉRER LES PAYS (avec compteur journalistes)
// ============================================

export async function getCountries(): Promise<CountryResponse[]> {
  try {
    const db = getPool();
    const [rows] = await db.execute(`
      SELECT
        c.*,
        COUNT(j.id) AS journalist_count
      FROM countries c
             LEFT JOIN journalists j
                       ON j.country_id = c.id AND j.is_published = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return (rows as any[]).map(rowToCountry);
  } catch (error) {
    console.error('❌ getCountries:', error);
    return [];
  }
}

// ============================================
// 9. RÉCUPÉRER UN PAYS PAR ID
// ============================================

export async function getCountryById(countryId: string): Promise<CountryResponse | null> {
  try {
    const db = getPool();
    const [rows] = await db.execute(
        'SELECT * FROM countries WHERE id = ? LIMIT 1',
        [countryId]
    );
    const list = rows as any[];
    if (list.length === 0) {
      console.warn(`⚠️ Pays non trouvé: ${countryId}`);
      return null;
    }
    return rowToCountry(list[0]);
  } catch (error) {
    console.error(`❌ getCountryById(${countryId}):`, error);
    return null;
  }
}

// ============================================
// 10. TOUT RÉCUPÉRER (page d'accueil)
// ============================================

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
    console.error('❌ getAllData:', error);
    return {
      journalists:     [],
      countries:       [],
      totalJournalists: 0,
    };
  }
}