// Enhanced video content library for FamilyVerse
export interface VideoContent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
  duration: string;
  category: 'family-fun' | 'educational' | 'storytelling' | 'music' | 'exercise' | 'crafts';
  ageRange: string;
  rating: number;
  tags: string[];
  educational: boolean;
}

export const familyVideos: VideoContent[] = [
  // Family Fun Videos
  {
    id: "v1",
    title: "Family Cooking Challenge",
    description: "Follow along with fun family cooking challenges. Learn to make simple, delicious recipes together!",
    thumbnailUrl: "https://images.unsplash.com/photo-1556910110-a5a63dfd393c?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "15:30",
    category: "family-fun",
    ageRange: "5-99 years",
    rating: 4.9,
    tags: ["cooking", "family bonding", "life skills"],
    educational: true,
  },
  {
    id: "v2",
    title: "Backyard Adventure Games",
    description: "Exciting outdoor games for the whole family. Get moving and have fun together!",
    thumbnailUrl: "https://images.unsplash.com/photo-1503525148566-ef5c2b9c93bd?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "12:45",
    category: "exercise",
    ageRange: "4-99 years",
    rating: 4.8,
    tags: ["outdoor", "exercise", "teamwork"],
    educational: false,
  },
  {
    id: "v3",
    title: "Family Game Night Ideas",
    description: "Creative indoor games that bring families closer. No equipment needed!",
    thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "18:20",
    category: "family-fun",
    ageRange: "6-99 years",
    rating: 4.9,
    tags: ["indoor", "games", "bonding"],
    educational: false,
  },
  
  // Educational Videos
  {
    id: "v4",
    title: "Science Experiments at Home",
    description: "Amazing science experiments using common household items. Safe and educational!",
    thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "20:15",
    category: "educational",
    ageRange: "6-14 years",
    rating: 4.9,
    tags: ["science", "experiments", "STEM"],
    educational: true,
  },
  {
    id: "v5",
    title: "Math Magic Tricks",
    description: "Learn cool math tricks that look like magic! Make math fun and engaging.",
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "14:30",
    category: "educational",
    ageRange: "8-16 years",
    rating: 4.7,
    tags: ["math", "problem solving", "critical thinking"],
    educational: true,
  },
  
  // Storytelling Videos
  {
    id: "v6",
    title: "Bedtime Stories: Adventures Await",
    description: "Calming bedtime stories with positive messages. Perfect for winding down.",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "25:00",
    category: "storytelling",
    ageRange: "3-10 years",
    rating: 4.8,
    tags: ["stories", "bedtime", "imagination"],
    educational: true,
  },
  {
    id: "v7",
    title: "Family History Stories",
    description: "Learn how to share and preserve your family stories. Build connections across generations.",
    thumbnailUrl: "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "16:45",
    category: "storytelling",
    ageRange: "10-99 years",
    rating: 4.9,
    tags: ["family history", "heritage", "storytelling"],
    educational: true,
  },
  
  // Music & Dance
  {
    id: "v8",
    title: "Family Dance Party",
    description: "Learn fun dance moves the whole family can enjoy! Get active and silly together.",
    thumbnailUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "22:30",
    category: "music",
    ageRange: "3-99 years",
    rating: 4.8,
    tags: ["dance", "music", "exercise"],
    educational: false,
  },
  {
    id: "v9",
    title: "Learn to Play Together",
    description: "Simple musical instruments you can make and play as a family.",
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "19:15",
    category: "music",
    ageRange: "5-99 years",
    rating: 4.7,
    tags: ["music", "instruments", "creativity"],
    educational: true,
  },
  
  // Arts & Crafts
  {
    id: "v10",
    title: "DIY Family Crafts",
    description: "Creative craft projects using recycled materials. Fun for all ages!",
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "28:00",
    category: "crafts",
    ageRange: "4-99 years",
    rating: 4.9,
    tags: ["crafts", "creativity", "recycling"],
    educational: true,
  },
  {
    id: "v11",
    title: "Family Art Challenge",
    description: "Drawing and painting challenges for everyone! No artistic skills required.",
    thumbnailUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "17:30",
    category: "crafts",
    ageRange: "5-99 years",
    rating: 4.8,
    tags: ["art", "drawing", "creativity"],
    educational: true,
  },
  
  // Exercise & Movement
  {
    id: "v12",
    title: "Yoga for Families",
    description: "Gentle yoga poses the whole family can do together. Promote mindfulness and flexibility.",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "20:00",
    category: "exercise",
    ageRange: "6-99 years",
    rating: 4.9,
    tags: ["yoga", "mindfulness", "exercise"],
    educational: true,
  },
];

export function getVideosByCategory(category: VideoContent['category']): VideoContent[] {
  return familyVideos.filter(video => video.category === category);
}

export function getVideosByAgeRange(minAge: number, maxAge: number): VideoContent[] {
  return familyVideos.filter(video => {
    const [min, max] = video.ageRange.split('-').map(s => parseInt(s.replace(/\D/g, '')));
    return minAge >= min && maxAge <= max;
  });
}

export function getEducationalVideos(): VideoContent[] {
  return familyVideos.filter(video => video.educational);
}
