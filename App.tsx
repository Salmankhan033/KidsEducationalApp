/**
 * Kids Educational App - Learn & Play! 🌈
 * A comprehensive interactive educational app for children
 * 
 * Features:
 * - Learn ABC with sounds
 * - Numbers & Counting
 * - Shapes Learning
 * - ABC Songs
 * - Memory Games
 * - Puzzles
 * - Tracing
 * - Coloring
 * - Maze
 * - Sorting
 * - Pattern Recognition
 * - Sound Recognition
 * - Emotions Learning
 * - Interactive Stories
 * - Piano & Rhythm Games
 * - Quiz Games
 * - Find Object Game
 * - Dress Up Game
 * - Food Sorting (Healthy vs Junk)
 * - Build Game (House/Car/Train/Robot)
 * - Pet Care
 * - Clean Room
 * - Animal Habitats
 * - Reaction Speed Game
 * - Manners & Sharing
 * - Juice Making
 * - Shadow Matching
 * - Step by Step Learning
 * - Daily Challenges & Stickers
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  HomeScreen,
  AlphabetsScreen,
  SongsScreen,
  ColoringScreen,
  FunGamesScreen,
  NumbersScreen,
  ShapesScreen,
  MemoryGameScreen,
  PuzzleGameScreen,
  TracingGameScreen,
  MazeGameScreen,
  SortingGameScreen,
  PatternGameScreen,
  SoundGameScreen,
  EmotionsGameScreen,
  StoryGameScreen,
  PianoGameScreen,
  QuizGameScreen,
  // New Activity Screens
  FindObjectScreen,
  DressUpScreen,
  FoodSortingScreen,
  BuildGameScreen,
  PetCareScreen,
  CleanRoomScreen,
  AnimalHabitatScreen,
  ReactionGameScreen,
  MannersGameScreen,
  JuiceMakingScreen,
  ShadowMatchScreen,
  RhythmGameScreen,
  StepByStepScreen,
  DailyChallengeScreen,
  // New Simple Kid Games
  MatchLineGame,
  OppositesGame,
  SizeCompareGame,
  CountingGame,
  FindPairGame,
  ShapeInObjectGame,
} from './src/screens';
import { initTTS } from './src/utils/speech';
import { GenderProvider } from './src/context/GenderContext';

// Initialize TTS immediately on app load (before any screens render)
initTTS();

export type RootStackParamList = {
  Home: undefined;
  Alphabets: undefined;
  Songs: undefined;
  Coloring: undefined;
  Fun: undefined;
  Numbers: undefined;
  Shapes: undefined;
  MemoryGame: undefined;
  PuzzleGame: undefined;
  TracingGame: undefined;
  MazeGame: undefined;
  SortingGame: undefined;
  PatternGame: undefined;
  SoundGame: undefined;
  EmotionsGame: undefined;
  StoryGame: undefined;
  PianoGame: undefined;
  QuizGame: undefined;
  // New Activity Screens
  FindObject: undefined;
  DressUp: undefined;
  FoodSorting: undefined;
  BuildGame: undefined;
  PetCare: undefined;
  CleanRoom: undefined;
  AnimalHabitat: undefined;
  ReactionGame: undefined;
  MannersGame: undefined;
  JuiceMaking: undefined;
  ShadowMatch: undefined;
  RhythmGame: undefined;
  StepByStep: undefined;
  DailyChallenge: undefined;
  // New Simple Kid Games
  MatchLine: undefined;
  Opposites: undefined;
  SizeCompare: undefined;
  CountingGame: undefined;
  FindPair: undefined;
  ShapeInObject: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  // Initialize Text-to-Speech on app start
  useEffect(() => {
    initTTS();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GenderProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF9E6" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#FFF9E6' },
              }}
            >
              {/* Main Screens */}
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Alphabets" component={AlphabetsScreen} />
              <Stack.Screen name="Songs" component={SongsScreen} />
              <Stack.Screen name="Coloring" component={ColoringScreen} />
              <Stack.Screen name="Fun" component={FunGamesScreen} />
              
              {/* Learning Screens */}
              <Stack.Screen name="Numbers" component={NumbersScreen} />
              <Stack.Screen name="Shapes" component={ShapesScreen} />
              
              {/* Game Screens */}
              <Stack.Screen name="MemoryGame" component={MemoryGameScreen} />
              <Stack.Screen name="PuzzleGame" component={PuzzleGameScreen} />
              <Stack.Screen name="TracingGame" component={TracingGameScreen} />
              <Stack.Screen name="MazeGame" component={MazeGameScreen} />
              <Stack.Screen name="SortingGame" component={SortingGameScreen} />
              <Stack.Screen name="PatternGame" component={PatternGameScreen} />
              <Stack.Screen name="SoundGame" component={SoundGameScreen} />
              <Stack.Screen name="EmotionsGame" component={EmotionsGameScreen} />
              <Stack.Screen name="StoryGame" component={StoryGameScreen} />
              <Stack.Screen name="PianoGame" component={PianoGameScreen} />
              <Stack.Screen name="QuizGame" component={QuizGameScreen} />
              
              {/* New Activity Screens */}
              <Stack.Screen name="FindObject" component={FindObjectScreen} />
              <Stack.Screen name="DressUp" component={DressUpScreen} />
              <Stack.Screen name="FoodSorting" component={FoodSortingScreen} />
              <Stack.Screen name="BuildGame" component={BuildGameScreen} />
              <Stack.Screen name="PetCare" component={PetCareScreen} />
              <Stack.Screen name="CleanRoom" component={CleanRoomScreen} />
              <Stack.Screen name="AnimalHabitat" component={AnimalHabitatScreen} />
              <Stack.Screen name="ReactionGame" component={ReactionGameScreen} />
              <Stack.Screen name="MannersGame" component={MannersGameScreen} />
              <Stack.Screen name="JuiceMaking" component={JuiceMakingScreen} />
              <Stack.Screen name="ShadowMatch" component={ShadowMatchScreen} />
              <Stack.Screen name="RhythmGame" component={RhythmGameScreen} />
              <Stack.Screen name="StepByStep" component={StepByStepScreen} />
              <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
              
              {/* New Simple Kid Games */}
              <Stack.Screen name="MatchLine" component={MatchLineGame} />
              <Stack.Screen name="Opposites" component={OppositesGame} />
              <Stack.Screen name="SizeCompare" component={SizeCompareGame} />
              <Stack.Screen name="CountingGame" component={CountingGame} />
              <Stack.Screen name="FindPair" component={FindPairGame} />
              <Stack.Screen name="ShapeInObject" component={ShapeInObjectGame} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </GenderProvider>
    </GestureHandlerRootView>
  );
}

export default App;
