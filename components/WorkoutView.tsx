'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore, Exercise, WorkoutPlan } from '@/lib/store';
import { estimateCaloriesBurned } from '@/lib/ai-coach';
import { format } from 'date-fns';
import { Play, Check, Clock, Flame, Dumbbell, ChevronDown, ChevronUp, X, Trophy } from 'lucide-react';

const muscleColors: Record<string, string> = {
  Chest: '#ef4444', Back: '#3b82f6', Legs: '#10b981', Shoulders: '#f59e0b',
  Core: '#8b5cf6', Cardio: '#ec4899', 'Full Body': '#6366f1', 'Legs/Cardio': '#14b8a6',
};

export default function WorkoutView() {
  const { weeklyPlans, profile, addWorkoutSession, completeWorkout } = useFitnessStore();
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [workoutDone, setWorkoutDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const upcomingWorkouts = weeklyPlans.filter((p) => !p.completed);
  const completedWorkouts = weeklyPlans.filter((p) => p.completed);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeWorkout && !workoutDone) {
      workoutTimerRef.current = setInterval(() => setWorkoutTime((t) => t + 1), 1000);
    }
    return () => { if (workoutTimerRef.current) clearInterval(workoutTimerRef.current); };
  }, [activeWorkout, workoutDone]);

  const startRest = (seconds: number) => {
    setRestTimer(seconds);
    setIsResting(true);
    timerRef.current = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); setIsResting(false); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSetComplete = () => {
    const exercise = selectedPlan!.exercises[currentExerciseIndex];
    if (currentSet < exercise.sets) {
      setCurrentSet((s) => s + 1);
      startRest(exercise.rest);
    } else {
      setCompletedExercises((prev) => new Set([...prev, currentExerciseIndex]));
      if (currentExerciseIndex < selectedPlan!.exercises.length - 1) {
        setCurrentExerciseIndex((i) => i + 1);
        setCurrentSet(1);
        startRest(exercise.rest);
      } else {
        finishWorkout();
      }
    }
  };

  const finishWorkout = () => {
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    setWorkoutDone(true);
    const durationMins = Math.round(workoutTime / 60);
    const cals = estimateCaloriesBurned(profile.weight, durationMins, 'moderate');
    addWorkoutSession({
      id: `session-${Date.now()}`,
      workoutId: selectedPlan!.id,
      date: new Date().toISOString(),
      duration: durationMins,
      caloriesBurned: cals,
      heartRateAvg: 135 + Math.floor(Math.random() * 30),
      exercisesCompleted: completedExercises.size + 1,
      totalExercises: selectedPlan!.exercises.length,
    });
    completeWorkout(selectedPlan!.id);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const resetWorkout = () => {
    setWorkoutDone(false);
    setSelectedPlan(null);
    setActiveWorkout(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCompletedExercises(new Set());
    setWorkoutTime(0);
  };

  if (workoutDone && selectedPlan) {
    const durationMins = Math.round(workoutTime / 60);
    const cals = estimateCaloriesBurned(profile.weight, durationMins, 'moderate');
    return <CompletionScreen workout={selectedPlan} duration={durationMins} calories={cals} onClose={resetWorkout} />;
  }

  if (activeWorkout && selectedPlan) {
    const exercise = selectedPlan.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + (currentSet / exercise.sets)) / selectedPlan.exercises.length) * 100;
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="px-6 pt-14 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setActiveWorkout(false); setCurrentExerciseIndex(0); setCurrentSet(1); setCompletedExercises(new Set()); setWorkoutTime(0); }} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
              <X size={18} color="#94a3b8" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{selectedPlan.name}</p>
              <p className="font-mono font-bold" style={{ color: '#6366f1' }}>{formatTime(workoutTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{currentExerciseIndex + 1}/{selectedPlan.exercises.length}</p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-card)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
        <div className="px-6">
          <AnimatePresence>
            {isResting && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-4 p-6 rounded-2xl text-center" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#a78bfa' }}>REST TIME</p>
                <p className="text-5xl font-bold mb-2 font-mono" style={{ color: '#6366f1' }}>{restTimer}s</p>
                <button onClick={() => { clearInterval(timerRef.current!); setIsResting(false); }} className="text-sm px-4 py-2 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a78bfa' }}>Skip Rest</button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={currentExerciseIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mb-6">
              <div className="p-5 rounded-2xl mb-4" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${muscleColors[exercise.muscle] || '#6366f1'}20`, color: muscleColors[exercise.muscle] || '#6366f1' }}>{exercise.muscle}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{exercise.name}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Set</p>
                    <p className="text-2xl font-bold" style={{ color: '#6366f1' }}>{currentSet}<span className="text-base text-gray-500">/{exercise.sets}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reps</p><p className="text-xl font-bold">{exercise.reps}</p></div>
                  <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rest</p><p className="text-xl font-bold">{exercise.rest}s</p></div>
                  <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>~Cal</p><p className="text-xl font-bold">{exercise.calories * exercise.sets}</p></div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.07)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>💡 {exercise.instructions}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-6 justify-center">
                {Array.from({ length: exercise.sets }).map((_, i) => (
                  <div key={i} className="h-2 flex-1 rounded-full" style={{ background: i < currentSet - 1 ? '#10b981' : i === currentSet - 1 ? '#6366f1' : 'var(--border-color)' }} />
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSetComplete} disabled={isResting} className="w-full py-5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2" style={{ background: isResting ? 'var(--bg-card)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', opacity: isResting ? 0.5 : 1 }}>
                <Check size={22} />
                {currentSet < exercise.sets ? `Complete Set ${currentSet}` : 'Exercise Done!'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>UPCOMING</p>
            <div className="space-y-2">
              {selectedPlan.exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((ex) => (
                <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}><Dumbbell size={14} color="#6366f1" /></div>
                  <div>
                    <p className="text-sm font-medium">{ex.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ex.sets}×{ex.reps}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold mb-1">Your Workouts</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">AI-personalized training plan</p>
      </div>
      <div className="px-6 space-y-6">
        <div>
          <h2 className="font-bold mb-3">Upcoming</h2>
          {upcomingWorkouts.length === 0 ? (
            <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--bg-card)' }}>
              <Trophy size={32} color="#f59e0b" className="mx-auto mb-2" />
              <p className="font-semibold">All workouts complete!</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Amazing week! Rest up for next week.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingWorkouts.map((plan) => (
                <WorkoutCard key={plan.id} plan={plan} onSelect={() => setSelectedPlan(plan)} onStart={() => { setSelectedPlan(plan); setActiveWorkout(true); setCurrentExerciseIndex(0); setCurrentSet(1); setCompletedExercises(new Set()); setWorkoutTime(0); setWorkoutDone(false); }} isSelected={selectedPlan?.id === plan.id} />
              ))}
            </div>
          )}
        </div>
        {completedWorkouts.length > 0 && (
          <div>
            <h2 className="font-bold mb-3">Completed</h2>
            <div className="space-y-3">
              {completedWorkouts.map((plan) => (
                <div key={plan.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg-card)', opacity: 0.7 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}><Check size={20} color="#10b981" /></div>
                  <div><p className="font-semibold">{plan.name}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{format(new Date(plan.completedAt || plan.date), 'MMM d')} · {plan.exercises.length} exercises</p></div>
                  <span className="ml-auto text-sm font-semibold" style={{ color: '#10b981' }}>Done ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedPlan && !activeWorkout && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Exercises</h2>
              <button onClick={() => setSelectedPlan(null)}><X size={18} color="#94a3b8" /></button>
            </div>
            <div className="space-y-2 mb-4">
              {selectedPlan.exercises.map((exercise, i) => <ExerciseCard key={exercise.id} exercise={exercise} index={i} />)}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setActiveWorkout(true); setCurrentExerciseIndex(0); setCurrentSet(1); setCompletedExercises(new Set()); setWorkoutTime(0); setWorkoutDone(false); }} className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Play size={20} fill="white" />Start Workout
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function WorkoutCard({ plan, onSelect, onStart, isSelected }: { plan: WorkoutPlan; onSelect: () => void; onStart: () => void; isSelected: boolean }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="p-4 rounded-2xl cursor-pointer" style={{ background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)', border: '1px solid', borderColor: isSelected ? 'rgba(99, 102, 241, 0.4)' : 'transparent' }} onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{format(new Date(plan.date), 'EEE, MMM d')}</p>
          <h3 className="font-bold">{plan.name}</h3>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onStart(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm" style={{ background: '#6366f1', color: 'white' }}>
          <Play size={14} fill="white" />Go
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1"><Dumbbell size={13} color="#6366f1" /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.exercises.length} exercises</span></div>
        <div className="flex items-center gap-1"><Clock size={13} color="#94a3b8" /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.estimatedDuration} min</span></div>
        <div className="flex items-center gap-1"><Flame size={13} color="#f59e0b" /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.totalCalories} kcal</span></div>
      </div>
    </motion.div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = muscleColors[exercise.muscle] || '#6366f1';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${color}20`, color }}>{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{exercise.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{exercise.sets}×{exercise.reps} · {exercise.rest}s rest</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}20`, color }}>{exercise.muscle}</span>
        {expanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-1">
              <p className="text-xs leading-relaxed p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.07)', color: 'var(--text-secondary)' }}>{exercise.instructions}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompletionScreen({ workout, duration, calories, onClose }: { workout: WorkoutPlan; duration: number; calories: number; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>
        <Trophy size={48} color="white" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold mb-2">Workout Complete! 🎉</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8" style={{ color: 'var(--text-secondary)' }}>{workout.name}</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-3 gap-4 w-full mb-8">
        {[
          { label: 'Duration', value: `${duration}m`, color: '#6366f1' },
          { label: 'Calories', value: calories, color: '#f59e0b' },
          { label: 'Exercises', value: workout.exercises.length, color: '#10b981' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </motion.div>
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.97 }} onClick={onClose} className="w-full py-4 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Back to Workouts</motion.button>
    </motion.div>
  );
}
