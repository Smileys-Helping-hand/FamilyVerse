import { db } from '@/lib/db';
import { eventCategories, eventTemplates } from '@/lib/db/schema';

/**
 * Seed script for default event categories and templates
 * Run with: npx tsx scripts/seed-event-planning.ts
 */

const DEFAULT_CATEGORIES = [
  {
    name: 'Outdoor Activities',
    slug: 'outdoor',
    icon: 'Mountain',
    color: 'green',
    description: 'Hikes, picnics, beach trips, and outdoor adventures',
    isSystem: true,
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports',
    icon: 'Trophy',
    color: 'blue',
    description: 'Sports events, fitness activities, and competitions',
    isSystem: true,
  },
  {
    name: 'Celebrations',
    slug: 'celebrations',
    icon: 'PartyPopper',
    color: 'purple',
    description: 'Birthdays, anniversaries, and milestone celebrations',
    isSystem: true,
  },
  {
    name: 'Food & Dining',
    slug: 'food',
    icon: 'Utensils',
    color: 'orange',
    description: 'Braais, dinners, cooking sessions, and food events',
    isSystem: true,
  },
  {
    name: 'Travel',
    slug: 'travel',
    icon: 'Plane',
    color: 'cyan',
    description: 'Vacations, road trips, and travel adventures',
    isSystem: true,
  },
  {
    name: 'Educational',
    slug: 'educational',
    icon: 'GraduationCap',
    color: 'indigo',
    description: 'Workshops, classes, and learning activities',
    isSystem: true,
  },
  {
    name: 'Social Gatherings',
    slug: 'social',
    icon: 'Users',
    color: 'pink',
    description: 'Family reunions, social meetups, and get-togethers',
    isSystem: true,
  },
];

const DEFAULT_TEMPLATES = [
  {
    name: 'Birthday Party',
    slug: 'birthday-party',
    categorySlug: 'celebrations',
    description: 'Complete birthday party planning with all the essentials',
    defaultDuration: 4,
    defaultTags: ['birthday', 'celebration', 'party'],
    checklistItems: [
      { title: 'Book venue', category: 'VENUE', dueBeforeHours: 336 }, // 2 weeks
      { title: 'Send invitations', category: 'COMMUNICATION', dueBeforeHours: 168 }, // 1 week
      { title: 'Order cake', category: 'CATERING', dueBeforeHours: 72 }, // 3 days
      { title: 'Buy decorations', category: 'SUPPLIES', dueBeforeHours: 48 }, // 2 days
      { title: 'Prepare party bags', category: 'SUPPLIES', dueBeforeHours: 24 }, // 1 day
      { title: 'Confirm guest count', category: 'COMMUNICATION', dueBeforeHours: 48 },
      { title: 'Plan entertainment/games', category: 'GENERAL', dueBeforeHours: 72 },
    ],
    suggestedSupplies: [
      { itemName: 'Birthday Cake', quantityNeeded: '1', category: 'FOOD' },
      { itemName: 'Drinks (juice/soda)', quantityNeeded: '5L', category: 'DRINK' },
      { itemName: 'Chips & Snacks', quantityNeeded: '3 bags', category: 'FOOD' },
      { itemName: 'Plates & Cups', quantityNeeded: '20 sets', category: 'EQUIPMENT' },
      { itemName: 'Balloons', quantityNeeded: '20', category: 'DECORATION' },
      { itemName: 'Party Hats', quantityNeeded: '15', category: 'DECORATION' },
    ],
    isSystem: true,
  },
  {
    name: 'Braai (BBQ)',
    slug: 'braai',
    categorySlug: 'food',
    description: 'South African braai with all the essentials',
    defaultDuration: 5,
    defaultTags: ['braai', 'bbq', 'outdoor', 'food'],
    checklistItems: [
      { title: 'Buy meat', category: 'CATERING', dueBeforeHours: 24 },
      { title: 'Get charcoal/wood', category: 'SUPPLIES', dueBeforeHours: 24 },
      { title: 'Prepare salads', category: 'CATERING', dueBeforeHours: 4 },
      { title: 'Clean braai area', category: 'VENUE', dueBeforeHours: 4 },
      { title: 'Set up tables & chairs', category: 'VENUE', dueBeforeHours: 2 },
      { title: 'Marinate meat', category: 'CATERING', dueBeforeHours: 12 },
    ],
    suggestedSupplies: [
      { itemName: 'Boerewors', quantityNeeded: '2kg', category: 'FOOD' },
      { itemName: 'Steak', quantityNeeded: '1.5kg', category: 'FOOD' },
      { itemName: 'Chicken pieces', quantityNeeded: '1kg', category: 'FOOD' },
      { itemName: 'Charcoal', quantityNeeded: '2 bags', category: 'EQUIPMENT' },
      { itemName: 'Ice', quantityNeeded: '2 bags', category: 'DRINK' },
      { itemName: 'Potato Salad', quantityNeeded: '1 bowl', category: 'FOOD' },
      { itemName: 'Bread rolls', quantityNeeded: '12', category: 'FOOD' },
      { itemName: 'Beverages', quantityNeeded: '12 cans', category: 'DRINK' },
    ],
    isSystem: true,
  },
  {
    name: 'Beach Day',
    slug: 'beach-day',
    categorySlug: 'outdoor',
    description: 'Perfect day at the beach with family',
    defaultDuration: 6,
    defaultTags: ['beach', 'outdoor', 'summer', 'kids'],
    checklistItems: [
      { title: 'Check weather forecast', category: 'GENERAL', dueBeforeHours: 24 },
      { title: 'Pack sunscreen', category: 'SUPPLIES', dueBeforeHours: 2 },
      { title: 'Prepare cooler box', category: 'SUPPLIES', dueBeforeHours: 4 },
      { title: 'Charge phone/camera', category: 'GENERAL', dueBeforeHours: 12 },
      { title: 'Pack beach toys', category: 'SUPPLIES', dueBeforeHours: 2 },
    ],
    suggestedSupplies: [
      { itemName: 'Sunscreen SPF 50+', quantityNeeded: '2 bottles', category: 'OTHER' },
      { itemName: 'Beach towels', quantityNeeded: '6', category: 'EQUIPMENT' },
      { itemName: 'Umbrella/Gazebo', quantityNeeded: '1', category: 'EQUIPMENT' },
      { itemName: 'Cooler box', quantityNeeded: '1', category: 'EQUIPMENT' },
      { itemName: 'Snacks', quantityNeeded: 'Various', category: 'FOOD' },
      { itemName: 'Water bottles', quantityNeeded: '6', category: 'DRINK' },
      { itemName: 'Beach toys', quantityNeeded: '1 set', category: 'EQUIPMENT' },
    ],
    isSystem: true,
  },
  {
    name: 'Sunday Hike',
    slug: 'sunday-hike',
    categorySlug: 'outdoor',
    description: 'Morning hike with scenic views',
    defaultDuration: 4,
    defaultTags: ['hike', 'outdoor', 'exercise', 'nature'],
    checklistItems: [
      { title: 'Check trail conditions', category: 'GENERAL', dueBeforeHours: 24 },
      { title: 'Pack first aid kit', category: 'SUPPLIES', dueBeforeHours: 2 },
      { title: 'Charge GPS/phone', category: 'GENERAL', dueBeforeHours: 12 },
      { title: 'Check weather', category: 'GENERAL', dueBeforeHours: 6 },
      { title: 'Prepare water & snacks', category: 'SUPPLIES', dueBeforeHours: 3 },
    ],
    suggestedSupplies: [
      { itemName: 'Water bottles', quantityNeeded: '2L per person', category: 'DRINK' },
      { itemName: 'Energy bars', quantityNeeded: '2 per person', category: 'FOOD' },
      { itemName: 'First aid kit', quantityNeeded: '1', category: 'OTHER' },
      { itemName: 'Sunscreen', quantityNeeded: '1 bottle', category: 'OTHER' },
      { itemName: 'Hat/Cap', quantityNeeded: '1 per person', category: 'OTHER' },
    ],
    isSystem: true,
  },
  {
    name: 'Family Movie Night',
    slug: 'movie-night',
    categorySlug: 'social',
    description: 'Cozy movie night at home',
    defaultDuration: 3,
    defaultTags: ['movie', 'indoor', 'family', 'entertainment'],
    checklistItems: [
      { title: 'Choose movie', category: 'GENERAL', dueBeforeHours: 24 },
      { title: 'Set up projector/TV', category: 'VENUE', dueBeforeHours: 2 },
      { title: 'Prepare snacks', category: 'CATERING', dueBeforeHours: 2 },
      { title: 'Arrange seating', category: 'VENUE', dueBeforeHours: 1 },
    ],
    suggestedSupplies: [
      { itemName: 'Popcorn', quantityNeeded: '3 bags', category: 'FOOD' },
      { itemName: 'Candy/Sweets', quantityNeeded: '2 bags', category: 'FOOD' },
      { itemName: 'Drinks', quantityNeeded: '2L', category: 'DRINK' },
      { itemName: 'Blankets', quantityNeeded: '4', category: 'EQUIPMENT' },
    ],
    isSystem: true,
  },
];

async function seedEventPlanning() {
  console.log('🌱 Seeding event planning data...');

  try {
    // Insert categories
    console.log('Creating categories...');
    const createdCategories = await Promise.all(
      DEFAULT_CATEGORIES.map(async (cat) => {
        const [category] = await db
          .insert(eventCategories)
          .values(cat)
          .onConflictDoNothing()
          .returning();
        return category;
      })
    );
    console.log(`✅ Created ${createdCategories.filter(Boolean).length} categories`);

    // Get category IDs for templates
    const categoryMap: Record<string, string> = {};
    for (const cat of createdCategories.filter(Boolean)) {
      categoryMap[cat.slug] = cat.id;
    }

    // Insert templates
    console.log('Creating templates...');
    const createdTemplates = await Promise.all(
      DEFAULT_TEMPLATES.map(async (template) => {
        const { categorySlug, slug, ...rest } = template;
        const [tmpl] = await db
          .insert(eventTemplates)
          .values({
            ...rest,
            categoryId: categoryMap[categorySlug],
          })
          .onConflictDoNothing()
          .returning();
        return tmpl;
      })
    );
    console.log(`✅ Created ${createdTemplates.filter(Boolean).length} templates`);

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedEventPlanning();
}

export { seedEventPlanning };
