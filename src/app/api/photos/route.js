import { listImages } from '@/lib/driveClient';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Initialize cache with 5 minutes (300 seconds) TTL
const cache = new NodeCache({ stdTTL: 300 });

export const dynamic = 'force-dynamic'; // Always run as serverless function, not static

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId') || process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!folderId) {
            return NextResponse.json({ error: 'DRIVE_FOLDER_ID not configured' }, { status: 500 });
        }

        // Check cache before fetching
        if (cache.has(folderId)) {
            return NextResponse.json(cache.get(folderId));
        }

        const files = await listImages(folderId);

        // Save fresh data to cache
        cache.set(folderId, files);

        return NextResponse.json(files);
    } catch (error) {
        console.error('Error fetching photos:', error);
        return NextResponse.json({ error: 'Failed to fetch photos', details: error.message }, { status: 500 });
    }
}
