// API Route: Generate AI Spy Words using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate 10 pairs of words for a spy/imposter party game. Context: ${context}

Rules:
1. Each pair has: "civilians" (the real word) and "spy" (a similar but slightly wrong variant)
2. Words should be culturally relevant to the context
3. The spy word should be close enough that the spy can try to blend in, but different enough that civilians will notice
4. Output ONLY valid JSON array in this format:
[
  {"civilians": "Gatsby", "spy": "Hot Dog"},
  {"civilians": "Table Mountain", "spy": "Signal Hill"},
  ...
]

Examples for Cape Town:
- Gatsby vs Hot Dog (similar food but totally different)
- Biltong vs Jerky  
- Braai vs BBQ
- Robot vs Traffic Light
- Bakkie vs Truck

Generate 10 pairs now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const wordPairs = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ 
      success: true, 
      wordPairs 
    });

  } catch (error) {
    console.error('AI generation error:', error);
    
    // Fallback pairs
    const fallbackPairs = [
      {"civilians": "Gatsby", "spy": "Hot Dog"},
      {"civilians": "Braai", "spy": "BBQ"},
      {"civilians": "Biltong", "spy": "Jerky"},
      {"civilians": "Robot", "spy": "Traffic Light"},
      {"civilians": "Bakkie", "spy": "Truck"},
      {"civilians": "Table Mountain", "spy": "Signal Hill"},
      {"civilians": "Loadshedding", "spy": "Power Outage"},
      {"civilians": "Lekker", "spy": "Nice"},
      {"civilians": "Howzit", "spy": "Hello"},
      {"civilians": "Shame", "spy": "Aww"}
    ];

    return NextResponse.json({ 
      success: true, 
      wordPairs: fallbackPairs 
    });
  }
}
