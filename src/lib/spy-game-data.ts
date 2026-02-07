// Spy Game Categories Data
export const CATEGORIES = {
  Countries: [
    "South Africa",
    "Nigeria",
    "Egypt",
    "Kenya",
    "Morocco",
    "Ghana",
    "Ethiopia",
    "Tanzania",
    "Uganda",
    "Zimbabwe",
    "Botswana",
    "Namibia",
    "Zambia",
    "Senegal",
    "Rwanda",
    "Tunisia",
    "Algeria",
    "Mozambique",
    "Angola",
    "Ivory Coast",
    "Madagascar",
    "Cameroon"
  ],
  Objects: [
    "Laptop",
    "Phone",
    "Watch",
    "Wallet",
    "Keys",
    "Glasses",
    "Backpack",
    "Umbrella",
    "Book",
    "Pen",
    "Cup",
    "Plate",
    "Fork",
    "Spoon",
    "Bottle",
    "Chair",
    "Table",
    "Lamp",
    "Mirror",
    "Clock",
    "Remote",
    "Pillow"
  ],
  Sports: [
    "Golf",
    "Tennis",
    "Rugby",
    "Cricket",
    "Soccer",
    "Basketball",
    "Hockey",
    "Swimming",
    "Running",
    "Boxing",
    "Cycling",
    "Surfing",
    "Skateboarding",
    "Volleyball",
    "Baseball",
    "Badminton",
    "Squash",
    "Rowing",
    "Wrestling",
    "Karate",
    "Judo",
    "Archery"
  ],
  Places: [
    "Beach",
    "Mountain",
    "Desert",
    "Forest",
    "City",
    "Airport",
    "Hospital",
    "School",
    "Mall",
    "Park",
    "Library",
    "Museum",
    "Restaurant",
    "Hotel",
    "Cinema",
    "Stadium",
    "Church",
    "Mosque",
    "Temple",
    "Bridge",
    "Harbor",
    "Station"
  ],
  Animals: [
    "Lion",
    "Elephant",
    "Giraffe",
    "Zebra",
    "Rhino",
    "Hippo",
    "Cheetah",
    "Leopard",
    "Buffalo",
    "Monkey",
    "Gorilla",
    "Sheep",
    "Cow",
    "Horse",
    "Dog",
    "Cat",
    "Bird",
    "Fish",
    "Snake",
    "Crocodile",
    "Shark",
    "Whale"
  ],
  Transport: [
    "Car",
    "Bus",
    "Train",
    "Plane",
    "Boat",
    "Ship",
    "Bicycle",
    "Motorcycle",
    "Helicopter",
    "Submarine",
    "Taxi",
    "Truck",
    "Van",
    "Scooter",
    "Tram",
    "Ferry",
    "Yacht",
    "Jet",
    "Rocket",
    "Ambulance",
    "Tractor",
    "Skateboard"
  ]
};

export type CategoryName = keyof typeof CATEGORIES;

// Sub-category hints for the "Nudge" system
export const HINTS: Record<string, string[]> = {
  // Countries
  "South Africa": ["It's in Africa", "It has three capitals", "It has diverse wildlife"],
  "Nigeria": ["Most populous in Africa", "It's in West Africa", "Oil-rich nation"],
  "Egypt": ["Ancient pyramids", "Nile River flows through it", "North African country"],
  
  // Objects
  "Laptop": ["You can type on it", "It's portable", "Has a screen"],
  "Phone": ["You call with it", "Fits in your pocket", "Has apps"],
  "Watch": ["You wear it", "Tells time", "On your wrist"],
  
  // Sports
  "Golf": ["Use clubs", "18 holes", "Small white ball"],
  "Tennis": ["Use a racket", "Yellow ball", "Game, set, match"],
  "Rugby": ["Oval ball", "Scrums and tackles", "Try to score"],
  
  // Places
  "Beach": ["Near water", "Sandy", "People swim here"],
  "Mountain": ["Very high", "You can climb it", "Snow on top"],
  "Desert": ["Very dry", "Lots of sand", "Few plants"],
  
  // Animals
  "Lion": ["King of the jungle", "Has a mane", "Big cat"],
  "Elephant": ["Very large", "Has a trunk", "Never forgets"],
  "Giraffe": ["Very tall", "Long neck", "Spots on body"],
  
  // Transport
  "Car": ["Four wheels", "You drive it", "Needs petrol"],
  "Bus": ["Many seats", "Public transport", "Stops at stations"],
  "Train": ["Runs on tracks", "Many carriages", "Fast transport"],
};

// Get a random hint for a word
export function getRandomHint(word: string): string {
  const hints = HINTS[word];
  if (!hints || hints.length === 0) {
    return "Think about the category...";
  }
  return hints[Math.floor(Math.random() * hints.length)];
}

// Get a random word from a category
export function getRandomWord(category: CategoryName): string {
  const words = CATEGORIES[category];
  return words[Math.floor(Math.random() * words.length)];
}

// AI-Generated Category Storage
let aiGeneratedWords: { civilians: string; spy: string }[] = [];

// Generate AI-powered category using Gemini (Upgrade 3)
export async function generateAICategory(context: string): Promise<boolean> {
  try {
    const response = await fetch('/api/generate-spy-words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    aiGeneratedWords = data.wordPairs || [];
    
    // Add Vibe Check category dynamically
    (CATEGORIES as any)["Vibe Check"] = aiGeneratedWords.map((pair: any) => pair.civilians);
    
    return aiGeneratedWords.length > 0;
  } catch (error) {
    console.error('AI generation error:', error);
    return false;
  }
}

// Get spy variant for a word (for AI categories)
export function getSpyVariant(civilianWord: string): string | undefined {
  const pair = aiGeneratedWords.find((p) => p.civilians === civilianWord);
  return pair?.spy;
}
