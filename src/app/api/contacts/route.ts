import { NextRequest, NextResponse } from 'next/server';

const MOSWORDS_API_KEY = process.env.MOSWORDS_API_KEY;
const NEXUS_API_KEY = process.env.NEXUS_API_KEY;
const MOSWORDS_API_URL = process.env.MOSWORDS_API_URL || 'https://www.awehchat.co.za/api';

interface Contact {
  name: string;
  phone?: string;
  email?: string;
  source: 'moswords' | 'nexus' | 'familyverse';
  avatar?: string;
}

async function getMosWordsContacts(): Promise<Contact[]> {
  if (!MOSWORDS_API_KEY) return [];
  try {
    const res = await fetch(`${MOSWORDS_API_URL}/contacts`, {
      headers: {
        'Authorization': `Bearer ${MOSWORDS_API_KEY}`,
        'X-API-Key': MOSWORDS_API_KEY,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.contacts || data || [];
    return list.map((c: any) => ({
      name: c.name || c.displayName || 'Unknown',
      phone: c.phone || c.phoneNumber,
      email: c.email,
      source: 'moswords' as const,
      avatar: c.avatar || c.profilePicture,
    }));
  } catch {
    return [];
  }
}

async function getNexusContacts(): Promise<Contact[]> {
  if (!NEXUS_API_KEY) return [];
  try {
    const res = await fetch('https://nexus.familyverse.co.za/api/contacts', {
      headers: {
        'Authorization': `Bearer ${NEXUS_API_KEY}`,
        'X-API-Key': NEXUS_API_KEY,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.contacts || data || [];
    return list.map((c: any) => ({
      name: c.name || c.fullName,
      phone: c.phone,
      email: c.email,
      source: 'nexus' as const,
      avatar: c.avatar,
    }));
  } catch {
    return [];
  }
}

function mergeContacts(contactArrays: Contact[][]): Contact[] {
  const merged = new Map<string, Contact>();
  for (const contacts of contactArrays) {
    for (const contact of contacts) {
      const key = contact.phone?.replace(/\D/g, '') || contact.email || contact.name;
      if (!merged.has(key)) {
        merged.set(key, contact);
      } else {
        const existing = merged.get(key)!;
        merged.set(key, { ...existing, ...contact, source: existing.source });
      }
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sources = searchParams.get('sources')?.split(',') || ['moswords', 'nexus'];

  const [moswordsContacts, nexusContacts] = await Promise.all([
    sources.includes('moswords') ? getMosWordsContacts() : Promise.resolve([]),
    sources.includes('nexus') ? getNexusContacts() : Promise.resolve([]),
  ]);

  const merged = mergeContacts([moswordsContacts, nexusContacts]);

  return NextResponse.json({
    contacts: merged,
    sources: {
      moswords: moswordsContacts.length,
      nexus: nexusContacts.length,
    },
    total: merged.length,
  });
}
