// CalPal - Shared Data
// This file contains all preset data used across the application

// Food Presets (10+ items)
const foodPresets = [
    { name: "Oatmeal with berries", calories: 320, protein: 12, carbs: 58, fat: 6 },
    { name: "Grilled chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "Brown rice (1 cup)", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: "Greek yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.7 },
    { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: "Salmon fillet", calories: 280, protein: 40, carbs: 0, fat: 13 },
    { name: "Avocado toast", calories: 290, protein: 8, carbs: 28, fat: 18 },
    { name: "Protein shake", calories: 220, protein: 30, carbs: 15, fat: 5 },
    { name: "Mixed green salad", calories: 150, protein: 6, carbs: 12, fat: 9 },
    { name: "Whole wheat pasta", calories: 310, protein: 11, carbs: 62, fat: 2 },
    { name: "Scrambled eggs (2)", calories: 180, protein: 12, carbs: 2, fat: 14 },
    { name: "Apple with peanut butter", calories: 200, protein: 4, carbs: 25, fat: 10 }
  ];
  
  // Exercise Presets (5+ items)
  const exercisePresets = [
    { name: "Jogging", intensity: "Moderate", caloriesPer30Min: 240 },
    { name: "Walking", intensity: "Light", caloriesPer30Min: 120 },
    { name: "Cycling", intensity: "Moderate", caloriesPer30Min: 270 },
    { name: "Swimming", intensity: "High", caloriesPer30Min: 330 },
    { name: "Weight Training", intensity: "Moderate", caloriesPer30Min: 180 },
    { name: "Yoga", intensity: "Light", caloriesPer30Min: 90 },
    { name: "Running", intensity: "High", caloriesPer30Min: 360 }
  ];
  
  // Weight History (7+ entries)
  const weightHistory = [
    { day: "Mon", weight: 172 },
    { day: "Tue", weight: 171.5 },
    { day: "Wed", weight: 171.8 },
    { day: "Thu", weight: 171.2 },
    { day: "Fri", weight: 170.8 },
    { day: "Sat", weight: 170.5 },
    { day: "Sun", weight: 170 }
  ];
  
  // Sample Today Stats
  const sampleToday = {
    caloriesIn: 2050,
    caloriesOut: 480,
    targetCalories: 2200,
    fitPoints: 65
  };