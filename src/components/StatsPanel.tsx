import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  PPM_TARGET_MIN,
  PPM_TARGET_MAX,
  NODE_ID,
  TDS_SLOPE,
  TDS_OFFSET,
} from '../engine/constants';
import {
  Activity,
  Gauge,
  Wifi,
  Cpu,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { ppm, tds_raw, suhu_air, rssi, volume_air, massa_nutrisi } = useSimulationStore();

  const minDisplay = 300;
  const maxDisplay = 1000;
  const clampedDisplayPpm = Math.min(maxDisplay, Math.max(minDisplay, ppm));
  const gaugePercent = ((clampedDisplayPpm - minDisplay) / (maxDisplay - minDisplay)) * 100;

  let statusColor = 'text-emerald-400';
  let statusBorder = 'border-emerald-600/40';
  let statusBg = 'bg-emerald-950/60';
  let statusText = 'Optimal (400–600 PPM)';
  let StatusIcon = CheckCircle2;

  if (ppm < PPM_TARGET_MIN) {
    statusColor = 'text-sky-400';
    statusBorder = 'border-sky-600/40';
    statusBg = 'bg-sky-950/60';
    statusText = 'Kurang Nutrisi';
    StatusIcon = AlertTriangle;
  } else if (ppm > PPM_TARGET_MAX && ppm <= 800) {
    statusColor = 'text-amber-400';
    statusBorder = 'border-amber-600/40';
    statusBg = 'bg-amber-950/60';
    statusText = 'Nutrisi Berlebih';
    StatusIcon = AlertTriangle;
  } else if (ppm > 800) {
    statusColor = 'text-rose-400';
    statusBorder = 'border-rose-600/40';
    statusBg = 'bg-rose-950/60';
    statusText = 'Kritis – Toksisitas';
    StatusIcon = AlertOctagon;
  }

  const barColor =
    ppm < PPM_TARGET_MIN ? '#38bdf8'
    : ppm <= PPM_TARGET_MAX ? '#10b981'
    : ppm <= 800 ? '#f59e0b'
    : '#f43f5e';

  return (
    <div className="w-full rounded-2xl glass-panel overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Telemetri Sensor Lokal</h2>
              <p className="text-xs text-slate-500 mt-0.5">Greenhouse Kangkung · Fase Vegetatif</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {NODE_ID}
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${statusBg} ${statusBorder} ${statusColor}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusText}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-4">
        {/* PPM Card */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                Konsentrasi Terlarut
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-4xl font-extrabold font-mono tracking-tight ${statusColor}`}>
                  {ppm.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">PPM</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-slate-500">Target Vegetatif</p>
              <div className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/30 text-xs font-mono font-bold text-emerald-400">
                {PPM_TARGET_MIN} – {PPM_TARGET_MAX} PPM
              </div>
            </div>
          </div>

          {/* Gauge bar */}
          <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            {/* zona hijau */}
            <div
              className="absolute inset-y-0 bg-emerald-500/20 border-x border-emerald-500/40"
              style={{ left: '14.3%', width: '28.5%' }}
            />
            {/* fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{ width: `${gaugePercent}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1.5">
            <span>300</span>
            <span className="text-emerald-500">▲ {PPM_TARGET_MIN}–{PPM_TARGET_MAX} optimal</span>
            <span>1000+</span>
          </div>
        </div>

        {/* 3 kolom sensor hardware */}
        <div className="grid grid-cols-3 gap-3">
          {/* TDS Raw */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" /> TDS Raw
              </span>
              <span className="text-[10px] font-mono">12-bit</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-100 leading-none">
                {tds_raw}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">/ 4095</div>
              <div className="text-[10px] text-slate-600 font-mono truncate">
                m={TDS_SLOPE} c={TDS_OFFSET}
              </div>
            </div>
          </div>

          {/* Suhu */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400" /> Suhu
              </span>
              <span className="text-[10px] font-mono">DS18B20</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-100 leading-none">
                {suhu_air.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-0.5">°C</span>
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1">Ideal 24–28 °C</div>
            </div>
          </div>

          {/* RSSI */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" /> Wi-Fi
              </span>
              <span className="text-[10px] font-mono">RSSI</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-100 leading-none">
                {rssi}
                <span className="text-xs font-normal text-slate-400 ml-0.5">dBm</span>
              </div>
              <div className="text-[10px] text-emerald-500 font-mono mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Sinyal Kuat
              </div>
            </div>
          </div>
        </div>

        {/* Komposisi kimia footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Massa: <strong className="text-slate-300">{massa_nutrisi.toFixed(0)}g</strong></span>
          </div>
          <span className="text-slate-700">→</span>
          <span>Volume: <strong className="text-slate-300">{volume_air.toFixed(0)}L</strong></span>
          <span className="text-slate-700">→</span>
          <span className="text-emerald-400 font-bold">
            {((massa_nutrisi / volume_air) * 1000).toFixed(0)} mg/L
          </span>
        </div>
      </div>
    </div>
  );
};
