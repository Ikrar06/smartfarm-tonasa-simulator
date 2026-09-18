import { create } from 'zustand';
import {
  DEFAULT_VOLUME_AIR_L,
  DEFAULT_SUHU_AIR_C,
  DEFAULT_TARGET_PPM,
  DEFAULT_SEND_INTERVAL_SEC,
} from '../engine/constants';
import {
  calculatePpm,
  calculateTdsRaw,
  calculateEvaporationPerSec,
  prepareReadingForTransmission,
  getInitialNutrientMass,
  getRandomRssi,
} from '../engine/simulationEngine';
import { sendReading, sendEvent } from '../lib/supabase';
import type { TransmissionLogItem } from '../engine/types';

interface GuidedDemoState {
  isActive: boolean;
  step: 'idle' | 'lowering' | 'critical_hold' | 'auto_recovering' | 'finished';
  message: string;
  stepSecondsRemaining: number;
}

interface SimulationStore {
  // State Fisika & Kimia
  volume_air: number;
  massa_nutrisi: number;
  massa_pending: number;
  suhu_air: number;
  ppm: number;
  tds_raw: number;
  rssi: number;

  // Kontrol Eksekusi Simulasi
  isRunning: boolean;
  speedMultiplier: number; // 1x sampai 10x
  isAutoMaintenanceEnabled: boolean;
  accelerateSendInterval: boolean; // Respons feedback user: percepat interval kirim jika speed dinaikkan
  baseSendIntervalSec: number;
  countdownSec: number;

  // Status Sinkronisasi Supabase
  lastSentPpm: number | null;
  lastSentTimestamp: string | null;
  lastSendStatus: 'idle' | 'sending' | 'success' | 'error';
  lastSendMessage: string;
  recentLogs: TransmissionLogItem[];
  hasEventInCurrentCycle: boolean;

  // Mode Demo Terpandu (Guided Demo)
  guidedDemo: GuidedDemoState;

  // Aksi Store
  tick: (dtSeconds: number) => void;
  addWater: (amountL: number) => Promise<void>;
  addNutrient: (amountG: number) => Promise<void>;
  setSuhuAir: (suhu: number) => void;
  resetSimulation: () => Promise<void>;
  toggleRunning: () => void;
  setSpeedMultiplier: (speed: number) => void;
  toggleAutoMaintenance: () => void;
  setAccelerateSendInterval: (accelerate: boolean) => void;
  setBaseSendInterval: (sec: number) => void;
  sendReadingNow: () => Promise<void>;
  startGuidedDemo: () => void;
  stopGuidedDemo: () => void;
}

const initialNutrient = getInitialNutrientMass(DEFAULT_TARGET_PPM, DEFAULT_VOLUME_AIR_L);
const initialPpm = calculatePpm(initialNutrient, DEFAULT_VOLUME_AIR_L);
const initialTds = calculateTdsRaw(initialPpm);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  volume_air: DEFAULT_VOLUME_AIR_L,
  massa_nutrisi: initialNutrient,
  massa_pending: 0,
  suhu_air: DEFAULT_SUHU_AIR_C,
  ppm: initialPpm,
  tds_raw: initialTds,
  rssi: -62,

  isRunning: true,
  speedMultiplier: 1,
  isAutoMaintenanceEnabled: false,
  accelerateSendInterval: true, // Default ON sesuai masukan user agar saat expo bisa kirim cepat
  baseSendIntervalSec: DEFAULT_SEND_INTERVAL_SEC,
  countdownSec: DEFAULT_SEND_INTERVAL_SEC,

  lastSentPpm: null,
  lastSentTimestamp: null,
  lastSendStatus: 'idle',
  lastSendMessage: 'Menunggu transmisi pertama...',
  recentLogs: [],
  hasEventInCurrentCycle: false,

  guidedDemo: {
    isActive: false,
    step: 'idle',
    message: '',
    stepSecondsRemaining: 0,
  },

  tick: (dtSeconds: number) => {
    const state = get();
    if (!state.isRunning) return;

    const {
      speedMultiplier,
      accelerateSendInterval,
      baseSendIntervalSec,
      guidedDemo,
      isAutoMaintenanceEnabled,
    } = state;
    const effectiveDt = dtSeconds * speedMultiplier;

    // 1. Pelarutan bertahap nutrisi pending ke larutan (dissolution)
    let newMassaNutrisi = state.massa_nutrisi;
    let newMassaPending = state.massa_pending;
    if (newMassaPending > 0) {
      // Larut ~25g per detik nyata untuk skala tangki 1000L
      const dissolveAmount = Math.min(newMassaPending, 25.0 * effectiveDt);
      newMassaPending -= dissolveAmount;
      newMassaNutrisi += dissolveAmount;
    }

    // 2. Penguapan air akibat suhu (evaporation)
    const evapPerSec = calculateEvaporationPerSec(state.suhu_air);
    const evapLoss = evapPerSec * effectiveDt;
    // Jaga agar volume minimal 100 Liter untuk tangki 1000L
    const newVolumeAir = Math.max(100, state.volume_air - evapLoss);

    // 3. Update PPM & TDS
    const newPpm = calculatePpm(newMassaNutrisi, newVolumeAir);
    const newTdsRaw = calculateTdsRaw(newPpm);

    // 4. Update Countdown pengiriman Supabase
    // Pada kecepatan 1x: interval 60 detik tepat.
    // Pada kecepatan Nx (1-10x): interval = 60 / N detik.
    const effectiveInterval = accelerateSendInterval
      ? Math.max(1, Math.round(baseSendIntervalSec / speedMultiplier))
      : baseSendIntervalSec;

    let newCountdown = state.countdownSec - dtSeconds;

    if (newCountdown <= 0) {
      newCountdown = effectiveInterval;
      // Kirim telemetri otomatis
      setTimeout(() => {
        get().sendReadingNow();
      }, 0);
    }

    // 5. Update Guided Demo jika aktif
    let updatedGuidedDemo = { ...guidedDemo };
    if (guidedDemo.isActive) {
      const remaining = guidedDemo.stepSecondsRemaining - effectiveDt;
      if (remaining <= 0) {
        // Transisi tahapan skenario demo terpandu
        if (guidedDemo.step === 'lowering') {
          // Masuk ke fase kritis < 400 ppm
          updatedGuidedDemo = {
            isActive: true,
            step: 'critical_hold',
            message: '⚠️ PPM di bawah ambang (<400)! Periksa kartu rekomendasi di Dashboard PWA.',
            stepSecondsRemaining: 25,
          };
          // Segera trigger kirim reading agar dashboard langsung terima nilai kritis
          setTimeout(() => get().sendReadingNow(), 100);
        } else if (guidedDemo.step === 'critical_hold') {
          // Masuk ke fase pemulihan otomatis
          updatedGuidedDemo = {
            isActive: true,
            step: 'auto_recovering',
            message: '🧪 Sistem memulihkan nutrisi: Menambahkan 200g AB mix otomatis...',
            stepSecondsRemaining: 20,
          };
          get().addNutrient(200);
        } else if (guidedDemo.step === 'auto_recovering') {
          // Selesai
          updatedGuidedDemo = {
            isActive: false,
            step: 'finished',
            message: '✅ Skenario Demo Selesai: Larutan kembali ke rentang optimal sehat.',
            stepSecondsRemaining: 0,
          };
          setTimeout(() => get().sendReadingNow(), 500);
        }
      } else {
        updatedGuidedDemo.stepSecondsRemaining = remaining;
      }
    }

    set({
      volume_air: Math.round(newVolumeAir * 100) / 100,
      massa_nutrisi: Math.round(newMassaNutrisi * 100) / 100,
      massa_pending: Math.round(newMassaPending * 100) / 100,
      ppm: Math.round(newPpm * 10) / 10,
      tds_raw: newTdsRaw,
      countdownSec: Math.max(0, Math.round(newCountdown * 10) / 10),
      guidedDemo: updatedGuidedDemo,
    });

    // Targetkan titik tengah rentang sehat (500 PPM) agar tindakan tidak berulang tiap tick.
    if (isAutoMaintenanceEnabled && !guidedDemo.isActive) {
      const targetPpm = DEFAULT_TARGET_PPM;
      const targetMass = (targetPpm * newVolumeAir) / 1000;

      if (newVolumeAir < 950) {
        get().addWater(Math.round((DEFAULT_VOLUME_AIR_L - newVolumeAir) * 10) / 10);
      } else if (newPpm < 400 && newMassaPending === 0) {
        const nutrientNeeded = Math.max(10, targetMass - newMassaNutrisi);
        get().addNutrient(Math.round(nutrientNeeded * 10) / 10);
      } else if (newPpm > 600) {
        const targetVolume = (newMassaNutrisi / targetPpm) * 1000;
        const waterNeeded = targetVolume - newVolumeAir;
        if (waterNeeded >= 5) {
          get().addWater(Math.round(waterNeeded * 10) / 10);
        }
      }
    }
  },

  addWater: async (amountL: number) => {
    const state = get();
    const newVolume = state.volume_air + amountL;
    const newPpm = calculatePpm(state.massa_nutrisi, newVolume);
    const newTdsRaw = calculateTdsRaw(newPpm);

    const logId = `event-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('id-ID');

    set({
      volume_air: Math.round(newVolume * 100) / 100,
      ppm: Math.round(newPpm * 10) / 10,
      tds_raw: newTdsRaw,
      hasEventInCurrentCycle: true,
    });

    const result = await sendEvent({
      jenis: 'tambah_air',
      catatan: `Simulasi: Tambah ${amountL}L air (Dilusi ke ${Math.round(newPpm)} PPM)`,
    });

    const newLogItem: TransmissionLogItem = {
      id: logId,
      timestamp,
      type: 'event',
      summary: `Tambah ${amountL}L Air -> PPM turun ke ${Math.round(newPpm)}`,
      eventKind: 'tambah_air',
      status: result.success ? 'success' : 'error',
      errorMessage: result.error,
    };

    set(s => ({
      recentLogs: [newLogItem, ...s.recentLogs].slice(0, 20),
    }));

    // Kirim reading langsung agar efek dilusi seketika tampil di dashboard
    setTimeout(() => {
      get().sendReadingNow();
    }, 100);
  },

  addNutrient: async (amountG: number) => {
    const logId = `event-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('id-ID');

    // Masuk ke massa_pending agar larut bertahap
    set(s => ({
      massa_pending: s.massa_pending + amountG,
      hasEventInCurrentCycle: true,
    }));

    const result = await sendEvent({
      jenis: 'isi_nutrisi',
      catatan: `Simulasi: Tambah ${amountG}g nutrisi AB mix`,
    });

    const newLogItem: TransmissionLogItem = {
      id: logId,
      timestamp,
      type: 'event',
      summary: `Isi ${amountG}g AB Mix (Larut bertahap)`,
      eventKind: 'isi_nutrisi',
      status: result.success ? 'success' : 'error',
      errorMessage: result.error,
    };

    set(s => ({
      recentLogs: [newLogItem, ...s.recentLogs].slice(0, 20),
    }));

    // Kirim reading langsung agar efek penambahan pupuk tercatat seketika
    setTimeout(() => {
      get().sendReadingNow();
    }, 100);
  },

  setSuhuAir: (suhu: number) => {
    set({ suhu_air: Math.round(suhu * 10) / 10 });
  },

  resetSimulation: async () => {
    const defaultNutrient = getInitialNutrientMass(DEFAULT_TARGET_PPM, DEFAULT_VOLUME_AIR_L);
    const defaultPpm = calculatePpm(defaultNutrient, DEFAULT_VOLUME_AIR_L);
    const defaultTds = calculateTdsRaw(defaultPpm);

    const logId = `event-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('id-ID');

    set({
      volume_air: DEFAULT_VOLUME_AIR_L,
      massa_nutrisi: defaultNutrient,
      massa_pending: 0,
      suhu_air: DEFAULT_SUHU_AIR_C,
      ppm: defaultPpm,
      tds_raw: defaultTds,
      hasEventInCurrentCycle: true,
      countdownSec: get().baseSendIntervalSec,
    });

    const result = await sendEvent({
      jenis: 'ganti_larutan',
      catatan: 'Simulasi: Reset tangki / ganti larutan baru (500 PPM sehat)',
    });

    const newLogItem: TransmissionLogItem = {
      id: logId,
      timestamp,
      type: 'event',
      summary: 'Reset Tangki: Ganti Larutan Baru (1000L, 500 PPM)',
      eventKind: 'ganti_larutan',
      status: result.success ? 'success' : 'error',
      errorMessage: result.error,
    };

    set(s => ({
      recentLogs: [newLogItem, ...s.recentLogs].slice(0, 20),
    }));

    // Kirim reading baseline baru langsung
    setTimeout(() => {
      get().sendReadingNow();
    }, 100);
  },

  toggleRunning: () => {
    set(s => ({ isRunning: !s.isRunning }));
  },

  setSpeedMultiplier: (speed: number) => {
    const clampedSpeed = Math.min(10, Math.max(1, speed));
    const effectiveInterval = get().accelerateSendInterval
      ? Math.max(1, Math.round(get().baseSendIntervalSec / clampedSpeed))
      : get().baseSendIntervalSec;
    set({
      speedMultiplier: clampedSpeed,
      countdownSec: Math.min(get().countdownSec, effectiveInterval),
    });
  },

  toggleAutoMaintenance: () => {
    set(s => ({ isAutoMaintenanceEnabled: !s.isAutoMaintenanceEnabled }));
  },

  setAccelerateSendInterval: (accelerate: boolean) => {
    set({ accelerateSendInterval: accelerate });
  },

  setBaseSendInterval: (sec: number) => {
    set({ baseSendIntervalSec: sec, countdownSec: sec });
  },

  sendReadingNow: async () => {
    const state = get();
    set({ lastSendStatus: 'sending' });

    // Terapkan guardrails (noise gaussian, cegah nilai identik berturut-turut, cegah lompatan >60 tanpa event)
    const noisyPpm = prepareReadingForTransmission(
      state.ppm,
      state.lastSentPpm,
      state.hasEventInCurrentCycle
    );
    const calculatedTds = calculateTdsRaw(noisyPpm);
    const randomRssi = getRandomRssi();
    const timestampStr = new Date().toLocaleTimeString('id-ID');

    const result = await sendReading({
      ppm: noisyPpm,
      tds_raw: calculatedTds,
      suhu: state.suhu_air,
      rssi: randomRssi,
    });

    const logItem: TransmissionLogItem = {
      id: `reading-${Date.now()}`,
      timestamp: timestampStr,
      type: 'reading',
      summary: `Readings: ${noisyPpm} PPM (TDS: ${calculatedTds}, Suhu: ${state.suhu_air}°C, RSSI: ${randomRssi})`,
      ppm: noisyPpm,
      tds_raw: calculatedTds,
      suhu: state.suhu_air,
      status: result.success ? 'success' : 'error',
      errorMessage: result.error,
    };

    const effectiveInterval = state.accelerateSendInterval
      ? Math.max(1, Math.round(state.baseSendIntervalSec / state.speedMultiplier))
      : state.baseSendIntervalSec;

    set(s => ({
      lastSentPpm: noisyPpm,
      lastSentTimestamp: timestampStr,
      rssi: randomRssi,
      countdownSec: effectiveInterval,
      lastSendStatus: result.success ? 'success' : 'error',
      lastSendMessage: result.success
        ? `Terkirim (${timestampStr}): ${noisyPpm} PPM | TDS ${calculatedTds}`
        : `Gagal (${timestampStr}): ${result.error}`,
      recentLogs: [logItem, ...s.recentLogs].slice(0, 20),
      hasEventInCurrentCycle: false, // Reset flag event setelah dikirim
    }));
  },

  startGuidedDemo: () => {
    // Jalankan skenario:
    // 1. Turunkan PPM di bawah 400 dengan menambahkan air banyak (dilusi drastis)
    const state = get();
    // Tambah air sampai PPM sekitar ~350 PPM
    const targetVolume = (state.massa_nutrisi / 350) * 1000;
    const waterNeeded = Math.max(15, targetVolume - state.volume_air);

    set({
      isAutoMaintenanceEnabled: false,
      guidedDemo: {
        isActive: true,
        step: 'lowering',
        message: `🌊 Mengencerkan larutan (menambahkan ${Math.round(waterNeeded)}L air) agar PPM turun < 400...`,
        stepSecondsRemaining: 15,
      },
    });

    // Tambah air
    get().addWater(Math.round(waterNeeded));
  },

  stopGuidedDemo: () => {
    set({
      guidedDemo: {
        isActive: false,
        step: 'idle',
        message: '',
        stepSecondsRemaining: 0,
      },
    });
  },
}));
