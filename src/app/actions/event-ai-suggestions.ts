'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { addEventSuggestion, getEventSuggestions } from './event-budget';

const genkit = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function generateEventSuggestions(
  eventId: string,
  eventTitle: string,
  eventType: string,
  guestCount: number,
  budget: number
) {
  try {
    const model = genkit.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a helpful event planning assistant for South African events.

Generate practical, budget-conscious suggestions for a group event with these details:
- Event: ${eventTitle}
- Type: ${eventType}
- Guests: ${guestCount} people
- Budget: R${budget} total (about R${Math.round(budget / guestCount)} per person)
- Location: South Africa

Please suggest:
1. 3-4 drinks to bring (specific brands if possible, consider South African shops)
2. 3-4 snacks/food items
3. 2-3 essential equipment/items
4. Estimated quantities and prices for each

Format your response as JSON with this structure:
{
  "suggestions": [
    {"type": "DRINK", "title": "Item name", "quantity": "e.g., 2L or 6-pack", "estimatedPrice": 50, "reason": "Why this is good"},
    {"type": "SNACK", "title": "Item name", "quantity": "e.g., 400g", "estimatedPrice": 30, "reason": "Why this is good"},
    ...
  ]
}

Only return valid JSON, no other text.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return { success: false, error: 'Invalid response format' };
    }

    const data = JSON.parse(jsonMatch[0]);
    const suggestions = data.suggestions || [];

    // Save suggestions to database
    for (const suggestion of suggestions) {
      const categoryMap: Record<string, string> = {
        'DRINK': 'DRINKS',
        'SNACK': 'SNACKS',
        'FOOD': 'FOOD',
        'EQUIPMENT': 'EQUIPMENT',
      };

      await addEventSuggestion(
        eventId,
        suggestion.type || 'OTHER',
        suggestion.title,
        {
          description: suggestion.reason || `Suggested for ${eventTitle}`,
          category: categoryMap[suggestion.type] || 'OTHER',
          quantity: suggestion.quantity || '1',
          estimatedPrice: Math.round((suggestion.estimatedPrice || 0) * 100),
          reason: suggestion.reason,
          confidence: 85,
        }
      );
    }

    return { success: true, suggestions: suggestions.length };
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return { success: false, error: 'Failed to generate suggestions' };
  }
}

export async function generateSmartSuggestions(
  eventId: string,
  eventData: {
    title: string;
    description?: string;
    eventType?: string;
    attendeeCount?: number;
    budget?: number;
  }
) {
  const { title, eventType = 'gathering', attendeeCount = 10, budget = 1000 } = eventData;

  // Check if we already have suggestions
  const existing = await getEventSuggestions(eventId);
  if (existing.success && existing.suggestions.length > 0) {
    return { success: true, message: 'Suggestions already exist', count: existing.suggestions.length };
  }

  // Generate new suggestions
  return generateEventSuggestions(eventId, title, eventType, attendeeCount, budget);
}

// Default suggestions for when AI is not available
export const DEFAULT_SUGGESTIONS = [
  {
    type: 'DRINK',
    suggestions: [
      { title: 'Coca-Cola 2L', quantity: '2-3 bottles', price: 40, reason: 'Popular soft drink' },
      { title: 'Appletiser 1L', quantity: '2 bottles', price: 35, reason: 'Healthy juice option' },
      { title: 'Ginger Beer 1.5L', quantity: '1-2 bottles', price: 30, reason: 'Great mixer & standalone' },
      { title: 'Sparkling Water', quantity: '1-2 packs', price: 45, reason: 'Healthier alternative' },
    ],
  },
  {
    type: 'SNACK',
    suggestions: [
      { title: 'Lay\'s Chips Assorted', quantity: '2-3 bags', price: 50, reason: 'Classic party snack' },
      { title: 'Pringles', quantity: '2 tubs', price: 60, reason: 'Long shelf-life snack' },
      { title: 'Biltong', quantity: '500g', price: 80, reason: 'Protein-rich South African snack' },
      { title: 'Nuts Mix', quantity: '500g', price: 70, reason: 'Healthy and satisfying' },
    ],
  },
  {
    type: 'FOOD',
    suggestions: [
      { title: 'Boerewors Bundle', quantity: '6-8 pieces', price: 120, reason: 'South African classic' },
      { title: 'Chicken Breasts', quantity: '1.5kg', price: 150, reason: 'Versatile protein' },
      { title: 'Salad Mix & Dressing', quantity: '2 bags + 1 bottle', price: 60, reason: 'Fresh & healthy' },
      { title: 'Bread Roll Pack', quantity: '1 pack', price: 30, reason: 'For serving' },
    ],
  },
];
