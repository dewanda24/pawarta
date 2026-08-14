import { NextResponse } from 'next/server';
import { db } from '@/db';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { archives } from '@/db/schema/archive';
import { authenticateApiRequest } from '@/lib/api-auth';
import { sql } from 'drizzle-orm';

export async function GET(req: Request) {
  const auth = await authenticateApiRequest(req, '/api/v1/reports/summary');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // 1. Total Incoming Letters
    const [incomingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(incomingLetters);

    // 2. Total Outgoing Letters
    const [outgoingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(outgoingLetters);

    // 3. Total Archives
    const [archiveCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(archives);

    return NextResponse.json({
      success: true,
      data: {
        suratMasuk: incomingCount?.count || 0,
        suratKeluar: outgoingCount?.count || 0,
        arsipDigital: archiveCount?.count || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
