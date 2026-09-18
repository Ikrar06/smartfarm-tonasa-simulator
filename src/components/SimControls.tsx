import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Play,
  Pause,
  Zap,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  Radio,
} from 'lucide-react';

export const SimControls: React.FC = () => {
  const {
    isRunning,
    speedMultiplier,
    accelerateSendInterval,
    baseSendIntervalSec,
    countdownSec,
    lastSendStatus,
    lastSendMessage,
    toggleRunning,
    setSpeedMultiplier,
    setAccelerateSendInterval,
    sendReadingNow,
  } = useSimulationStore();

  const effectiveInterval = accelerateSendInterval
    ? Math.max(1, Math.round(baseSendIntervalSec / speedMultiplier))
    : baseSendIntervalSec;

  const countdownPercent = Math.min(
    100,
    Math.max(0, ((effectiveInterval - countdownSec) / effectiveInterval) * 100)
  );

  return (
    <div className="w-full rounded-2xl glass-panel overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Mesin Simulasi &amp; Transmisi IoT</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kecepatan waktu dan sinkronisasi Supabase</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            isSupabaseConfigured
              ? 'bg-emerald-950/60 border-emerald-700/40 text-emerald-300'
              : 'bg-amber-950/60 border-amber-700/40 text-amber-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConfigured ? 'Supabase Live' : 'Mock Mode'}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-5">
        {/* Row 1: Play/Pause + Speed */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={toggleRunning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-600/40'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4" /> Pause</>
            ) : (
              <><Play className="w-4 h-4 fill-current" /> Jalankan</>
            )}
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400">Kecepatan</span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {[1, 2, 5, 10].map(speed => (
                <button
                  key={speed}
                  onClick={() => setSpeedMultiplier(speed)}
                  className={`w-9 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                    speedMultiplier === speed
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={speedMultiplier}
              onChange={e => setSpeedMultiplier(parseInt(e.target.value) || 1)}
              className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              title={`Kecepatan: ${speedMultiplier}x`}
            />
            <span className="text-xs font-mono font-bold text-emerald-400 w-6 text-right">
              {speedMultiplier}x
            </span>
          </div>
        </div>

        {/* Row 2: Countdown + Send controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          {/* Circular countdown */}
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-300"
                strokeDasharray={`${countdownPercent}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold font-mono text-emerald-400">
              {Math.ceil(countdownSec)}s
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              Kirim Telemetri Berikutnya
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Interval: <span className="text-slate-300 font-mono">{effectiveInterval}s</span>
              {' '}
              <span className="text-slate-600">
                {speedMultiplier === 1 ? '(waktu nyata 60s)' : `(${speedMultiplier}× dipercepat)`}
              </span>
            </div>
          </div>

          {/* Kirim Cepat toggle + Kirim Sekarang */}
          <div className="flex items-center gap-2 shrink-0">
            <label
              className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Percepat interval kirim mengikuti multiplier"
            >
              <input
                type="checkbox"
                checked={accelerateSendInterval}
                onChange={e => setAccelerateSendInterval(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
              />
              <span>Kirim Cepat</span>
            </label>

            <button
              onClick={() => sendReadingNow()}
              disabled={lastSendStatus === 'sending'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {lastSendStatus === 'sending' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Kirim Sekarang
            </button>
          </div>
        </div>

        {/* Row 3: Status bar pengiriman terakhir */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0 truncate">
            {lastSendStatus === 'sending' && (
              <span className="flex items-center gap-1.5 text-sky-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                Mengirim data ke tabel readings...
              </span>
            )}
            {lastSendStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400 truncate">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lastSendMessage}</span>
              </span>
            )}
            {lastSendStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-400 truncate">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lastSendMessage}</span>
              </span>
            )}
            {lastSendStatus === 'idle' && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {lastSendMessage}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 shrink-0">
            fw: <span className="text-slate-400">SIMULATOR</span> · node: <span className="text-slate-400">gh-01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
