'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';
import { calculateBMI } from '@/lib/ai-coach';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Flame, Clock, Dumbbell, Target } from 'lucide-react';

export default function ProgressView() {
  const { workoutHistory, weeklyPlans, profile } = useFitnessStore();
  const { bmi, category } = calculateBMI(profile.weight, profile.height);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const session = workoutHistory.find((s) => s.date.startsWith(dateStr));
      return { day: format(date, 'EEE'), calories: session?.caloriesBurned || 0, duration: session?.duration || 0, completed: !!session };
    });
  }, [workoutHistory]);

  const totalWorkouts = workoutHistory.length;
  const totalCalories = workoutHistory.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const totalMinutes = workoutHistory.reduce((sum, s) => sum + s.duration, 0);
  const avgHeartRate = workoutHistory.length > 0 ? Math.round(workoutHistory.reduce((sum, s) => sum + s.heartRateAvg, 0) / workoutHistory.length) : 72;

  const completedThisWeek = weeklyPlans.filter((p) => p.completed).length;
  const weeklyGoal = weeklyPlans.length || profile.daysPerWeek;
  const weeklyProgress = (completedThisWeek / weeklyGoal) * 100;
  const bmiColor = bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444';

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <p className="font-semibold">{label}</p>
          {payload.map((p) => (<p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pb-4">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold mb-1">Progress</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track your fitness journey</p>
      </div>
      <div className="px-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Workouts', value: totalWorkouts, icon: Dumbbell, color: '#6366f1' },
            { label: 'Calories Burned', value: `${totalCalories}`, icon: Flame, color: '#f59e0b' },
            { label: 'Total Minutes', value: totalMinutes, icon: Clock, color: '#10b981' },
            { label: 'Avg Heart Rate', value: `${avgHeartRate} bpm`, icon: TrendingUp, color: '#ef4444' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-2"><stat.icon size={18} color={stat.color} /><div className="w-1.5 h-1.5 rounded-full" style={{ background: stat.color }} /></div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold mb-1">Weekly Goal</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{completedThisWeek} of {weeklyGoal} workouts</p>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: weeklyGoal }).map((_, i) => (
                  <div key={i} className="h-2 flex-1 rounded-full" style={{ background: i < completedThisWeek ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'var(--border-color)' }} />
                ))}
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="url(#progressGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(weeklyProgress / 100) * 188.5} 188.5`} />
                <defs><linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold">{Math.round(weeklyProgress)}%</span></div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <h3 className="font-bold mb-4">Calories This Week</h3>
          {totalCalories === 0 ? (
            <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-secondary)' }}><Flame size={32} color="#f59e0b" className="mb-2 opacity-40" /><p className="text-sm">Complete workouts to see your data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={last7Days} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs><linearGradient id="caloriesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#6366f1" strokeWidth={2} fill="url(#caloriesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <h3 className="font-bold mb-4">Workout Duration (min)</h3>
          {totalMinutes === 0 ? (
            <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-secondary)' }}><Clock size={32} color="#10b981" className="mb-2 opacity-40" /><p className="text-sm">No workout data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={last7Days} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <h3 className="font-bold mb-4">Body Metrics</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>BMI</p>
              <p className="text-3xl font-bold" style={{ color: bmiColor }}>{bmi}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block" style={{ background: `${bmiColor}20`, color: bmiColor }}>{category}</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Weight</span><span className="font-semibold">{profile.weight} kg</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Height</span><span className="font-semibold">{profile.height} cm</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Age</span><span className="font-semibold">{profile.age} yrs</span></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex gap-0.5 h-3 rounded-full overflow-hidden mb-1">
              {[{ color: '#3b82f6' }, { color: '#10b981' }, { color: '#f59e0b' }, { color: '#ef4444' }].map((r, i) => (
                <div key={i} className="flex-1" style={{ background: r.color, opacity: 0.7 }} />
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}><span>Under</span><span>Normal</span><span>Over</span><span>Obese</span></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <h3 className="font-bold mb-4">Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '🏆', label: 'First Workout', unlocked: totalWorkouts >= 1 },
              { emoji: '🔥', label: '3-Day Streak', unlocked: totalWorkouts >= 3 },
              { emoji: '💪', label: '10 Workouts', unlocked: totalWorkouts >= 10 },
              { emoji: '⚡', label: '5k Calories', unlocked: totalCalories >= 5000 },
              { emoji: '🎯', label: 'Weekly Goal', unlocked: completedThisWeek >= weeklyGoal && weeklyGoal > 0 },
              { emoji: '🌟', label: 'Elite', unlocked: totalWorkouts >= 50 },
            ].map((achievement) => (
              <div key={achievement.label} className="flex flex-col items-center p-3 rounded-xl gap-1" style={{ background: achievement.unlocked ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: achievement.unlocked ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', opacity: achievement.unlocked ? 1 : 0.4 }}>
                <span className="text-2xl">{achievement.emoji}</span>
                <span className="text-xs text-center leading-tight" style={{ color: achievement.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{achievement.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
