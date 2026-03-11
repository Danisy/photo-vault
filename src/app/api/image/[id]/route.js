import { getFileStream } from '@/lib/driveClient';

export async function GET(request, { params }) {
    try {
        const fileId = params.id;
        const stream = await getFileStream(fileId);

        // Pass the stream through to the client
        // Ensure you return a Response with the stream
        return new Response(stream, {
            headers: {
                // 'Content-Type': 'image/jpeg', // Google Drive usually infers MIME type correctly but we can omit or pass
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return new Response('Failed to fetch image', { status: 500 });
    }
}
