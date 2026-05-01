'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';
import { Watch, Heart, Footprints, Flame, Activity, Bluetooth, BluetoothOff, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function WearableView() {
  const { wearable, updateWearable } = useFitnessStore();
  const [connecting, setConnecting] = useState(false);
  const [heartHistory, setHeartHistory] = useState<{ time: string; bpm: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (wearable.connected) {
      const initial = Array.from({ length: 20 }, (_, i) => ({ time: `${i}`, bpm: 65 + Math.floor(Math.random() * 40) }));
      setHeartHistory(initial);
      intervalRef.current = setInterval(() => {
        const newBpm = Math.max(55, Math.min(185, wearable.heartRate + Math.floor(Math.random() * 11) - 5));
        updateWearable({
          heartRate: newBpm,
          steps: wearable.steps + Math.floor(Math.random() * 10),
          caloriesBurned: wearable.caloriesBurned + Math.floor(Math.random() * 3),
          activeMinutes: wearable.activeMinutes + (Math.random() > 0.7 ? 1 : 0),
          lastSync: new Date().toISOString(),
        });
        setHeartHistory((prev) => [...prev.slice(-19), { time: String(Date.now()), bpm: newBpm }]);
      }, 2000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [wearable.connected]);

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 2500));
    updateWearable({ connected: true, heartRate: 72 + Math.floor(Math.random() * 20), steps: Math.floor(Math.random() * 3000) + 2000, caloriesBurned: Math.floor(Math.random() * 300) + 150, activeMinutes: Math.floor(Math.random() * 40) + 20, lastSync: new Date().toISOString() });
    setConnecting(false);
  };

  const handleDisconnect = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    updateWearable({ connected: false });
    setHeartHistory([]);
  };

  const getHeartZone = (bpm: number) => {
    if (bpm < 60) return { label: 'Resting', color: '#3b82f6' };
    if (bpm < 100) return { label: 'Normal', color: '#10b981' };
    if (bpm < 130) return { label: 'Warm Up', color: '#84cc16' };
    if (bpm < 150) return { label: 'Fat Burn', color: '#f59e0b' };
    if (bpm < 170) return { label: 'Cardio', color: '#f97316' };
    return { label: 'Peak', color: '#ef4444' };
  };

  const zone = getHeartZone(wearable.heartRate);
  const dailyStepsGoal = 10000;
  const stepsProgress = (wearable.steps / dailyStepsGoal) * 100;

  return (
    <div className="min-h-screen pb-4">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold mb-1">Wearable</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Real-time health metrics</p>
      </div>
      <div className="px-6 space-y-4">
        <motion.div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: wearable.connected ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)' }}>
                {wearable.connected ? <Bluetooth size={24} color="#10b981" /> : <BluetoothOff size={24} color="#6366f1" />}
              </div>
              <div>
                <p className="font-bold">{wearable.connected ? 'FitForge Band' : 'No Device'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: wearable.connected ? '#10b981' : '#64748b', animation: wearable.connected ? 'pulse 1.5s infinite' : 'none' }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{wearable.connected ? `Synced ${new Date(wearable.lastSync).toLocaleTimeString()}` : 'Disconnected'}</p>
                </div>
              </div>
            </div>
            {wearable.connected ? (
              <button onClick={handleDisconnect} className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Disconnect</button>
            ) : (
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleConnect} disabled={connecting} className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: connecting ? 'var(--border-color)' : '#6366f1' }}>
                {connecting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Connecting...</> : <><Bluetooth size={14} />Connect</>}
              </motion.button>
            )}
          </div>
        </motion.div>
        <motion.div className="p-5 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)' }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: zone.color, transform: 'translate(30%, -30%)' }} />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart size={16} color="#ef4444" className={wearable.connected ? 'animate-heartbeat' : ''} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Heart Rate</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold" style={{ color: zone.color }}>{wearable.connected ? wearable.heartRate : '--'}</span>
                <span className="text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>bpm</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${zone.color}20`, color: zone.color }}>{zone.label}</span>
          </div>
          {wearable.connected && heartHistory.length > 2 ? (
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={heartHistory}>
                <Line type="monotone" dataKey="bpm" stroke={zone.color} strokeWidth={2} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-16 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{wearable.connected ? 'Collecting data...' : 'Connect device to see live data'}</p>
            </div>
          )}
          <div className="flex gap-1 mt-3">
            {[{ label: 'Rest', range: '< 60', color: '#3b82f6' }, { label: 'Normal', range: '60-100', color: '#10b981' }, { label: 'Cardio', range: '130-150', color: '#f97316' }, { label: 'Peak', range: '170+', color: '#ef4444' }].map((z) => (
              <div key={z.label} className="flex-1 px-1 py-1.5 rounded-lg text-center" style={{ background: `${z.color}10` }}>
                <p className="text-xs font-semibold" style={{ color: z.color }}>{z.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>{z.range}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Footprints size={16} color="#10b981" /><span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Daily Steps</span></div>
            <span className="text-xs font-semibold" style={{ color: '#10b981' }}>Goal: {dailyStepsGoal.toLocaleString()}</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold">{wearable.connected ? wearable.steps.toLocaleString() : '--'}</span>
            <span className="text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>steps</span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: 'var(--border-color)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }} animate={{ width: `${Math.min(stepsProgress, 100)}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{Math.round(stepsProgress)}% of daily goal</p>
        </motion.div>
        <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {[
            { label: 'Calories', value: wearable.connected ? wearable.caloriesBurned : '--', unit: 'kcal', icon: Flame, color: '#f59e0b' },
            { label: 'Active', value: wearable.connected ? wearable.activeMinutes : '--', unit: 'min', icon: Activity, color: '#6366f1' },
          ].map((metric) => (
            <div key={metric.label} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2 mb-2"><metric.icon size={16} color={metric.color} /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{metric.label}</span></div>
              <p className="text-3xl font-bold" style={{ color: metric.color }}>{metric.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{metric.unit}</p>
            </div>
          ))}
        </motion.div>
        <motion.div className="p-5 rounded-2xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-3"><Zap size={16} color="#6366f1" /><span className="font-bold text-sm" style={{ color: '#a78bfa' }}>AI Health Insights</span></div>
          <div className="space-y-2">
            {wearable.connected ? (
              <>
                {wearable.heartRate > 100 && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>⚡ Elevated heart rate detected. Consider slowing down if not exercising.</p>}
                {wearable.steps < 5000 && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>🚶 You've done {wearable.steps} steps. Try to reach 10,000 for optimal health.</p>}
                {wearable.steps >= 5000 && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>✅ Great activity level! You're on track for your daily step goal.</p>}
                {wearable.caloriesBurned > 300 && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>🔥 Excellent calorie burn today! Remember to fuel up with nutritious food.</p>}
              </>
            ) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Connect your wearable device to receive personalized health insights powered by AI analysis.</p>}
          </div>
        </motion.div>
        <motion.div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="font-bold mb-3">Compatible Devices</h3>
          <div className="space-y-2">
            {[
              { name: 'Apple Watch', icon: '⌚', status: 'Supported' },
              { name: 'Fitbit Series', icon: '📿', status: 'Supported' },
              { name: 'Garmin', icon: '🏃', status: 'Supported' },
              { name: 'Samsung Galaxy Watch', icon: '💫', status: 'Supported' },
              { name: 'Whoop Band', icon: '⚡', status: 'Coming Soon' },
            ].map((device) => (
              <div key={device.name} className="flex items-center gap-3 py-1">
                <span className="text-lg">{device.icon}</span>
                <span className="text-sm flex-1">{device.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: device.status === 'Supported' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', color: device.status === 'Supported' ? '#10b981' : '#a78bfa' }}>{device.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
