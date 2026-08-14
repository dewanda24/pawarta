import { db } from '@/db';
import { apiKeys, apiLogs } from '@/db/schema/integration';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function authenticateApiRequest(req: Request, endpoint: string) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  
  // Dalam production, token yang masuk (raw) harus dihash lalu dicocokkan dengan tokenHash di DB
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.tokenHash, tokenHash), eq(apiKeys.isAktif, true)));

  if (!apiKey) {
    return { error: 'Invalid API Key', status: 401 };
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return { error: 'API Key expired', status: 401 };
  }

  // Log API Request asynchronously (don't await to not block the request)
  db.insert(apiLogs).values({
    apiKeyId: apiKey.id,
    endpoint,
    method: req.method,
    statusCode: '200', // Update later if needed
    ipAddress: headersList.get('x-forwarded-for') || 'Unknown',
  }).execute().catch(console.error);

  // Update last used asynchronously
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))
    .execute().catch(console.error);

  return { apiKey };
}
