const requests = new Map();

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 10000;

export const checkRateLimit = (request, limit) => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const address = forwardedFor?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';
    const now = Date.now();
    const current = requests.get(address);

    if (!current || now - current.startedAt >= WINDOW_MS) {
        if (requests.size >= MAX_ENTRIES) {
            for (const [key, value] of requests) {
                if (now - value.startedAt >= WINDOW_MS) requests.delete(key);
            }
        }
        requests.set(address, { startedAt: now, count: 1 });
        return true;
    }

    if (current.count >= limit) return false;
    current.count += 1;
    return true;
};
