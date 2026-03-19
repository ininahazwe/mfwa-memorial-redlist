import type { APIRoute } from 'astro';
import * as mysql from 'mysql2/promise';

// ============================================
// POOL MYSQL
// ============================================

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
    if (!pool) {
        // @ts-ignore
        const env = (import.meta as any).env as Record<string, string>;
        const url = env.DATABASE_URL ?? process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL manquante');
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
// GET — Liste tous les pays
// ============================================

export const GET: APIRoute = async () => {
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

        return new Response(JSON.stringify({
            data:  rows,
            total: (rows as any[]).length,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

// ============================================
// POST — Créer un pays
// ============================================

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const db   = getPool();

        const id  = body.id ?? body.code?.toLowerCase() ?? `c_${Date.now()}`;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Accepte coords.lat/coords.lng ou lat/lng directement
        const lat = body.coords?.lat ?? body.lat ?? 0;
        const lng = body.coords?.lng ?? body.lng ?? 0;

        await db.execute(
            `INSERT INTO countries (id, name, code, lat, lng, risk_level, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                body.name,
                (body.code ?? 'XX').toUpperCase().slice(0, 2),
                lat,
                lng,
                body.riskLevel ?? body.risk_level ?? 'high',
                body.description ?? null,
                now,
                now,
            ]
        );

        const [rows] = await db.execute(
            'SELECT * FROM countries WHERE id = ?', [id]
        );

        return new Response(JSON.stringify({ data: (rows as any[])[0] }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};