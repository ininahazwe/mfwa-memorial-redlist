// ============================================
// API — POST /api/auth/login
// Location : apps/web/src/pages/api/auth/login.ts
// ============================================

import type { APIRoute } from 'astro';
import * as mysql from 'mysql2/promise';
// @ts-ignore
import bcrypt from 'bcryptjs';
// @ts-ignore
import jwt from 'jsonwebtoken';

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
// POST — Login
// ============================================

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email et mot de passe requis' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Chercher l'utilisateur
        const db = getPool();
        const [rows] = await db.execute(
            'SELECT * FROM admin_users WHERE email = ? LIMIT 1',
            [email]
        );

        const users = rows as any[];
        if (users.length === 0) {
            return new Response(JSON.stringify({ error: 'Identifiants incorrects' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return new Response(JSON.stringify({ error: 'Identifiants incorrects' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Générer le JWT (8h)
        // @ts-ignore
        const env = (import.meta as any).env as Record<string, string>;
        const secret = env.JWT_SECRET ?? process.env.JWT_SECRET ?? 'fallback-secret-change-me';

        const token = jwt.sign(
            {
                id:    user.id,
                email: user.email,
                name:  user.name,
            },
            secret,
            { expiresIn: '8h' }
        );

        return new Response(JSON.stringify({
            token,
            user: {
                id:    user.id,
                email: user.email,
                name:  user.name,
            },
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
