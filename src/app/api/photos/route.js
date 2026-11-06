import { listImages } from '@/lib/driveClient';
import { checkRateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Initialize cache with 5 minutes (300 seconds) TTL
const cache = new NodeCache({ stdTTL: 300 });

export const dynamic = 'force-dynamic'; // Always run as serverless function, not static

export async function GET(request) {
    try {
        if (!checkRateLimit(request, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId') || process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!folderId) {
            console.error('Public gallery folder is not configured');
            return NextResponse.json({ error: 'Gallery is temporarily unavailable' }, { status: 500 });
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
        const status = error.message.startsWith('Invalid ') ||
            error.message.includes('outside the public gallery') ? 400 : 500;
        return NextResponse.json({ error: status === 400 ? 'Invalid gallery folder' : 'Failed to fetch photos' }, { status });
    }
}
