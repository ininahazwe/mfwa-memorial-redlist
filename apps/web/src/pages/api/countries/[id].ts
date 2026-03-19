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
// GET — Récupérer un pays par ID
// ============================================

export const GET: APIRoute = async ({ params }) => {
    try {
        const db = getPool();
        const [rows] = await db.execute(
            'SELECT * FROM countries WHERE id = ? LIMIT 1',
            [params.id]
        );

        const list = rows as any[];
        if (list.length === 0) {
            return new Response(JSON.stringify({ error: 'Pays non trouvé' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ data: list[0] }), {
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
// PUT — Modifier un pays
// ============================================

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const body = await request.json();
        const db   = getPool();
        const now  = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const lat = body.coords?.lat ?? body.lat ?? 0;
        const lng = body.coords?.lng ?? body.lng ?? 0;

        await db.execute(
            `UPDATE countries SET
        name        = ?,
        code        = ?,
        lat         = ?,
        lng         = ?,
        risk_level  = ?,
        description = ?,
        updated_at  = ?
      WHERE id = ?`,
            [
                body.name,
                (body.code ?? 'XX').toUpperCase().slice(0, 2),
                lat,
                lng,
                body.riskLevel ?? body.risk_level ?? 'high',
                body.description ?? null,
                now,
                params.id,
            ]
        );

        const [rows] = await db.execute(
            'SELECT * FROM countries WHERE id = ?', [params.id]
        );

        return new Response(JSON.stringify({ data: (rows as any[])[0] }), {
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
// DELETE — Supprimer un pays
// ============================================

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const db = getPool();

        await db.execute(
            'DELETE FROM countries WHERE id = ?',
            [params.id]
        );

        return new Response(JSON.stringify({ success: true }), {
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