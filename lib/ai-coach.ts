import { Exercise, FitnessGoal, FitnessLevel, WorkoutPlan, UserProfile } from './store';

const exerciseDatabase: Record<string, Exercise[]> = {
  chest: [
    { id: 'push-up', name: 'Push-Up', sets: 3, reps: '12-15', rest: 60, muscle: 'Chest', difficulty: 'beginner', instructions: 'Start in plank position, lower chest to floor, push back up keeping core tight.', calories: 8 },
    { id: 'diamond-push-up', name: 'Diamond Push-Up', sets: 3, reps: '8-12', rest: 60, muscle: 'Chest', difficulty: 'intermediate', instructions: 'Form diamond shape with hands, lower chest to hands, push back up.', calories: 10 },
    { id: 'chest-dip', name: 'Chest Dip', sets: 3, reps: '10-12', rest: 90, muscle: 'Chest', difficulty: 'intermediate', instructions: 'Lean forward on parallel bars, lower until shoulders are at elbow level, push up.', calories: 12 },
  ],
  back: [
    { id: 'pull-up', name: 'Pull-Up', sets: 3, reps: '6-10', rest: 90, muscle: 'Back', difficulty: 'intermediate', instructions: 'Hang from bar with overhand grip, pull chest to bar, lower with control.', calories: 10 },
    { id: 'bent-over-row', name: 'Bent-Over Row', sets: 3, reps: '10-12', rest: 60, muscle: 'Back', difficulty: 'intermediate', instructions: 'Hinge at hips, pull weight to lower chest, squeeze shoulder blades.', calories: 9 },
    { id: 'superman', name: 'Superman Hold', sets: 3, reps: '12-15', rest: 45, muscle: 'Back', difficulty: 'beginner', instructions: 'Lie face down, simultaneously lift arms and legs, hold 2 seconds.', calories: 5 },
  ],
  legs: [
    { id: 'squat', name: 'Bodyweight Squat', sets: 3, reps: '15-20', rest: 60, muscle: 'Legs', difficulty: 'beginner', instructions: 'Feet shoulder-width apart, lower until thighs are parallel to ground, drive through heels.', calories: 10 },
    { id: 'lunge', name: 'Walking Lunge', sets: 3, reps: '12 each', rest: 60, muscle: 'Legs', difficulty: 'beginner', instructions: 'Step forward, lower back knee toward floor, alternate legs.', calories: 9 },
    { id: 'jump-squat', name: 'Jump Squat', sets: 3, reps: '10-12', rest: 90, muscle: 'Legs', difficulty: 'intermediate', instructions: 'Squat down, explode upward, land softly and immediately go into next squat.', calories: 15 },
    { id: 'bulgarian-split', name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', rest: 90, muscle: 'Legs', difficulty: 'advanced', instructions: 'Rear foot elevated on bench, lower front knee to 90 degrees, drive through front heel.', calories: 12 },
  ],
  shoulders: [
    { id: 'pike-push-up', name: 'Pike Push-Up', sets: 3, reps: '10-12', rest: 60, muscle: 'Shoulders', difficulty: 'intermediate', instructions: 'Form inverted V shape, lower head toward floor, push back up.', calories: 8 },
    { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, reps: '12-15', rest: 60, muscle: 'Shoulders', difficulty: 'beginner', instructions: 'Hold weights at sides, raise arms to shoulder level, lower slowly.', calories: 6 },
    { id: 'arnold-press', name: 'Arnold Press', sets: 3, reps: '10-12', rest: 90, muscle: 'Shoulders', difficulty: 'intermediate', instructions: 'Start with palms facing you, press up while rotating palms forward, reverse.', calories: 9 },
  ],
  core: [
    { id: 'plank', name: 'Plank Hold', sets: 3, reps: '30-60s', rest: 45, muscle: 'Core', difficulty: 'beginner', instructions: 'Forearms on floor, body straight, hold position engaging all core muscles.', calories: 5 },
    { id: 'mountain-climber', name: 'Mountain Climber', sets: 3, reps: '20 each', rest: 45, muscle: 'Core', difficulty: 'intermediate', instructions: 'In push-up position, drive knees alternately to chest in running motion.', calories: 12 },
    { id: 'bicycle-crunch', name: 'Bicycle Crunch', sets: 3, reps: '15 each', rest: 45, muscle: 'Core', difficulty: 'beginner', instructions: 'Lie on back, alternate bringing elbow to opposite knee while extending other leg.', calories: 7 },
    { id: 'russian-twist', name: 'Russian Twist', sets: 3, reps: '15 each', rest: 60, muscle: 'Core', difficulty: 'intermediate', instructions: 'Sit at 45 degrees, feet elevated, rotate torso side to side with weight.', calories: 8 },
  ],
  cardio: [
    { id: 'burpee', name: 'Burpee', sets: 3, reps: '10-12', rest: 90, muscle: 'Full Body', difficulty: 'intermediate', instructions: 'Squat down, jump feet back, do push-up, jump feet forward, jump up with arms overhead.', calories: 15 },
    { id: 'high-knees', name: 'High Knees', sets: 3, reps: '30s', rest: 30, muscle: 'Cardio', difficulty: 'beginner', instructions: 'Run in place bringing knees up to hip height, pump arms.', calories: 12 },
    { id: 'box-jump', name: 'Box Jump', sets: 3, reps: '8-10', rest: 90, muscle: 'Legs/Cardio', difficulty: 'intermediate', instructions: 'Stand before box, swing arms, jump with both feet onto box, step down.', calories: 14 },
    { id: 'jumping-jack', name: 'Jumping Jacks', sets: 3, reps: '30s', rest: 30, muscle: 'Cardio', difficulty: 'beginner', instructions: 'Jump feet out while raising arms overhead, return to start.', calories: 10 },
  ],
};

function getDifficultyFilter(level: FitnessLevel): FitnessLevel[] {
  if (level === 'beginner') return ['beginner'];
  if (level === 'intermediate') return ['beginner', 'intermediate'];
  return ['beginner', 'intermediate', 'advanced'];
}

function selectExercises(muscles: string[], level: FitnessLevel, count: number): Exercise[] {
  const allowed = getDifficultyFilter(level);
  const pool: Exercise[] = [];
  muscles.forEach((muscle) => {
    const exercises = exerciseDatabase[muscle] || [];
    const filtered = exercises.filter((e) => allowed.includes(e.difficulty));
    pool.push(...filtered);
  });
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const workoutTemplates: Record<FitnessGoal, { days: { name: string; muscles: string[] }[] }> = {
  weight_loss: {
    days: [
      { name: 'HIIT Full Body', muscles: ['cardio', 'core', 'legs'] },
      { name: 'Upper Body Circuit', muscles: ['chest', 'back', 'shoulders', 'cardio'] },
      { name: 'Lower Body Burn', muscles: ['legs', 'core', 'cardio'] },
      { name: 'Total Body Blast', muscles: ['cardio', 'chest', 'legs', 'core'] },
      { name: 'Core & Cardio', muscles: ['core', 'cardio'] },
    ],
  },
  muscle_gain: {
    days: [
      { name: 'Push Day', muscles: ['chest', 'shoulders', 'core'] },
      { name: 'Pull Day', muscles: ['back', 'core'] },
      { name: 'Leg Day', muscles: ['legs', 'core'] },
      { name: 'Upper Body Power', muscles: ['chest', 'back', 'shoulders'] },
      { name: 'Full Body Strength', muscles: ['legs', 'chest', 'back'] },
    ],
  },
  endurance: {
    days: [
      { name: 'Cardio Endurance', muscles: ['cardio', 'legs'] },
      { name: 'Upper Body Circuit', muscles: ['chest', 'back', 'shoulders', 'cardio'] },
      { name: 'HIIT Training', muscles: ['cardio', 'core', 'legs'] },
      { name: 'Aerobic Strength', muscles: ['legs', 'cardio', 'core'] },
      { name: 'Full Body Circuit', muscles: ['cardio', 'chest', 'legs', 'core'] },
    ],
  },
  flexibility: {
    days: [
      { name: 'Mobility Flow', muscles: ['core', 'legs'] },
      { name: 'Upper Body Stretch', muscles: ['shoulders', 'back', 'chest'] },
      { name: 'Hip & Core Mobility', muscles: ['core', 'legs'] },
      { name: 'Full Body Flexibility', muscles: ['legs', 'core', 'shoulders'] },
      { name: 'Recovery & Stretch', muscles: ['core', 'back', 'legs'] },
    ],
  },
  general_fitness: {
    days: [
      { name: 'Full Body A', muscles: ['chest', 'legs', 'core'] },
      { name: 'Full Body B', muscles: ['back', 'shoulders', 'cardio'] },
      { name: 'Cardio & Core', muscles: ['cardio', 'core'] },
      { name: 'Strength Circuit', muscles: ['chest', 'back', 'legs'] },
      { name: 'Active Recovery', muscles: ['core', 'shoulders', 'cardio'] },
    ],
  },
};

export function generateWeeklyPlan(profile: UserProfile): WorkoutPlan[] {
  const template = workoutTemplates[profile.goal];
  const days = template.days.slice(0, profile.daysPerWeek);
  const today = new Date();

  return days.map((day, index) => {
    const exerciseCount = profile.level === 'beginner' ? 4 : profile.level === 'intermediate' ? 5 : 6;
    const exercises = selectExercises(day.muscles, profile.level, exerciseCount);
    const totalCalories = exercises.reduce((sum, e) => sum + e.calories * e.sets, 0);
    const duration = exercises.reduce((sum, e) => sum + (e.sets * (e.rest + 30)), 0) / 60;
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      id: `workout-${Date.now()}-${index}`,
      name: day.name,
      date: date.toISOString(),
      exercises,
      estimatedDuration: Math.round(duration),
      totalCalories,
      completed: false,
    };
  });
}

export function getAIMotivation(profile: UserProfile, streak: number): string {
  const messages: Record<FitnessGoal, string[]> = {
    weight_loss: [
      `Every workout is a step toward your goal, ${profile.name}. You've got this!`,
      `Consistency beats perfection. Keep showing up and the results will follow.`,
      `Your body is capable of more than your mind believes. Push through!`,
    ],
    muscle_gain: [
      `Progressive overload is the key. Lift a little heavier, be a little stronger.`,
      `Muscles grow during rest, but they're built in the gym. Make it count!`,
      `Every rep is a deposit in your strength bank account.`,
    ],
    endurance: [
      `Endurance is built one breath at a time. Keep going!`,
      `The pace doesn't matter - moving forward is what counts.`,
      `Your lungs are getting stronger with every session.`,
    ],
    flexibility: [
      `Flexibility is a skill. Practice it daily and watch yourself transform.`,
      `Listen to your body. Breathe into the stretch.`,
      `Mobility today means longevity tomorrow.`,
    ],
    general_fitness: [
      `Balance is the ultimate fitness goal. You're on the right path!`,
      `A strong body supports a strong mind. Keep training!`,
      `Health is wealth. Every workout is an investment in yourself.`,
    ],
  };
  const goalMessages = messages[profile.goal];
  const streakBonus = streak > 0 ? ` ${streak} day streak - incredible!` : '';
  return goalMessages[Math.floor(Math.random() * goalMessages.length)] + streakBonus;
}

export function calculateBMI(weight: number, height: number): { bmi: number; category: string } {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { bmi: Math.round(bmi * 10) / 10, category };
}

export function estimateCaloriesBurned(weight: number, duration: number, intensity: 'low' | 'moderate' | 'high'): number {
  const MET = intensity === 'low' ? 3.5 : intensity === 'moderate' ? 5.5 : 8;
  return Math.round((MET * weight * duration) / 60);
}
