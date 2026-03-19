import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = 'public/uploads/journalists';
const MAX_SIZE = 2 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { data, type, name } = body;

        if (!data) return json({ error: 'Aucun fichier reçu' }, 400);
        if (!['image/jpeg', 'image/png'].includes(type))
            return json({ error: 'Format accepté : JPG ou PNG uniquement' }, 400);

        const buffer = Buffer.from(data, 'base64');
        if (buffer.length > MAX_SIZE)
            return json({ error: 'La photo ne doit pas dépasser 2 MB' }, 400);

        const uploadPath = join(process.cwd(), UPLOAD_DIR);
        await mkdir(uploadPath, { recursive: true });

        const ext = type === 'image/png' ? '.png' : '.jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        await writeFile(join(uploadPath, fileName), buffer);

        return json({ url: `/uploads/journalists/${fileName}`, fileName }, 201);

    } catch (error: any) {
        return json({ error: error.message }, 500);
    }
};

function json(data: object, status: number) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}