import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing API Key' }, { status: 400 });
    }

    // Validate the API key exists
    const validKeys = await db.select().from(apiKeys).where(eq(apiKeys.key, apiKey));
    
    if (validKeys.length === 0 || validKeys[0].status !== 'active') {
      return NextResponse.json({ success: false, error: 'Invalid or inactive API Key' }, { status: 401 });
    }

    // If valid, export a list of users (to act as friends)
    const allUsers = await db.select().from(users);

    const contacts = allUsers.map(u => ({
      name: u.name || 'Unknown',
      email: u.email,
      emoji: '😎'
    }));

    return NextResponse.json({
      success: true,
      contacts: contacts
    });

  } catch (error: any) {
    console.error('API /api/friends/export error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
