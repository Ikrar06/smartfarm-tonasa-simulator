import React, { useState } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  Droplets,
  PlusCircle,
  Thermometer,
  RotateCcw,
  Sparkles,
  Layers,
  Flame,
  Info,
} from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    volume_air,
    suhu_air,
    addWater,
    addNutrient,
    setSuhuAir,
    resetSimulation,
    guidedDemo,
    startGuidedDemo,
    stopGuidedDemo,
  } = useSimulationStore();

  const [customWater, setCustomWater] = useState<number>(50);
  const [customNutrient, setCustomNutrient] = useState<number>(50);
  const [isResetConfirm, setIsResetConfirm] = useState<boolean>(false);

  const handleReset = async () => {
    await resetSimulation();
    setIsResetConfirm(false);
  };

  return (
    <div className="w-full rounded-2xl glass-panel overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Kontrol Intervensi Petani</h2>
            <p className="text-xs text-slate-500 mt-0.5">Simulasikan tindakan perawatan tandon 1000L</p>
          </div>
        </div>

        <button
          onClick={() => { guidedDemo.isActive ? stopGuidedDemo() : startGuidedDemo(); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all shrink-0 ${
            guidedDemo.isActive
              ? 'bg-rose-500/15 border-rose-600/40 text-rose-300 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-600/30 text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title="Skenario otomatis: encerkan PPM → trigger rekomendasi PWA → pulih"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {guidedDemo.isActive ? 'Hentikan Demo' : 'Mode Demo Terpandu'}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-4">
        {/* Grid: Tambah Air | Tambah Nutrisi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tambah Air */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" /> Tambah Air Bersih
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {volume_air.toFixed(1)} L sekarang
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Menaikkan volume dan menurunkan konsentrasi PPM (dilusi).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[20, 50, 100].map(liters => (
                <button
                  key={liters}
                  onClick={() => addWater(liters)}
                  className="py-2 text-xs font-semibold rounded-lg bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 border border-sky-600/30 text-sky-300 transition-all flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  {liters}L
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="number"
                min="5"
                max="500"
                step="5"
                value={customWater}
                onChange={e => setCustomWater(parseFloat(e.target.value) || 10)}
                className="w-20 px-2 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-center focus:border-sky-500 focus:outline-none"
              />
              <button
                onClick={() => addWater(customWater)}
                className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-sky-300 border border-slate-700 transition-all"
              >
                + {customWater}L (Kustom)
              </button>
            </div>
          </div>

          {/* Tambah Nutrisi */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Tambah AB Mix
                </span>
                <span className="text-[11px] font-mono text-slate-500">Formula Garam</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Larut bertahap ke 1000L (~50g ≈ +50 PPM secara halus).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[25, 50, 100].map(grams => (
                <button
                  key={grams}
                  onClick={() => addNutrient(grams)}
                  className="py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-600/30 text-emerald-300 transition-all flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  {grams}g
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="number"
                min="5"
                max="500"
                step="5"
                value={customNutrient}
                onChange={e => setCustomNutrient(parseFloat(e.target.value) || 10)}
                className="w-20 px-2 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-center focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => addNutrient(customNutrient)}
                className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-300 border border-slate-700 transition-all"
              >
                + {customNutrient}g (Kustom)
              </button>
            </div>
          </div>
        </div>

        {/* Row: Slider Suhu + Reset */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Slider suhu */}
          <div className="md:col-span-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Suhu Air &amp; Penguapan
              </span>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-600/30 text-amber-300 text-xs font-mono font-bold">
                <Flame className="w-3 h-3" />
                {suhu_air.toFixed(1)} °C
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">20°C</span>
              <input
                type="range"
                min="20"
                max="38"
                step="0.5"
                value={suhu_air}
                onChange={e => setSuhuAir(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">38°C</span>
            </div>

            <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
              <Info className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
              Suhu tinggi mempercepat penguapan air — kepekatan PPM perlahan naik.
            </p>
          </div>

          {/* Reset larutan */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset Larutan
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Kembalikan ke baseline: 1000L · 500 PPM · 26°C.
              </p>
            </div>

            {!isResetConfirm ? (
              <button
                onClick={() => setIsResetConfirm(true)}
                className="w-full py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ganti Larutan Baru
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-600/40 transition-all"
                >
                  Ya, Ganti!
                </button>
                <button
                  onClick={() => setIsResetConfirm(false)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
