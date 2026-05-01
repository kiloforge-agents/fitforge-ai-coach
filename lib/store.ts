import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: FitnessGoal;
  level: FitnessLevel;
  daysPerWeek: number;
  equipment: string[];
  onboarded: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  muscle: string;
  difficulty: FitnessLevel;
  instructions: string;
  calories: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  estimatedDuration: number;
  totalCalories: number;
  completed: boolean;
  completedAt?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  caloriesBurned: number;
  heartRateAvg: number;
  exercisesCompleted: number;
  totalExercises: number;
}

export interface WearableData {
  heartRate: number;
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  connected: boolean;
  lastSync: string;
}

interface FitnessStore {
  profile: UserProfile;
  currentWorkout: WorkoutPlan | null;
  workoutHistory: WorkoutSession[];
  weeklyPlans: WorkoutPlan[];
  wearable: WearableData;
  activeTab: string;
  setProfile: (profile: Partial<UserProfile>) => void;
  setCurrentWorkout: (workout: WorkoutPlan | null) => void;
  addWorkoutSession: (session: WorkoutSession) => void;
  setWeeklyPlans: (plans: WorkoutPlan[]) => void;
  updateWearable: (data: Partial<WearableData>) => void;
  setActiveTab: (tab: string) => void;
  completeWorkout: (workoutId: string) => void;
}

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set) => ({
      profile: {
        name: '',
        age: 28,
        weight: 75,
        height: 175,
        goal: 'general_fitness',
        level: 'intermediate',
        daysPerWeek: 4,
        equipment: ['dumbbells', 'bodyweight'],
        onboarded: false,
      },
      currentWorkout: null,
      workoutHistory: [],
      weeklyPlans: [],
      wearable: {
        heartRate: 72,
        steps: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
        connected: false,
        lastSync: new Date().toISOString(),
      },
      activeTab: 'dashboard',
      setProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),
      setCurrentWorkout: (workout) => set({ currentWorkout: workout }),
      addWorkoutSession: (session) => set((state) => ({ workoutHistory: [session, ...state.workoutHistory].slice(0, 100) })),
      setWeeklyPlans: (plans) => set({ weeklyPlans: plans }),
      updateWearable: (data) => set((state) => ({ wearable: { ...state.wearable, ...data } })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      completeWorkout: (workoutId) => set((state) => ({ weeklyPlans: state.weeklyPlans.map((p) => p.id === workoutId ? { ...p, completed: true, completedAt: new Date().toISOString() } : p) })),
    }),
    { name: 'fitforge-storage' }
  )
);
