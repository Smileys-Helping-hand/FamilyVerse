// Family party games and activities data
export interface PartyGame {
  id: string;
  name: string;
  description: string;
  category: 'icebreaker' | 'trivia' | 'drawing' | 'acting' | 'word' | 'physical' | 'creative';
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  ageRange: string;
  difficulty: 'easy' | 'medium' | 'hard';
  materials: string[];
  instructions: string[];
  variations: string[];
  funFactor: number;
  thumbnailUrl?: string;
}

export const partyGames: PartyGame[] = [
  // Icebreaker Games
  {
    id: "g1",
    name: "Two Truths and a Lie",
    description: "Each person shares three statements about themselves - two true and one false. Others guess which is the lie!",
    category: "icebreaker",
    minPlayers: 3,
    maxPlayers: 20,
    duration: "15-30 min",
    ageRange: "8-99 years",
    difficulty: "easy",
    materials: ["None"],
    instructions: [
      "Sit in a circle or gather around",
      "First player shares three statements about themselves",
      "Two statements must be TRUE, one must be FALSE",
      "Other players vote on which statement is the lie",
      "The player reveals the truth!",
      "Move to the next player and repeat"
    ],
    variations: [
      "Time limit: Give 30 seconds to guess",
      "Points system: Award points for correct guesses",
      "Theme rounds: Focus on childhood, travel, or hobbies"
    ],
    funFactor: 4.7,
    thumbnailUrl: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&h=300&fit=crop"
  },
  
  {
    id: "g2",
    name: "Family Charades",
    description: "Act out words or phrases without speaking while your team tries to guess!",
    category: "acting",
    minPlayers: 4,
    maxPlayers: 20,
    duration: "20-45 min",
    ageRange: "6-99 years",
    difficulty: "easy",
    materials: ["Paper", "Pen", "Timer (optional)"],
    instructions: [
      "Write down words/phrases on paper slips (movies, animals, actions, etc.)",
      "Divide into two teams",
      "One player draws a slip and acts it out without speaking",
      "Their team has 60 seconds to guess",
      "Correct guess = 1 point",
      "Team with most points wins!"
    ],
    variations: [
      "Family theme: Only act out family inside jokes or memories",
      "Reverse charades: Whole team acts, one person guesses",
      "Sound effects allowed: Add noises but no words",
      "Speed round: 30 seconds per turn"
    ],
    funFactor: 4.9,
    thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop"
  },

  {
    id: "g3",
    name: "Pictionary Party",
    description: "Draw pictures to help your team guess the word before time runs out!",
    category: "drawing",
    minPlayers: 4,
    maxPlayers: 16,
    duration: "30-60 min",
    ageRange: "7-99 years",
    difficulty: "easy",
    materials: ["Paper/whiteboard", "Markers/pencils", "Word cards", "Timer"],
    instructions: [
      "Prepare word cards with various difficulty levels",
      "Split into teams of 2-4 players",
      "One person draws while their team guesses",
      "No letters, numbers, or speaking allowed!",
      "60 seconds per turn",
      "First team to 10 points wins"
    ],
    variations: [
      "One-line challenge: Draw without lifting the pen",
      "Eyes closed: Draw with eyes closed for 10 seconds",
      "Team relay: Each person adds to the drawing",
      "Categories: Animals, movies, actions, food only"
    ],
    funFactor: 4.8,
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"
  },

  // Trivia Games
  {
    id: "g4",
    name: "Family Trivia Challenge",
    description: "Test your knowledge of family history, memories, and fun facts!",
    category: "trivia",
    minPlayers: 2,
    maxPlayers: 20,
    duration: "30-45 min",
    ageRange: "8-99 years",
    difficulty: "medium",
    materials: ["Trivia question cards", "Paper", "Pen"],
    instructions: [
      "Prepare questions about family members, shared experiences, and general trivia",
      "Form teams or play individually",
      "Ask questions in rounds: Family History, Pop Culture, Science, Geography",
      "1 point for easy questions, 2 for medium, 3 for hard",
      "Bonus round: Double points for the final question",
      "Highest score wins!"
    ],
    variations: [
      "Generational rounds: Questions from different decades",
      "Photo trivia: Guess who from old family photos",
      "Music round: Name that tune from different eras",
      "Lightning round: Quick-fire questions for 2 minutes"
    ],
    funFactor: 4.6,
    thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop"
  },

  // Word Games
  {
    id: "g5",
    name: "Story Builder",
    description: "Create hilarious stories together, one word at a time!",
    category: "word",
    minPlayers: 3,
    maxPlayers: 10,
    duration: "15-30 min",
    ageRange: "6-99 years",
    difficulty: "easy",
    materials: ["None (or paper to write it down)"],
    instructions: [
      "Sit in a circle",
      "First person starts with one word",
      "Next person adds another word to continue the story",
      "Keep going around the circle",
      "Try to make it make sense (or keep it silly!)",
      "When the story feels complete, start a new one"
    ],
    variations: [
      "Three-word turns: Say three words per turn",
      "Genre challenge: Start with 'Once upon a time' or 'In space'",
      "Character focus: Everyone plays a character",
      "Timed turns: Only 5 seconds to think"
    ],
    funFactor: 4.5,
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop"
  },

  {
    id: "g6",
    name: "Word Association Race",
    description: "Quick-thinking word game where every word must connect to the previous one!",
    category: "word",
    minPlayers: 3,
    maxPlayers: 12,
    duration: "10-20 min",
    ageRange: "8-99 years",
    difficulty: "medium",
    materials: ["Timer"],
    instructions: [
      "Players sit in a circle",
      "First player says any word",
      "Next player must say a related word within 3 seconds",
      "Continue around the circle",
      "If you hesitate too long or repeat a word, you're out",
      "Last person standing wins!"
    ],
    variations: [
      "Theme rounds: Only food words, animals, or places",
      "Opposite challenge: Say the opposite of the previous word",
      "Rhyme time: Each word must rhyme with the previous",
      "Categories: Must stay within chosen category"
    ],
    funFactor: 4.4,
    thumbnailUrl: "https://images.unsplash.com/photo-1545988952-3c8a70afe5e7?w=400&h=300&fit=crop"
  },

  // Physical Games
  {
    id: "g7",
    name: "Freeze Dance Party",
    description: "Dance to the music and freeze when it stops! Last one moving is out!",
    category: "physical",
    minPlayers: 3,
    maxPlayers: 20,
    duration: "10-20 min",
    ageRange: "3-99 years",
    difficulty: "easy",
    materials: ["Music player", "Space to dance"],
    instructions: [
      "Choose someone to control the music",
      "When music plays, everyone dances",
      "When music stops, everyone FREEZES in place",
      "If you move, giggle, or wobble, you're out",
      "Last dancer standing wins!",
      "Winner becomes the next music controller"
    ],
    variations: [
      "Pose challenge: Call out poses to freeze in",
      "Partner freeze: Dance in pairs",
      "Slow motion: Move in slow motion when music plays",
      "Dance styles: Each round has a different dance style"
    ],
    funFactor: 4.9,
    thumbnailUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop"
  },

  {
    id: "g8",
    name: "Balloon Keep-Up Challenge",
    description: "Keep the balloon(s) in the air as long as possible without touching the ground!",
    category: "physical",
    minPlayers: 2,
    maxPlayers: 15,
    duration: "15-30 min",
    ageRange: "4-99 years",
    difficulty: "easy",
    materials: ["Balloons (1-5)", "Timer", "Open space"],
    instructions: [
      "Blow up one or more balloons",
      "All players must keep the balloon(s) in the air",
      "Balloons cannot touch the floor",
      "Count how many hits before it drops",
      "Try to beat your record!",
      "Add more balloons to increase difficulty"
    ],
    variations: [
      "Body part challenge: Only use elbows, heads, or knees",
      "Team zones: Divide into areas, can't leave your zone",
      "Multiple balloons: Add one balloon per player",
      "Obstacle course: Navigate around furniture"
    ],
    funFactor: 4.7,
    thumbnailUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
  },

  // Creative Games
  {
    id: "g9",
    name: "Family Talent Show",
    description: "Everyone performs their special talent or silly skill!",
    category: "creative",
    minPlayers: 2,
    maxPlayers: 20,
    duration: "30-60 min",
    ageRange: "4-99 years",
    difficulty: "easy",
    materials: ["Props (optional)", "Music (optional)"],
    instructions: [
      "Each person prepares a 2-3 minute performance",
      "Talents can be serious OR silly",
      "Ideas: sing, dance, tell jokes, magic tricks, weird skills",
      "Everyone gets a turn to perform",
      "Audience cheers and applauds for each act",
      "Optional: Vote for categories like 'Most Creative' or 'Funniest'"
    ],
    variations: [
      "Mystery talent: Perform something you've never tried",
      "Group performances: Team up for duets or sketches",
      "Judges panel: Rate performances 1-10",
      "Theme rounds: All acts follow a theme"
    ],
    funFactor: 4.8,
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
  },

  {
    id: "g10",
    name: "Build-It Challenge",
    description: "Use household items to build something creative within a time limit!",
    category: "creative",
    minPlayers: 2,
    maxPlayers: 16,
    duration: "20-40 min",
    ageRange: "6-99 years",
    difficulty: "medium",
    materials: ["Household items: boxes, tape, paper, string, bottles, etc.", "Timer"],
    instructions: [
      "Set a challenge: build the tallest tower, strongest bridge, or most creative sculpture",
      "Give each team/person the same materials",
      "Set a 10-15 minute timer",
      "Build your creation!",
      "Test and judge the results",
      "Winner gets to choose the next challenge"
    ],
    variations: [
      "Mystery box: Build with random items from a bag",
      "Theme builds: Create castles, vehicles, or animals",
      "Tape-only challenge: Only tape, no other tools",
      "Team relay: Switch builders every 2 minutes"
    ],
    funFactor: 4.6,
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop"
  },

  // More Icebreakers
  {
    id: "g11",
    name: "Would You Rather?",
    description: "Answer silly or serious 'would you rather' questions and see who agrees!",
    category: "icebreaker",
    minPlayers: 2,
    maxPlayers: 20,
    duration: "15-30 min",
    ageRange: "6-99 years",
    difficulty: "easy",
    materials: ["Question cards (optional)"],
    instructions: [
      "One person asks a 'Would you rather' question",
      "Everyone decides and moves to different sides of the room",
      "Each side explains their choice",
      "Discuss the reasons - there's no wrong answer!",
      "Next person asks a question",
      "Continue until everyone has asked a question"
    ],
    variations: [
      "Superpowers: Would you rather fly or be invisible?",
      "Time travel: Past or future themed questions",
      "Family edition: Questions about family activities",
      "Speed round: Quick decisions, no explanations"
    ],
    funFactor: 4.5,
    thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop"
  },

  {
    id: "g12",
    name: "Scavenger Hunt",
    description: "Race to find items around the house or yard based on clues!",
    category: "physical",
    minPlayers: 2,
    maxPlayers: 20,
    duration: "20-45 min",
    ageRange: "5-99 years",
    difficulty: "medium",
    materials: ["List of items/clues", "Paper", "Pen", "Bag for collecting"],
    instructions: [
      "Create a list of items to find (or riddles to solve)",
      "Set boundaries (house, yard, neighborhood)",
      "Give each team/person the same list",
      "Set a time limit (15-30 minutes)",
      "Teams race to find all items",
      "First to complete the list OR most items found wins"
    ],
    variations: [
      "Photo hunt: Take pictures instead of collecting",
      "Color hunt: Find one item of each color",
      "Riddle clues: Each clue leads to the next",
      "Alphabet hunt: Find something for each letter"
    ],
    funFactor: 4.8,
    thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop"
  },

  // Trivia
  {
    id: "g13",
    name: "Name That Tune",
    description: "Guess the song from the first few notes!",
    category: "trivia",
    minPlayers: 2,
    maxPlayers: 20,
    duration: "20-40 min",
    ageRange: "8-99 years",
    difficulty: "medium",
    materials: ["Music player", "Playlist of songs", "Buzzer or bell (optional)"],
    instructions: [
      "Prepare a playlist with songs everyone might know",
      "Play 3-5 seconds of a song",
      "First person to guess correctly gets a point",
      "Play more of the song if no one guesses",
      "Bonus point for naming the artist",
      "First to 10 points wins!"
    ],
    variations: [
      "Decades challenge: Songs from 60s, 70s, 80s, 90s, 2000s",
      "Humming version: Hum the tune instead of playing it",
      "Movie themes: Only movie or TV show themes",
      "Family favorites: Songs meaningful to your family"
    ],
    funFactor: 4.7,
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop"
  },
];

export function getGamesByCategory(category: PartyGame['category']): PartyGame[] {
  return partyGames.filter(game => game.category === category);
}

export function getGamesByPlayerCount(playerCount: number): PartyGame[] {
  return partyGames.filter(game => 
    playerCount >= game.minPlayers && playerCount <= game.maxPlayers
  );
}

export function getGamesByAge(age: number): PartyGame[] {
  return partyGames.filter(game => {
    const [min, max] = game.ageRange.split('-').map(s => parseInt(s.replace(/\D/g, '')));
    return age >= min && age <= max;
  });
}

export function getGamesByDifficulty(difficulty: PartyGame['difficulty']): PartyGame[] {
  return partyGames.filter(game => game.difficulty === difficulty);
}
