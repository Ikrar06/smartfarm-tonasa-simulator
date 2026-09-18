import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../store/useSimulationStore';
import { PPM_TARGET_MIN, PPM_TARGET_MAX } from '../engine/constants';
import { Droplets, Sparkles, Thermometer, Waves } from 'lucide-react';
import { useMemo } from 'react';

export const TankVisual: React.FC = () => {
  const volumeAir = useSimulationStore(state => state.volume_air);
  const massaPending = useSimulationStore(state => state.massa_pending);
  const ppm = useSimulationStore(state => state.ppm);
  const suhuAir = useSimulationStore(state => state.suhu_air);

  // Skala, garis ukur, dan tinggi cairan harus memakai kapasitas yang sama.
  const MAX_CAPACITY_L = 1200;
  const fillPercentage = Math.min(100, Math.max(0, (volumeAir / MAX_CAPACITY_L) * 100));
  const scaleMarks = [1200, 1000, 800, 600, 400, 200, 0];

  const solutionTheme = useMemo(() => {
    if (ppm < PPM_TARGET_MIN) {
      return {
        label: 'Encer – Nutrisi Rendah',
        badgeBg: 'bg-sky-950/80 border-sky-600/40 text-sky-300',
        gradientStart: '#38bdf8',
        gradientEnd: '#0284c7',
        glowColor: 'rgba(56, 189, 248, 0.2)',
      };
    } else if (ppm <= PPM_TARGET_MAX) {
      return {
        label: 'Optimal Sehat (Vegetatif)',
        badgeBg: 'bg-emerald-950/80 border-emerald-600/40 text-emerald-300',
        gradientStart: '#10b981',
        gradientEnd: '#047857',
        glowColor: 'rgba(16, 185, 129, 0.25)',
      };
    } else if (ppm <= 800) {
      return {
        label: 'Pekat – Nutrisi Tinggi',
        badgeBg: 'bg-amber-950/80 border-amber-600/40 text-amber-300',
        gradientStart: '#f59e0b',
        gradientEnd: '#b45309',
        glowColor: 'rgba(245, 158, 11, 0.2)',
      };
    } else {
      return {
        label: 'Kritis – Sangat Pekat',
        badgeBg: 'bg-rose-950/80 border-rose-600/40 text-rose-300',
        gradientStart: '#f43f5e',
        gradientEnd: '#be123c',
        glowColor: 'rgba(244, 63, 94, 0.25)',
      };
    }
  }, [ppm]);

  return (
    <div className="w-full rounded-2xl glass-panel overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 shrink-0">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Tangki &amp; Bak Nutrisi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tandon resirkulasi greenhouse kangkung</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
              Kapasitas 1200L
            </span>
            <div className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${solutionTheme.badgeBg} flex items-center gap-1.5`}>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: solutionTheme.gradientStart }}
              />
              {solutionTheme.label}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tank Visual ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-stretch gap-2">
          {/* Skala ditempatkan di luar bak agar tidak tertutup kartu volume. */}
          <div className="relative w-11 h-72 shrink-0 select-none pointer-events-none">
            {scaleMarks.map(liter => (
              <div
                key={liter}
                className="absolute right-0 flex items-center gap-1 -translate-y-1/2"
                style={{ top: `${100 - (liter / MAX_CAPACITY_L) * 100}%` }}
              >
                <span className="text-[10px] font-mono text-slate-400">{liter}L</span>
                <div className="w-2 h-px bg-slate-500" />
              </div>
            ))}
          </div>

          <div className="relative w-full h-72 rounded-xl border-2 border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950 overflow-hidden flex flex-col justify-end">
          {/* Efek refleksi kaca */}
          <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06]" />
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent z-30 pointer-events-none" />

          {/* Garis ukur mengikuti rumus yang sama dengan tinggi cairan. */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {scaleMarks.map(liter => (
              <div
                key={liter}
                className="absolute left-0 right-0 border-t border-slate-500/30"
                style={{ top: `${100 - (liter / MAX_CAPACITY_L) * 100}%` }}
              />
            ))}
          </div>

          {/* Probe TDS sensor */}
          <div className="absolute top-0 right-12 z-20 flex flex-col items-center pointer-events-none">
            <div className="w-0.5 h-20 bg-gradient-to-b from-slate-500 to-slate-400" />
            <div className="w-5 h-14 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-md border border-slate-600/60 flex flex-col items-center justify-between py-1">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: solutionTheme.gradientStart,
                  boxShadow: `0 0 6px ${solutionTheme.gradientStart}`,
                }}
              />
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-amber-400 rounded-b-sm" />
                <div className="w-1 h-3 bg-amber-400 rounded-b-sm" />
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
              Probe TDS (gh-01)
            </span>
          </div>

          {/* Partikel pelarutan nutrisi */}
          <AnimatePresence>
            {massaPending > 0 && (
              <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-20 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, x: 220 + (i % 4) * 15, opacity: 1, scale: 0.9 }}
                    animate={{
                      y: [0, 160 + i * 12],
                      x: [220 + (i % 4) * 15, 200 + i * 18],
                      opacity: [1, 0.8, 0],
                      scale: [0.9, 0.5, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6 + i * 0.2, delay: i * 0.15 }}
                    className="absolute w-2 h-2 rounded-full bg-amber-300"
                    style={{ boxShadow: '0 0 6px rgba(251,191,36,0.8)' }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Kolom cairan */}
          <motion.div
            className="relative w-full overflow-hidden z-10"
            animate={{ height: `${fillPercentage}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              background: `linear-gradient(180deg, ${solutionTheme.gradientStart} 0%, ${solutionTheme.gradientEnd} 100%)`,
              boxShadow: `0 0 30px ${solutionTheme.glowColor} inset`,
            }}
          >
            {/* Gelombang permukaan */}
            <div className="absolute top-0 left-0 right-0 h-4 -translate-y-2 opacity-70 overflow-hidden pointer-events-none">
              <motion.svg
                viewBox="0 0 500 20"
                preserveAspectRatio="none"
                className="w-[200%] h-full"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              >
                <path
                  d="M 0 10 Q 60 0 125 10 T 250 10 T 375 10 T 500 10 T 625 10 T 750 10 T 875 10 T 1000 10 L 1000 20 L 0 20 Z"
                  fill={solutionTheme.gradientStart}
                  fillOpacity="0.6"
                />
              </motion.svg>
            </div>

            {/* Buih sirkulasi */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: ['100%', '-20%'], opacity: [0, 0.6, 0], scale: [0.5, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 3 + i * 0.7, delay: i * 0.6 }}
                  className="absolute w-2 h-2 rounded-full bg-white/40"
                  style={{ left: `${20 + i * 15}%` }}
                />
              ))}
            </div>

            {/* Pompa label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-sm text-[10px] text-slate-200 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">Pompa Sirkulasi Aktif</span>
            </div>
          </motion.div>

          </div>
        </div>

        {/* Info dipisahkan dari bak agar seluruh skala tetap terbaca. */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="z-20 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Droplets className="w-3 h-3 text-cyan-400" /> Volume
            </div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
              {volumeAir.toFixed(1)}<span className="text-xs font-normal text-slate-400 ml-1">L</span>
            </div>
          </div>

          <div className="z-20 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700/50 text-right">
            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
              <Thermometer className="w-3 h-3 text-amber-400" /> Suhu
            </div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
              {suhuAir.toFixed(1)}<span className="text-xs font-normal text-slate-400 ml-0.5">°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notif pelarutan aktif */}
      <div className="px-5 pb-4 pt-2">
        <AnimatePresence>
          {massaPending > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-600/30 text-amber-300 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
              <span>Melarutkan {massaPending.toFixed(1)}g AB mix tersisa — PPM naik bertahap</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
