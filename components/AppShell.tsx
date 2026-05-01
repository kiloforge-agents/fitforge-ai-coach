'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Dumbbell, TrendingUp, Watch, User } from 'lucide-react';
import Dashboard from './Dashboard';
import WorkoutView from './WorkoutView';
import ProgressView from './ProgressView';
import WearableView from './WearableView';
import ProfileView from './ProfileView';

const tabs = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
  { id: 'workout', label: 'Workout', Icon: Dumbbell },
  { id: 'progress', label: 'Progress', Icon: TrendingUp },
  { id: 'wearable', label: 'Wearable', Icon: Watch },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const pageVariants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'workout' && <WorkoutView />}
            {activeTab === 'progress' && <ProgressView />}
            {activeTab === 'wearable' && <WearableView />}
            {activeTab === 'profile' && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50" style={{ background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1" style={{ minHeight: '56px' }}>
                <motion.div animate={{ scale: isActive ? 1.1 : 1 }} transition={{ duration: 0.2 }} className="relative">
                  {isActive && <motion.div layoutId="tab-indicator" className="absolute inset-0 -m-2 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }} />}
                  <Icon size={22} color={isActive ? '#6366f1' : '#64748b'} style={{ position: 'relative', zIndex: 1 }} />
                </motion.div>
                <span className="text-xs font-medium" style={{ color: isActive ? '#6366f1' : '#64748b' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
