'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore, FitnessGoal, FitnessLevel } from '@/lib/store';
import { generateWeeklyPlan } from '@/lib/ai-coach';
import { Zap, ChevronRight, Check, Activity } from 'lucide-react';

const goals: { id: FitnessGoal; label: string; emoji: string; desc: string }[] = [
  { id: 'weight_loss', label: 'Lose Weight', emoji: '🔥', desc: 'Burn fat & get lean' },
  { id: 'muscle_gain', label: 'Build Muscle', emoji: '💪', desc: 'Gain strength & size' },
  { id: 'endurance', label: 'Endurance', emoji: '🏃', desc: 'Boost stamina & cardio' },
  { id: 'flexibility', label: 'Flexibility', emoji: '🧘', desc: 'Mobility & recovery' },
  { id: 'general_fitness', label: 'Stay Fit', emoji: '⚡', desc: 'Overall wellness' },
];

const levels: { id: FitnessLevel; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New to working out' },
  { id: 'intermediate', label: 'Intermediate', desc: '1-2 years experience' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years experience' },
];

const equipmentOptions = [
  { id: 'bodyweight', label: 'Bodyweight', icon: '🤸' },
  { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { id: 'resistance_bands', label: 'Bands', icon: '🔗' },
  { id: 'pull_up_bar', label: 'Pull-up Bar', icon: '⬆️' },
  { id: 'gym', label: 'Full Gym', icon: '🏟️' },
  { id: 'kettlebell', label: 'Kettlebell', icon: '⚙️' },
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const { profile, setProfile, setWeeklyPlans } = useFitnessStore();

  const totalSteps = 5;
  const progress = (step / (totalSteps - 1)) * 100;

  const handleNext = () => { if (step < totalSteps - 1) setStep(step + 1); };

  const handleFinish = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    const plans = generateWeeklyPlan(profile);
    setWeeklyPlans(plans);
    setProfile({ onboarded: true });
  };

  const toggleEquipment = (id: string) => {
    const current = profile.equipment;
    if (current.includes(id)) {
      setProfile({ equipment: current.filter((e) => e !== id) });
    } else {
      setProfile({ equipment: [...current, id] });
    }
  };

  const variants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span className="font-bold text-lg gradient-text">FitForge AI</span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ background: 'var(--bg-card)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Step {step + 1} of {totalSteps}</p>
      </div>

      <div className="flex-1 px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }} className="h-full">
            {step === 0 && (
              <div className="pt-4">
                <h1 className="text-3xl font-bold mb-2">What's your name?</h1>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Your AI coach needs to know who they're training.</p>
                <input type="text" placeholder="Enter your name..." value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} className="w-full px-4 py-4 rounded-2xl text-lg font-medium outline-none" style={{ background: 'var(--bg-card)', border: '2px solid', borderColor: profile.name ? '#6366f1' : 'var(--border-color)', color: 'var(--text-primary)' }} autoFocus />
                <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <p className="text-sm" style={{ color: '#a78bfa' }}>🤖 Your AI coach will create a completely personalized fitness plan based on your goals, fitness level, and available equipment.</p>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="pt-4">
                <h1 className="text-3xl font-bold mb-2">What's your goal?</h1>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Choose your primary fitness objective.</p>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <motion.button key={goal.id} whileTap={{ scale: 0.97 }} onClick={() => setProfile({ goal: goal.id })} className="w-full flex items-center gap-4 p-4 rounded-2xl text-left" style={{ background: profile.goal === goal.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)', border: '2px solid', borderColor: profile.goal === goal.id ? '#6366f1' : 'var(--border-color)' }}>
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1"><p className="font-semibold">{goal.label}</p><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{goal.desc}</p></div>
                      {profile.goal === goal.id && <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#6366f1' }}><Check size={14} color="white" /></div>}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="pt-4">
                <h1 className="text-3xl font-bold mb-2">Fitness Level</h1>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>How experienced are you?</p>
                <div className="space-y-4">
                  {levels.map((level, i) => (
                    <motion.button key={level.id} whileTap={{ scale: 0.97 }} onClick={() => setProfile({ level: level.id })} className="w-full flex items-center gap-4 p-5 rounded-2xl text-left" style={{ background: profile.level === level.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)', border: '2px solid', borderColor: profile.level === level.id ? '#6366f1' : 'var(--border-color)' }}>
                      <div className="flex gap-1">{[0, 1, 2].map((bar) => <div key={bar} className="w-2 rounded-sm" style={{ height: `${12 + bar * 8}px`, background: bar <= i ? '#6366f1' : 'var(--border-color)' }} />)}</div>
                      <div className="flex-1"><p className="font-semibold">{level.label}</p><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{level.desc}</p></div>
                      {profile.level === level.id && <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#6366f1' }}><Check size={14} color="white" /></div>}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Days per week</p>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map((day) => (
                      <button key={day} onClick={() => setProfile({ daysPerWeek: day })} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: profile.daysPerWeek === day ? '#6366f1' : 'var(--bg-card)', color: profile.daysPerWeek === day ? 'white' : 'var(--text-secondary)', border: '2px solid', borderColor: profile.daysPerWeek === day ? '#6366f1' : 'var(--border-color)' }}>{day}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="pt-4">
                <h1 className="text-3xl font-bold mb-2">Equipment</h1>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>What do you have access to?</p>
                <div className="grid grid-cols-2 gap-3">
                  {equipmentOptions.map((eq) => (
                    <motion.button key={eq.id} whileTap={{ scale: 0.95 }} onClick={() => toggleEquipment(eq.id)} className="flex items-center gap-3 p-4 rounded-2xl text-left" style={{ background: profile.equipment.includes(eq.id) ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)', border: '2px solid', borderColor: profile.equipment.includes(eq.id) ? '#6366f1' : 'var(--border-color)' }}>
                      <span className="text-xl">{eq.icon}</span>
                      <span className="font-medium text-sm">{eq.label}</span>
                      {profile.equipment.includes(eq.id) && <Check size={14} color="#6366f1" className="ml-auto" />}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Weight (kg): <span style={{ color: '#6366f1' }}>{profile.weight} kg</span></p>
                    <input type="range" min="40" max="150" value={profile.weight} onChange={(e) => setProfile({ weight: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#6366f1' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Height (cm): <span style={{ color: '#6366f1' }}>{profile.height} cm</span></p>
                    <input type="range" min="140" max="220" value={profile.height} onChange={(e) => setProfile({ height: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#6366f1' }} />
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="pt-4 text-center">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Activity size={40} color="white" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Ready, {profile.name || 'Athlete'}!</h1>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Your AI coach is ready to build your personalized {profile.daysPerWeek}-day workout plan.</p>
                <div className="space-y-3 text-left mb-8">
                  {[
                    { icon: '🎯', text: `Goal: ${goals.find((g) => g.id === profile.goal)?.label}` },
                    { icon: '⚡', text: `Level: ${levels.find((l) => l.id === profile.level)?.label}` },
                    { icon: '📅', text: `Schedule: ${profile.daysPerWeek} days/week` },
                    { icon: '🏋️', text: `Equipment: ${profile.equipment.length} items` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                      <span>{item.icon}</span>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 py-8">
        <motion.button whileTap={{ scale: 0.97 }} onClick={step < totalSteps - 1 ? handleNext : handleFinish} disabled={(step === 0 && !profile.name.trim()) || (step === 3 && profile.equipment.length === 0) || generating} className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', opacity: (step === 0 && !profile.name.trim()) || (step === 3 && profile.equipment.length === 0) || generating ? 0.5 : 1 }}>
          {generating ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating your plan...</>) : step < totalSteps - 1 ? (<>Continue <ChevronRight size={20} /></>) : (<><Zap size={20} fill="white" />Launch My Fitness Journey</>)}
        </motion.button>
      </div>
    </div>
  );
}
