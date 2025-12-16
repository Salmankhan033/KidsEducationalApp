// Find the Object Game Data
export const FIND_OBJECT_SCENES = [
  {
    id: 1,
    name: 'Living Room',
    background: '#F5F5DC',
    objects: [
      { name: 'Red Ball', emoji: '🔴', position: { x: 20, y: 30 } },
      { name: 'Cat', emoji: '🐱', position: { x: 60, y: 50 } },
      { name: 'Book', emoji: '📖', position: { x: 80, y: 20 } },
      { name: 'Lamp', emoji: '💡', position: { x: 10, y: 60 } },
      { name: 'Clock', emoji: '🕐', position: { x: 50, y: 10 } },
      { name: 'Plant', emoji: '🌱', position: { x: 90, y: 70 } },
    ],
  },
  {
    id: 2,
    name: 'Garden',
    background: '#90EE90',
    objects: [
      { name: 'Butterfly', emoji: '🦋', position: { x: 30, y: 20 } },
      { name: 'Flower', emoji: '🌸', position: { x: 70, y: 60 } },
      { name: 'Bird', emoji: '🐦', position: { x: 15, y: 40 } },
      { name: 'Bee', emoji: '🐝', position: { x: 85, y: 30 } },
      { name: 'Tree', emoji: '🌳', position: { x: 50, y: 70 } },
      { name: 'Sun', emoji: '☀️', position: { x: 80, y: 10 } },
    ],
  },
  {
    id: 3,
    name: 'Beach',
    background: '#87CEEB',
    objects: [
      { name: 'Shell', emoji: '🐚', position: { x: 25, y: 70 } },
      { name: 'Crab', emoji: '🦀', position: { x: 60, y: 60 } },
      { name: 'Fish', emoji: '🐟', position: { x: 40, y: 30 } },
      { name: 'Boat', emoji: '⛵', position: { x: 80, y: 20 } },
      { name: 'Star', emoji: '⭐', position: { x: 10, y: 50 } },
      { name: 'Ball', emoji: '🏐', position: { x: 90, y: 80 } },
    ],
  },
];

// Dress Up Game Data
export const DRESS_UP_ITEMS = {
  characters: ['👦', '👧', '🧒'],
  hats: ['🎩', '👒', '🧢', '👑', '🎀', ''],
  tops: ['👕', '👚', '🥋', '🧥', '👔'],
  bottoms: ['👖', '🩳', '👗', '🩱'],
  shoes: ['👟', '👠', '👞', '🥿', '👢'],
  accessories: ['🎒', '👜', '🕶️', '⌚', '💍', ''],
};

// Healthy Food Data
export const FOOD_ITEMS = [
  { name: 'Apple', emoji: '🍎', type: 'healthy' },
  { name: 'Pizza', emoji: '🍕', type: 'junk' },
  { name: 'Banana', emoji: '🍌', type: 'healthy' },
  { name: 'Burger', emoji: '🍔', type: 'junk' },
  { name: 'Carrot', emoji: '🥕', type: 'healthy' },
  { name: 'Fries', emoji: '🍟', type: 'junk' },
  { name: 'Orange', emoji: '🍊', type: 'healthy' },
  { name: 'Candy', emoji: '🍬', type: 'junk' },
  { name: 'Broccoli', emoji: '🥦', type: 'healthy' },
  { name: 'Donut', emoji: '🍩', type: 'junk' },
  { name: 'Milk', emoji: '🥛', type: 'healthy' },
  { name: 'Soda', emoji: '🥤', type: 'junk' },
  { name: 'Egg', emoji: '🥚', type: 'healthy' },
  { name: 'Ice Cream', emoji: '🍦', type: 'junk' },
  { name: 'Grapes', emoji: '🍇', type: 'healthy' },
  { name: 'Cake', emoji: '🍰', type: 'junk' },
];

// Build Game Data
export const BUILD_ITEMS = {
  house: {
    name: 'House',
    emoji: '🏠',
    parts: ['🧱', '🪟', '🚪', '🏠'],
    description: 'Build a cozy house!',
  },
  car: {
    name: 'Car',
    emoji: '🚗',
    parts: ['🛞', '🛞', '🚗', '💨'],
    description: 'Build a fast car!',
  },
  train: {
    name: 'Train',
    emoji: '🚂',
    parts: ['🛤️', '🚃', '🚃', '🚂'],
    description: 'Build a train!',
  },
  robot: {
    name: 'Robot',
    emoji: '🤖',
    parts: ['🦿', '🦾', '🤖', '⚡'],
    description: 'Build a robot!',
  },
};

// Complete Picture Data
export const PICTURE_HALVES = [
  { name: 'Butterfly', left: '🦋', right: '🦋', fullEmoji: '🦋' },
  { name: 'Heart', left: '❤️', right: '❤️', fullEmoji: '❤️' },
  { name: 'Star', left: '⭐', right: '⭐', fullEmoji: '⭐' },
  { name: 'Flower', left: '🌸', right: '🌸', fullEmoji: '🌸' },
  { name: 'Fish', left: '🐟', right: '🐟', fullEmoji: '🐟' },
  { name: 'Car', left: '🚗', right: '🚗', fullEmoji: '🚗' },
];

// Step by Step Tasks
export const STEP_TASKS = [
  {
    title: 'Wash Your Hands',
    emoji: '🧼',
    steps: [
      { action: 'Turn on water', emoji: '🚿', order: 1 },
      { action: 'Use soap', emoji: '🧴', order: 2 },
      { action: 'Rub hands', emoji: '👐', order: 3 },
      { action: 'Rinse hands', emoji: '💧', order: 4 },
      { action: 'Dry hands', emoji: '🧻', order: 5 },
    ],
  },
  {
    title: 'Brush Your Teeth',
    emoji: '🦷',
    steps: [
      { action: 'Get toothbrush', emoji: '🪥', order: 1 },
      { action: 'Add toothpaste', emoji: '🧴', order: 2 },
      { action: 'Brush teeth', emoji: '😁', order: 3 },
      { action: 'Rinse mouth', emoji: '💧', order: 4 },
      { action: 'Clean brush', emoji: '✨', order: 5 },
    ],
  },
  {
    title: 'Get Ready for Bed',
    emoji: '🛏️',
    steps: [
      { action: 'Put on pajamas', emoji: '👕', order: 1 },
      { action: 'Brush teeth', emoji: '🪥', order: 2 },
      { action: 'Read a story', emoji: '📖', order: 3 },
      { action: 'Turn off light', emoji: '💡', order: 4 },
      { action: 'Sleep tight', emoji: '😴', order: 5 },
    ],
  },
];

// Pet Care Data
export const PET_DATA = {
  pets: [
    { name: 'Dog', emoji: '🐕', sound: 'Woof!' },
    { name: 'Cat', emoji: '🐱', sound: 'Meow!' },
    { name: 'Bunny', emoji: '🐰', sound: 'Squeak!' },
  ],
  actions: [
    { name: 'Feed', emoji: '🍖', message: 'Yummy! Thank you!' },
    { name: 'Water', emoji: '💧', message: 'So refreshing!' },
    { name: 'Bath', emoji: '🛁', message: 'Nice and clean!' },
    { name: 'Brush', emoji: '🪮', message: 'Looking good!' },
    { name: 'Play', emoji: '🎾', message: 'So fun!' },
    { name: 'Sleep', emoji: '💤', message: 'Zzz...' },
  ],
};

// Clean Room Data
export const ROOM_ITEMS = [
  { name: 'Toy Car', emoji: '🚗', destination: 'toybox', destinationEmoji: '🧸' },
  { name: 'Ball', emoji: '⚽', destination: 'toybox', destinationEmoji: '🧸' },
  { name: 'Shirt', emoji: '👕', destination: 'closet', destinationEmoji: '🚪' },
  { name: 'Pants', emoji: '👖', destination: 'closet', destinationEmoji: '🚪' },
  { name: 'Book', emoji: '📚', destination: 'shelf', destinationEmoji: '📖' },
  { name: 'Pencil', emoji: '✏️', destination: 'desk', destinationEmoji: '🖊️' },
  { name: 'Teddy', emoji: '🧸', destination: 'toybox', destinationEmoji: '🧸' },
  { name: 'Socks', emoji: '🧦', destination: 'closet', destinationEmoji: '🚪' },
];

// Animal Habitats Data
export const ANIMAL_HABITATS = [
  { animal: '🦁', name: 'Lion', habitat: 'jungle', habitatEmoji: '🌴', habitatName: 'Jungle' },
  { animal: '🐟', name: 'Fish', habitat: 'water', habitatEmoji: '🌊', habitatName: 'Water' },
  { animal: '🐕', name: 'Dog', habitat: 'house', habitatEmoji: '🏠', habitatName: 'House' },
  { animal: '🐦', name: 'Bird', habitat: 'tree', habitatEmoji: '🌳', habitatName: 'Tree' },
  { animal: '🐪', name: 'Camel', habitat: 'desert', habitatEmoji: '🏜️', habitatName: 'Desert' },
  { animal: '🐧', name: 'Penguin', habitat: 'ice', habitatEmoji: '🧊', habitatName: 'Ice' },
  { animal: '🐸', name: 'Frog', habitat: 'pond', habitatEmoji: '🪷', habitatName: 'Pond' },
  { animal: '🦅', name: 'Eagle', habitat: 'mountain', habitatEmoji: '🏔️', habitatName: 'Mountain' },
];

// Manners Data
export const MANNERS_SCENARIOS = [
  {
    situation: 'Someone gives you a gift',
    emoji: '🎁',
    correct: 'Thank you!',
    options: ['Thank you!', 'Give me more!', 'I don\'t like it'],
  },
  {
    situation: 'You want to play with a toy',
    emoji: '🧸',
    correct: 'Can I play please?',
    options: ['Give it to me!', 'Can I play please?', 'It\'s mine!'],
  },
  {
    situation: 'You accidentally bump someone',
    emoji: '😅',
    correct: 'Sorry!',
    options: ['Ha ha!', 'Sorry!', 'Watch out!'],
  },
  {
    situation: 'Someone shares food with you',
    emoji: '🍪',
    correct: 'Thank you for sharing!',
    options: ['Thank you for sharing!', 'I want more!', 'Yuck!'],
  },
  {
    situation: 'You meet someone new',
    emoji: '👋',
    correct: 'Hello! Nice to meet you!',
    options: ['Go away!', 'Hello! Nice to meet you!', '...'],
  },
  {
    situation: 'Someone is sad',
    emoji: '😢',
    correct: 'Are you okay?',
    options: ['Ha ha!', 'Are you okay?', 'Whatever!'],
  },
];

// Juice Making Data
export const JUICE_FRUITS = [
  { name: 'Apple', emoji: '🍎', color: '#FF6B6B' },
  { name: 'Orange', emoji: '🍊', color: '#FFA94D' },
  { name: 'Banana', emoji: '🍌', color: '#FFD93D' },
  { name: 'Grape', emoji: '🍇', color: '#9B59B6' },
  { name: 'Mango', emoji: '🥭', color: '#FFA500' },
  { name: 'Strawberry', emoji: '🍓', color: '#FF6B9D' },
  { name: 'Watermelon', emoji: '🍉', color: '#6BCB77' },
  { name: 'Pineapple', emoji: '🍍', color: '#FFD700' },
];

// Shadow Match Data
export const SHADOW_ITEMS = [
  { name: 'Cat', emoji: '🐱', shadow: '⬛' },
  { name: 'Dog', emoji: '🐕', shadow: '⬛' },
  { name: 'Bird', emoji: '🐦', shadow: '⬛' },
  { name: 'Fish', emoji: '🐟', shadow: '⬛' },
  { name: 'Star', emoji: '⭐', shadow: '⬛' },
  { name: 'Heart', emoji: '❤️', shadow: '⬛' },
  { name: 'Car', emoji: '🚗', shadow: '⬛' },
  { name: 'House', emoji: '🏠', shadow: '⬛' },
];

// Daily Challenges
export const DAILY_CHALLENGES = [
  { task: 'Count 5 apples', emoji: '🍎', type: 'count', target: 5 },
  { task: 'Find 3 red objects', emoji: '🔴', type: 'find', target: 3 },
  { task: 'Trace number 4', emoji: '4️⃣', type: 'trace', target: 4 },
  { task: 'Match 4 animals', emoji: '🐱', type: 'match', target: 4 },
  { task: 'Sort 5 fruits', emoji: '🍎', type: 'sort', target: 5 },
  { task: 'Complete 1 puzzle', emoji: '🧩', type: 'puzzle', target: 1 },
  { task: 'Learn 3 new letters', emoji: '📚', type: 'learn', target: 3 },
];

// Sticker Collection
export const STICKER_COLLECTION = [
  { id: 1, emoji: '⭐', name: 'Gold Star', unlocked: false },
  { id: 2, emoji: '🏆', name: 'Trophy', unlocked: false },
  { id: 3, emoji: '🎖️', name: 'Medal', unlocked: false },
  { id: 4, emoji: '👑', name: 'Crown', unlocked: false },
  { id: 5, emoji: '🌟', name: 'Sparkle', unlocked: false },
  { id: 6, emoji: '💎', name: 'Diamond', unlocked: false },
  { id: 7, emoji: '🎯', name: 'Target', unlocked: false },
  { id: 8, emoji: '🚀', name: 'Rocket', unlocked: false },
  { id: 9, emoji: '🌈', name: 'Rainbow', unlocked: false },
  { id: 10, emoji: '🎪', name: 'Circus', unlocked: false },
  { id: 11, emoji: '🎨', name: 'Art', unlocked: false },
  { id: 12, emoji: '🎵', name: 'Music', unlocked: false },
];


