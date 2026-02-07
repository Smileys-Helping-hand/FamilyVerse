const verbs = [
  'High Five',
  'Take a Selfie with',
  'Hide a coin under',
  'Whisper a secret to',
  'Salute',
];

const targets = [
  'The Host',
  'The Shortest Player',
  'Uncle Mo',
  'The TV',
  'A Red Object',
];

const conditions = [
  'while hopping on one leg',
  'without smiling',
  'in slow motion',
  'while holding your breath',
];

const seedTasks = [
  'Take a blurry photo of the Imposter (suspect) without them noticing.',
  'Bring the Host a glass of water/soda.',
  'Touch the front door without anyone seeing you.',
  'Act like you are stuck in a box for 10 seconds.',
  'Work the word "Pineapple" into a conversation naturally.',
];

const randomItem = (items: string[]) => items[Math.floor(Math.random() * items.length)];

const generateComboTask = () => {
  return `${randomItem(verbs)} ${randomItem(targets)} ${randomItem(conditions)}.`;
};

export const generateTaskBatch = (count: number): string[] => {
  const tasks: string[] = [];
  const used = new Set<string>();

  while (tasks.length < count) {
    const useSeed = Math.random() < 0.4 && seedTasks.length > 0;
    const task = useSeed ? randomItem(seedTasks) : generateComboTask();
    if (used.has(task)) {
      continue;
    }
    used.add(task);
    tasks.push(task);
  }

  return tasks;
};

export const generateFakeTaskBatch = (count: number): string[] => {
  const tasks = generateTaskBatch(count);
  return tasks.map((task) => task.replace(/the/gi, 'a'));
};
