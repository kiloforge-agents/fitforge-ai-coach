'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFitnessStore, FitnessGoal, FitnessLevel } from '@/lib/store';
import { generateWeeklyPlan } from '@/lib/ai-coach';
import { Edit3, Check, ChevronRight, RotateCcw, Wifi, Bell, Shield, LogOut } from 'lucide-react';

const goalLabels: Record<FitnessGoal, string> = {
  weight_loss: '🔥 Lose Weight',
  muscle_gain: '💪 Build Muscle',
  endurance: '🏃 Endurance',
  flexibility: '🧘 Flexibility',
  general_fitness: '⚡ Stay Fit',
};

const levelLabels: Record<FitnessLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function ProfileView() {
  const { profile, setProfile, setWeeklyPlans, workoutHistory } = useFitnessStore();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profile });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalWorkouts = workoutHistory.length;
  const totalCalories = workoutHistory.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const totalMinutes = workoutHistory.reduce((sum, s) => sum + s.duration, 0);

  const handleSave = () => {
    setProfile(editData);
    const plans = generateWeeklyPlan({ ...profile, ...editData });
    setWeeklyPlans(plans);
    setEditing(false);
  };

  const handleReset = () => {
    setProfile({ onboarded: false });
    window.location.reload();
  };

  const handleRegeneratePlan = () => {
    const plans = generateWeeklyPlan(profile);
    setWeeklyPlans(plans);
  };

  return (
    <div className="min-h-screen pb-4">
      <div className="px-6 pt-14 pb-8" style={{ background: 'linear-gradient(160deg, rgba(99,102,241,0.12) 0%, transparent 70%)' }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {profile.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{levelLabels[profile.level]} · {goalLabels[profile.goal]}</p>
              <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa' }}>FitForge Member</p>
            </div>
          </div>
          <button onClick={() => { setEditing(!editing); setEditData({ ...profile }); }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
            {editing ? <Check size={18} color="#10b981" /> : <Edit3 size={18} color="#6366f1" />}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Workouts', value: totalWorkouts }, { label: 'Calories', value: totalCalories.toLocaleString() }, { label: 'Minutes', value: totalMinutes }].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-card)' }}>
              <p className="text-lg font-bold gradient-text">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 space-y-5">
        {editing ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 className="font-bold">Edit Profile</h3>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>NAME</label>
              <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ field: 'age', label: 'AGE' }, { field: 'weight', label: 'WEIGHT (kg)' }, { field: 'height', label: 'HEIGHT (cm)' }].map((item) => (
                <div key={item.field}>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>{item.label}</label>
                  <input type="number" value={editData[item.field as keyof typeof editData] as number} onChange={(e) => setEditData({ ...editData, [item.field]: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>GOAL</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(goalLabels) as [FitnessGoal, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setEditData({ ...editData, goal: id })} className="py-2 px-3 rounded-xl text-xs font-medium text-left" style={{ background: editData.goal === id ? 'rgba(99,102,241,0.2)' : 'var(--bg-secondary)', border: '1px solid', borderColor: editData.goal === id ? '#6366f1' : 'var(--border-color)', color: editData.goal === id ? '#a78bfa' : 'var(--text-secondary)' }}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>FITNESS LEVEL</label>
              <div className="flex gap-2">
                {(Object.entries(levelLabels) as [FitnessLevel, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setEditData({ ...editData, level: id })} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: editData.level === id ? '#6366f1' : 'var(--bg-secondary)', color: editData.level === id ? 'white' : 'var(--text-secondary)', border: '1px solid', borderColor: editData.level === id ? '#6366f1' : 'var(--border-color)' }}>{label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#6366f1' }}>Save & Regenerate Plan</button>
            </div>
          </motion.div>
        ) : (
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
            <h3 className="font-bold mb-4">Profile Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Goal', value: goalLabels[profile.goal] },
                { label: 'Level', value: levelLabels[profile.level] },
                { label: 'Days/Week', value: `${profile.daysPerWeek} days` },
                { label: 'Weight', value: `${profile.weight} kg` },
                { label: 'Height', value: `${profile.height} cm` },
                { label: 'Age', value: `${profile.age} years` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <h3 className="font-bold px-5 pt-5 pb-3">Settings</h3>
          {[
            { icon: RotateCcw, label: 'Regenerate Workout Plan', desc: 'Get a fresh AI-powered plan', color: '#6366f1', action: handleRegeneratePlan },
            { icon: Bell, label: 'Workout Reminders', desc: 'Push notifications', color: '#f59e0b', action: () => {} },
            { icon: Shield, label: 'Privacy & Data', desc: 'Stored offline on device', color: '#10b981', action: () => {} },
          ].map((item, i) => (
            <button key={item.label} onClick={item.action} className="w-full flex items-center gap-4 px-5 py-4 text-left" style={{ borderTop: i > 0 ? '1px solid var(--border-color)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}><item.icon size={18} color={item.color} /></div>
              <div className="flex-1"><p className="text-sm font-semibold">{item.label}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p></div>
              <ChevronRight size={16} color="#64748b" />
            </button>
          ))}
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}><Wifi size={16} color="#10b981" /></div>
            <div>
              <p className="text-sm font-semibold">Offline Ready</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>App works without internet connection</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
          </div>
        </div>
        <div>
          {showResetConfirm ? (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-sm font-semibold text-red-400 mb-1">Reset all data?</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>This will delete your profile and workout history.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button onClick={handleReset} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: '#ef4444', color: 'white' }}>Reset</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: 'var(--bg-card)', color: '#ef4444' }}>
              <LogOut size={16} />Reset & Start Over
            </button>
          )}
        </div>
        <p className="text-center text-xs pb-4" style={{ color: 'var(--text-secondary)' }}>FitForge AI v1.0 · All data stored locally</p>
      </div>
    </div>
  );
}
