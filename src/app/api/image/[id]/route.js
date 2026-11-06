import { getFileStream } from '@/lib/driveClient';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request, { params }) {
    try {
        if (!checkRateLimit(request, 120)) {
            return new Response('Too many requests', { status: 429 });
        }

        const fileId = params.id;
        const { stream, mimeType } = await getFileStream(fileId);

        return new Response(stream, {
            headers: {
                'Content-Type': mimeType,
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        const status = error.message.startsWith('Invalid ') ||
            error.message.includes('outside the public image gallery') ? 404 : 500;
        return new Response(status === 404 ? 'Image not found' : 'Failed to fetch image', { status });
    }
}
