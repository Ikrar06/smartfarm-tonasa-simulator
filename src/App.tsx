import React, { useEffect, useState } from 'react';
import { useSimulationStore } from './store/useSimulationStore';
import { TankVisual } from './components/TankVisual';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { SimControls } from './components/SimControls';
import { TransmissionLog } from './components/TransmissionLog';
import { GuidedDemoModal } from './components/GuidedDemoModal';
import {
  NODE_ID,
  FW_IDENTIFIER,
  PPM_TARGET_MIN,
  PPM_TARGET_MAX,
  TDS_SLOPE,
  TDS_OFFSET,
} from './engine/constants';
import { isSupabaseConfigured } from './lib/supabase';
import {
  Sprout,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const App: React.FC = () => {
  const { tick } = useSimulationStore();
  const [showChecklist, setShowChecklist] = useState<boolean>(false);
  const [sessionUptimeSec, setSessionUptimeSec] = useState<number>(0);

  // Loop Fisika Simulasi (berjalan setiap 200ms dengan dt = 0.2 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      tick(0.2);
    }, 200);

    return () => clearInterval(interval);
  }, [tick]);

  // Session Uptime Timer
  useEffect(() => {
    const uptimeTimer = setInterval(() => {
      setSessionUptimeSec(prev => prev + 1);
    }, 1000);

    return () => clearInterval(uptimeTimer);
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      {/* Background Ambient Glow FX */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Kontainer Lebar Penuh (Max 1440px untuk tampilan Expo) */}
      <div className="w-full max-w-7xl flex flex-col gap-5 z-10">
        {/* Navigation Bar / Top Header */}
        <header className="w-full rounded-2xl glass-panel border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            {/* Logo + Judul */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 shrink-0">
                <Sprout className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Smart Farm Hidroponik
                  <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-600/30 align-middle">
                    SIMULATOR
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Greenhouse Kangkung · Expo KKN · Demo Telemetry Engine
                </p>
              </div>
            </div>

            {/* Kanan header: badges + tombol */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Session Uptime */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatUptime(sessionUptimeSec)}</span>
              </div>

              {/* Supabase Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950/70 border-emerald-700/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-700/40 text-amber-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span>{isSupabaseConfigured ? 'Supabase Live' : 'Mock Mode'}</span>
              </div>

              {/* Checklist button */}
              <button
                onClick={() => setShowChecklist(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Panduan Expo</span>
                <span className="sm:hidden">?</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Grid 2 Kolom */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Sisi Kiri: Tangki & Sensor (5 col) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <TankVisual />
            <StatsPanel />
          </div>

          {/* Sisi Kanan: Kontrol + Log (7 col) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <SimControls />
            <ControlPanel />
            <TransmissionLog />
          </div>
        </main>

        {/* Footer Info */}
        <footer className="w-full py-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 px-2 font-mono">
          <div>
            Target Node: <strong className="text-slate-400">{NODE_ID}</strong> • FW Mark:{' '}
            <strong className="text-slate-400">{FW_IDENTIFIER}</strong>
          </div>
          <div>
            Kalibrasi: Slope = {TDS_SLOPE}, Offset = {TDS_OFFSET} • Target: {PPM_TARGET_MIN}-
            {PPM_TARGET_MAX} PPM
          </div>
          <div>Expo KKN Smart Agriculture • Standalone Simulator</div>
        </footer>
      </div>

      {/* Floating Guided Demo Notification Modal */}
      <GuidedDemoModal />

      {/* Modal Dialog: Panduan & Checklist Hari-H Expo */}
      {showChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel-glow bg-slate-950/95 border border-emerald-500/30 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Checklist & Panduan Hari-H Expo KKN
                  </h2>
                  <p className="text-xs text-slate-400">
                    Prosedur operasional simulator agar demo ke juri & pengunjung lancar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChecklist(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Isi Panduan */}
            <div className="mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* Point 1: 15-20 Menit Sebelum Sesi */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  1. Nyalakan Simulator 15–20 Menit SEBELUM Sesi Dimulai
                </h4>
                <p>
                  Worker cron AI di dashboard memeriksa data historis readings setiap 15 menit.
                  Dengan menyalakan simulator lebih awal, data baru dengan PPM optimal (400–600)
                  akan masuk, sehingga status lama (“kritis” atau “alat mati”) berganti menjadi
                  status “Aman / Aktif” saat expo dibuka.
                </p>
              </div>

              {/* Point 2: Cek Ulang Kalibrasi Live */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  2. Cek Nilai Kalibrasi Live di Database
                </h4>
                <p>
                  Konstanta kalibrasi saat ini diatur ke:
                </p>
                <div className="mt-2 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] grid grid-cols-2 gap-1 text-slate-300">
                  <div>TDS_SLOPE: {TDS_SLOPE}</div>
                  <div>TDS_OFFSET: {TDS_OFFSET}</div>
                  <div>PPM_TARGET_MIN: {PPM_TARGET_MIN}</div>
                  <div>PPM_TARGET_MAX: {PPM_TARGET_MAX}</div>
                </div>
                <p className="mt-2 text-slate-400">
                  Jika Anda pernah mengubah nilai ini di menu Pengaturan PWA atau SQL Editor,
                  pastikan nilai di <code className="text-emerald-400">src/engine/constants.ts</code> disamakan.
                </p>
              </div>

              {/* Point 3: Mode Demo Terpandu */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  3. Menggunakan "Mode Demo Terpandu"
                </h4>
                <p>
                  Saat ada pengunjung atau juri yang menonton di stan:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-400">
                  <li>Tekan tombol <strong>"Mode Demo Terpandu"</strong> di panel kontrol.</li>
                  <li>Simulator otomatis menambahkan air berlebih $\to$ PPM turun di bawah 400.</li>
                  <li>Tunjukkan layar PWA Dashboard: kartu rekomendasi penambahan AB Mix akan otomatis muncul.</li>
                  <li>Simulator otomatis memulihkan nutrisi kembali ke 500 PPM (warna hijau).</li>
                </ul>
              </div>

              {/* Point 4: Prosedur Cleanup Pasca-Expo */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <h4 className="font-bold text-rose-300 flex items-center gap-1.5 text-sm mb-1">
                  <RefreshCw className="w-4 h-4 text-rose-400" />
                  4. Pembersihan Data Pasca-Expo
                </h4>
                <p>
                  Semua data simulasi telah diberi label khusus:
                  <br />
                  - Tabel <code className="text-rose-400">readings.fw = 'SIMULATOR'</code>
                  <br />
                  - Tabel <code className="text-rose-400">events.dibuat_oleh = 'SIMULATOR'</code>
                </p>
                <p className="mt-1.5 text-slate-400">
                  Setelah acara expo selesai, Anda tinggal menjalankan script <code className="text-slate-200">clear-sim.ts</code> bawaan dari repo dashboard untuk membersihkan seluruh data simulasi tanpa menyentuh data historis asli KKN.
                </p>
              </div>
            </div>

            {/* Tombol Tutup */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowChecklist(false)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                Saya Mengerti, Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
