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
// GET — Récupérer un journaliste par ID
// ============================================

export const GET: APIRoute = async ({ params }) => {
    try {
        const db = getPool();
        const [rows] = await db.execute(
            'SELECT * FROM journalists WHERE id = ? LIMIT 1',
            [params.id]
        );

        const list = rows as any[];
        if (list.length === 0) {
            return new Response(JSON.stringify({ error: 'Journaliste non trouvé' }), {
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
// PUT — Modifier un journaliste
// ============================================

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const body = await request.json();
        const db   = getPool();
        const now  = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await db.execute(
            `UPDATE journalists SET
        name           = ?,
        role           = ?,
        photo_url      = ?,
        year_of_death  = ?,
        country_id     = ?,
        country_name   = ?,
        bio            = ?,
        place_of_death = ?,
        circumstances  = ?,
        is_published   = ?,
        updated_at     = ?
      WHERE id = ?`,
            [
                body.name,
                body.role           ?? '',
                body.photoUrl       ?? body.photo_url ?? '',
                body.yearOfDeath    ?? body.year_of_death ?? 0,
                body.countryId      ?? body.country_id ?? null,
                body.countryName    ?? body.country_name ?? null,
                body.bio            ?? null,
                body.placeOfDeath   ?? body.place_of_death ?? null,
                body.circumstances  ?? null,
                body.isPublished    ?? body.is_published ? 1 : 0,
                now,
                params.id,
            ]
        );

        // Retourner l'enregistrement mis à jour
        const [rows] = await db.execute(
            'SELECT * FROM journalists WHERE id = ?', [params.id]
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
// DELETE — Supprimer un journaliste
// ============================================

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const db = getPool();

        await db.execute(
            'DELETE FROM journalists WHERE id = ?',
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