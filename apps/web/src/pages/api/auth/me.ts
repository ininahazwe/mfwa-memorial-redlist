import type { APIRoute } from 'astro';
// @ts-ignore
import jwt from 'jsonwebtoken';

export const GET: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return new Response(JSON.stringify({ error: 'Token manquant' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // @ts-ignore
        const env = (import.meta as any).env as Record<string, string>;
        const secret = env.JWT_SECRET ?? process.env.JWT_SECRET ?? 'fallback-secret-change-me';

        const decoded = jwt.verify(token, secret) as any;

        return new Response(JSON.stringify({
            user: {
                id:    decoded.id,
                email: decoded.email,
                name:  decoded.name,
            },
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};