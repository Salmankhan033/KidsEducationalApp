import { ImageSourcePropType } from 'react-native';

export interface AlphabetData {
  letter: string;
  word1: string;
  emoji1: string;
  word2: string;
  emoji2: string;
  sound: string;
  sentence: string; // Sentence using both words
  color: string;
  image?: ImageSourcePropType;
}

export const ALPHABETS: AlphabetData[] = [
  { letter: 'A', word1: 'Apple', emoji1: '🍎', word2: 'Ant', emoji2: '🐜', sound: 'A for Apple and Ant', sentence: 'The Ant eats the Apple', color: '#FF6B6B' },
  { letter: 'B', word1: 'Bear', emoji1: '🐻', word2: 'Ball', emoji2: '⚽', sound: 'B for Bear and Ball', sentence: 'The Bear plays with a Ball', color: '#8B4513' },
  { letter: 'C', word1: 'Cat', emoji1: '🐱', word2: 'Cake', emoji2: '🎂', sound: 'C for Cat and Cake', sentence: 'The Cat loves the Cake', color: '#FFA94D' },
  { letter: 'D', word1: 'Dog', emoji1: '🐕', word2: 'Duck', emoji2: '🦆', sound: 'D for Dog and Duck', sentence: 'The Dog sees a Duck', color: '#6BCB77' },
  { letter: 'E', word1: 'Elephant', emoji1: '🐘', word2: 'Egg', emoji2: '🥚', sound: 'E for Elephant and Egg', sentence: 'The Elephant found an Egg', color: '#9B59B6' },
  { letter: 'F', word1: 'Fish', emoji1: '🐟', word2: 'Frog', emoji2: '🐸', sound: 'F for Fish and Frog', sentence: 'The Frog jumps over Fish', color: '#4ECDC4' },
  { letter: 'G', word1: 'Grapes', emoji1: '🍇', word2: 'Giraffe', emoji2: '🦒', sound: 'G for Grapes and Giraffe', sentence: 'The Giraffe eats Grapes', color: '#9B59B6' },
  { letter: 'H', word1: 'Horse', emoji1: '🐎', word2: 'House', emoji2: '🏠', sound: 'H for Horse and House', sentence: 'The Horse runs to the House', color: '#8B4513' },
  { letter: 'I', word1: 'Ice Cream', emoji1: '🍦', word2: 'Ice', emoji2: '🧊', sound: 'I for Ice Cream and Ice', sentence: 'Ice Cream has Ice in it', color: '#FFD93D' },
  { letter: 'J', word1: 'Juice', emoji1: '🧃', word2: 'Jack-o-lantern', emoji2: '🎃', sound: 'J for Juice and Jack-o-lantern', sentence: 'Jack-o-lantern drinks Juice', color: '#FFA94D' },
  { letter: 'K', word1: 'Koala', emoji1: '🐨', word2: 'Kite', emoji2: '🪁', sound: 'K for Koala and Kite', sentence: 'The Koala flies a Kite', color: '#808080' },
  { letter: 'L', word1: 'Lion', emoji1: '🦁', word2: 'Lemon', emoji2: '🍋', sound: 'L for Lion and Lemon', sentence: 'The Lion tastes a Lemon', color: '#FFD93D' },
  { letter: 'M', word1: 'Monkey', emoji1: '🐵', word2: 'Moon', emoji2: '🌙', sound: 'M for Monkey and Moon', sentence: 'The Monkey looks at Moon', color: '#8B4513' },
  { letter: 'N', word1: 'Nest', emoji1: '🪺', word2: 'Nut', emoji2: '🥜', sound: 'N for Nest and Nut', sentence: 'A Nut is in the Nest', color: '#6BCB77' },
  { letter: 'O', word1: 'Orange', emoji1: '🍊', word2: 'Owl', emoji2: '🦉', sound: 'O for Orange and Owl', sentence: 'The Owl eats an Orange', color: '#FFA94D' },
  { letter: 'P', word1: 'Panda', emoji1: '🐼', word2: 'Pizza', emoji2: '🍕', sound: 'P for Panda and Pizza', sentence: 'The Panda loves Pizza', color: '#333333' },
  { letter: 'Q', word1: 'Queen', emoji1: '👸', word2: 'Quilt', emoji2: '🛏️', sound: 'Q for Queen and Quilt', sentence: 'The Queen has a Quilt', color: '#9B59B6' },
  { letter: 'R', word1: 'Rabbit', emoji1: '🐰', word2: 'Rainbow', emoji2: '🌈', sound: 'R for Rabbit and Rainbow', sentence: 'The Rabbit sees a Rainbow', color: '#FFB6C1' },
  { letter: 'S', word1: 'Sun', emoji1: '☀️', word2: 'Star', emoji2: '⭐', sound: 'S for Sun and Star', sentence: 'The Sun shines with Stars', color: '#FFD93D' },
  { letter: 'T', word1: 'Tiger', emoji1: '🐯', word2: 'Tree', emoji2: '🌳', sound: 'T for Tiger and Tree', sentence: 'The Tiger climbs a Tree', color: '#FFA94D' },
  { letter: 'U', word1: 'Umbrella', emoji1: '☂️', word2: 'Unicorn', emoji2: '🦄', sound: 'U for Umbrella and Unicorn', sentence: 'The Unicorn has an Umbrella', color: '#4D96FF' },
  { letter: 'V', word1: 'Van', emoji1: '🚐', word2: 'Violin', emoji2: '🎻', sound: 'V for Van and Violin', sentence: 'The Violin is in the Van', color: '#4D96FF' },
  { letter: 'W', word1: 'Watermelon', emoji1: '🍉', word2: 'Whale', emoji2: '🐋', sound: 'W for Watermelon and Whale', sentence: 'The Whale eats Watermelon', color: '#6BCB77' },
  { letter: 'X', word1: 'Fox', emoji1: '🦊', word2: 'Box', emoji2: '📦', sound: 'X in Fox and Box', sentence: 'The Fox hides in a Box', color: '#FF7043' },
  { letter: 'Y', word1: 'Yarn', emoji1: '🧶', word2: 'Yoyo', emoji2: '🪀', sound: 'Y for Yarn and Yoyo', sentence: 'Yarn is used for Yoyo', color: '#E91E63' },
  { letter: 'Z', word1: 'Zebra', emoji1: '🦓', word2: 'Zoo', emoji2: '🦁', sound: 'Z for Zebra and Zoo', sentence: 'The Zebra lives in the Zoo', color: '#333333' },
];

export const ALPHABET_SONGS = [
  {
    id: 1,
    title: 'ABC Song',
    emoji: '🎵',
    lyrics: 'A B C D E F G\nH I J K L M N O P\nQ R S T U V\nW X Y and Z\nNow I know my ABCs\nNext time won\'t you sing with me!',
    color: '#FF6B6B',
  },
  {
    id: 2,
    title: 'Phonics Song',
    emoji: '🎶',
    lyrics: 'A is for Apple, ah ah Apple\nB is for Bear, buh buh Bear\nC is for Cat, cuh cuh Cat\nD is for Dinosaur, duh duh Dinosaur...',
    color: '#4D96FF',
  },
  {
    id: 3,
    title: 'Letter Dance',
    emoji: '💃',
    lyrics: 'Dance with A, jump with B\nClap with C, spin with D\nWave with E, hop with F\nEvery letter is the best!',
    color: '#6BCB77',
  },
  {
    id: 4,
    title: 'Animal Alphabet',
    emoji: '🦁',
    lyrics: 'A for Apple red and round\nB for Bear, fluffy and brown\nC for Cat that says meow\nD for Dinosaur, roar wow wow!',
    color: '#FFA94D',
  },
  {
    id: 5,
    title: 'Alphabet Song',
    emoji: '🍎',
    lyrics: 'A is for Apple, B is for Ball\nC is for Cat, D is for Doll\nE is for Egg, F is for Fish\nG is for Goat, H is for Hat\nI is for Ice cream, J is for Jump\nK is for Kite, L is for Lamp\nM is for Moon, N is for Net\nO is for Owl, P is for Pet\nQ is for Queen, R is for Rain\nS is for Sun, T is for Train\nU is for Umbrella, V is for Van\nW is for Whale, X is for Xylophone\nY is for Yo-yo, Z is for Zebra\n\n🎵 Now you know your A, B, C\nSing again with me! 🎵',
    color: '#E74C3C',
    hasAudio: true,
    audioFile: 'alphabet_song.mp3',
  },
];


