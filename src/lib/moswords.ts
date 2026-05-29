export interface MosWordMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: Date;
}

export const slangDictionary: Record<string, string> = {
  "Aweh": "Hello / Cool",
  "Sharp sharp": "All good / Yes",
  "Braai": "Barbecue",
  "Lekker": "Great / Delicious",
  "Gees": "Good vibes / Energy",
  "Chow": "Eat"
};

const fallbackMessages: MosWordMessage[] = [
  { id: '1', sender: 'AwehChat Bot', avatar: '🤖', text: 'Aweh! The event is looking lekker. Everyone got the memo?', timestamp: new Date() },
  { id: '2', sender: 'AwehChat Bot', avatar: '🤖', text: 'Sharp sharp. Make sure to check the supplies list before you arrive.', timestamp: new Date(Date.now() - 60000) },
];

export async function fetchLiveMosWords(): Promise<MosWordMessage[]> {
  try {
    const res = await fetch('https://www.awehchat.co.za/api/moswords', { cache: 'no-store' });
    if (!res.ok) throw new Error('API Offline');
    return await res.json();
  } catch (error) {
    return fallbackMessages;
  }
}
