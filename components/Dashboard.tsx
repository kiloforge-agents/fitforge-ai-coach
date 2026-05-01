'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';
import { getAIMotivation, generateWeeklyPlan } from '@/lib/ai-coach';
import { format } from 'date-fns';
import { Zap, Flame, Clock, Target, ChevronRight, Dumbbell, TrendingUp, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, weeklyPlans, workoutHistory, wearable, setWeeklyPlans } = useFitnessStore();
  const [motivation, setMotivation] = useState('');
  const [greeting, setGreeting] = useState('');

  const streak = workoutHistory.filter((s, i) => i < 7).length;
  const todayWorkout = weeklyPlans.find((p) => !p.completed) || weeklyPlans[0];
  const completedThisWeek = weeklyPlans.filter((p) => p.completed).length;
  const totalCaloriesToday = workoutHistory
    .filter((s) => s.date.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, s) => sum + s.caloriesBurned, 0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    setMotivation(getAIMotivation(profile, streak));
  }, [profile, streak]);

  const handleRegeneratePlan = () => {
    const plans = generateWeeklyPlan(profile);
    setWeeklyPlans(plans);
  };

  const stats = [
    { label: 'Streak', value: `${streak}d`, icon: Flame, color: '#f59e0b' },
    { label: 'This Week', value: `${completedThisWeek}/${weeklyPlans.length}`, icon: Target, color: '#10b981' },
    { label: 'Calories', value: totalCaloriesToday || wearable.caloriesBurned, icon: Zap, color: '#6366f1' },
    { label: 'Active', value: `${wearable.activeMinutes}m`, icon: Clock, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen pb-4">
      <div className="px-6 pt-14 pb-8 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(99,102,241,0.15) 0%, transparent 60%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{greeting} 👋</p>
            <h1 className="text-2xl font-bold">{profile.name || 'Athlete'}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Zap size={24} color="white" fill="white" />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>AI Coach</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{motivation}</p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="px-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex flex-col items-center p-3 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
              <stat.icon size={18} color={stat.color} />
              <p className="text-base font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
        {todayWorkout ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Today's Workout</h2>
              <button onClick={handleRegeneratePlan} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                <RefreshCw size={12} />Regenerate
              </button>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => onNavigate('workout')} className="w-full p-5 rounded-2xl text-left relative overflow-hidden" style={{ background: todayWorkout.completed ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))', border: '1px solid', borderColor: todayWorkout.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(30%, -30%)' }} />
              {todayWorkout.completed ? (
                <div className="flex items-center gap-2 mb-2"><span className="text-green-400 text-sm font-semibold">✓ Completed</span></div>
              ) : (
                <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6366f1' }} /><span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>UPCOMING</span></div>
              )}
              <h3 className="text-xl font-bold mb-1">{todayWorkout.name}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{todayWorkout.exercises.length} exercises · AI personalized</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><Clock size={14} color="#94a3b8" /><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{todayWorkout.estimatedDuration} min</span></div>
                <div className="flex items-center gap-1.5"><Flame size={14} color="#f59e0b" /><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{todayWorkout.totalCalories} kcal</span></div>
                <div className="ml-auto flex items-center gap-1 text-sm font-semibold" style={{ color: '#6366f1' }}>Start <ChevronRight size={16} /></div>
              </div>
            </motion.button>
          </motion.div>
        ) : (
          <div className="p-5 rounded-2xl text-center" style={{ background: 'var(--bg-card)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No workout planned.</p>
            <button onClick={handleRegeneratePlan} className="mt-2 text-sm font-semibold" style={{ color: '#6366f1' }}>Generate Plan</button>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">This Week</h2>
            <button onClick={() => onNavigate('workout')} className="text-sm font-semibold" style={{ color: '#6366f1' }}>View All</button>
          </div>
          <div className="space-y-2">
            {weeklyPlans.slice(0, 4).map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: plan.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.1)' }}>
                  {plan.completed ? <span className="text-green-400 text-lg">✓</span> : <Dumbbell size={18} color="#6366f1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{plan.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{format(new Date(plan.date), 'EEE, MMM d')} · {plan.exercises.length} exercises</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: plan.completed ? '#10b981' : '#6366f1' }}>{plan.completed ? 'Done' : `${plan.estimatedDuration}m`}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="font-bold text-lg mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'View Progress', icon: TrendingUp, color: '#10b981', tab: 'progress' },
              { label: 'Sync Wearable', icon: WatchIcon, color: '#f59e0b', tab: 'wearable' },
            ].map((action) => (
              <motion.button key={action.label} whileTap={{ scale: 0.96 }} onClick={() => onNavigate(action.tab)} className="flex items-center gap-3 p-4 rounded-2xl text-left" style={{ background: 'var(--bg-card)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}20` }}><action.icon size={20} color={action.color} /></div>
                <span className="font-medium text-sm">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function WatchIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="7" />
      <path d="M12 10v4l2 2" />
      <path d="M8 2h8" />
      <path d="M8 22h8" />
    </svg>
  );
}
