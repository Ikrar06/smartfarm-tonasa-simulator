import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { Sparkles, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';

export const GuidedDemoModal: React.FC = () => {
  const { guidedDemo, stopGuidedDemo, ppm } = useSimulationStore();

  if (!guidedDemo.isActive && guidedDemo.step !== 'finished') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl glass-panel-glow border-2 border-emerald-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Mode Demo Terpandu Expo
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Otomatis
              </span>
            </h3>
            <p className="text-xs text-slate-400">Skenario demo untuk pengunjung stan KKN</p>
          </div>
        </div>

        <button
          onClick={stopGuidedDemo}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Tutup Demo Terpandu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pesan & Instruksi Presenter */}
      <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
          {guidedDemo.step === 'critical_hold' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : guidedDemo.step === 'finished' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ArrowRight className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span>{guidedDemo.message}</span>
        </div>

        {/* Petunjuk khusus saat kondisi kritis */}
        {guidedDemo.step === 'critical_hold' && (
          <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
            👉 <strong>Panduan Presenter:</strong> Ajak pengunjung melihat layar PWA Dashboard. Kartu rekomendasi darurat / alert PPM rendah akan muncul dalam hitungan detik!
          </div>
        )}

        {/* Waktu fase tersisa */}
        {guidedDemo.stepSecondsRemaining > 0 && (
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>PPM Saat Ini: <strong className="text-slate-200">{ppm.toFixed(0)} PPM</strong></span>
            <span>Fase beralih dalam: {Math.ceil(guidedDemo.stepSecondsRemaining)}s</span>
          </div>
        )}
      </div>
    </div>
  );
};
