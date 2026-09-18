import {
  TDS_SLOPE,
  TDS_OFFSET,
  PPM_HARD_MIN,
  PPM_HARD_MAX,
  MAX_UNEXPLAINED_DELTA_PPM,
  NOISE_SIGMA,
  DEFAULT_VOLUME_AIR_L,
  DEFAULT_TARGET_PPM,
  RSSI_MIN,
  RSSI_MAX,
} from './constants';

/**
 * Konversi massa nutrisi (gram) dan volume air (liter) ke konsentrasi PPM.
 * 1 gram garam terlarut per 1 liter air setara 1000 mg/L = 1000 ppm.
 * Baseline: 25g nutrisi dalam 50L air = (25 / 50) * 1000 = 500 ppm.
 */
export const CONVERSION_FACTOR = 1000;

export function calculatePpm(massaNutrisiGram: number, volumeAirLiter: number): number {
  if (volumeAirLiter <= 0) return PPM_HARD_MAX;
  const rawPpm = (massaNutrisiGram / volumeAirLiter) * CONVERSION_FACTOR;
  return clampPpm(rawPpm);
}

/**
 * Konversi PPM ke nilai mentah ADC sensor TDS (tds_raw).
 * Formula wajib dari simulate.ts:
 * tds_raw = round((ppm - TDS_OFFSET) / TDS_SLOPE), clamp ke [0, 4095]
 */
export function calculateTdsRaw(ppm: number): number {
  const raw = Math.round((ppm - TDS_OFFSET) / TDS_SLOPE);
  return Math.min(4095, Math.max(0, raw));
}

/**
 * Hard clamp PPM agar tidak melebihi batasan sistem [300, 2000].
 */
export function clampPpm(ppm: number): number {
  return Math.min(PPM_HARD_MAX, Math.max(PPM_HARD_MIN, ppm));
}

/**
 * Generator nilai Gaussian acak (Box-Muller transform) untuk simulasi noise sensor nyata.
 */
export function generateGaussianNoise(mean: number = 0, sigma: number = NOISE_SIGMA): number {
  const u1 = Math.max(1e-6, Math.random());
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * sigma;
}

/**
 * Menghasilkan nilai RSSI Wi-Fi acak antara -55 dan -70 dBm (indikator kosmetik).
 */
export function getRandomRssi(): number {
  return Math.floor(Math.random() * (RSSI_MAX - RSSI_MIN + 1)) + RSSI_MIN;
}

/**
 * Menghitung laju penguapan air per detik (Liter/detik) berdasarkan suhu air.
 * Pada suhu normal (25-26°C), laju berkisar 0.002 L/detik.
 * Semakin panas suhu air (mis. 35°C), laju penguapan meningkat.
 */
export function calculateEvaporationPerSec(suhuAirC: number): number {
  const baseEvap = 0.04; // L/detik pada suhu dasar 25°C untuk tangki 1000L
  const tempExcess = Math.max(0, suhuAirC - 25);
  return baseEvap * (1 + tempExcess * 0.2);
}

/**
 * Menyiapkan nilai PPM yang siap dikirim ke Supabase dengan guardrails:
 * 1. Menambahkan noise gaussian (agar std != 0 untuk menghindari detektor "sensor_macet")
 * 2. Memastikan nilai tidak identik dengan kiriman sebelumnya (|diff| >= 0.5)
 * 3. Membatasi perubahan maksimal 60 poin jika tidak ada event (menghindari detektor "lonjakan_aneh")
 * 4. Hard clamp ke rentang [300, 2000]
 */
export function prepareReadingForTransmission(
  currentPpm: number,
  lastSentPpm: number | null,
  hasEventAttached: boolean
): number {
  // 1. Tambahkan noise gaussian
  let finalPpm = currentPpm + generateGaussianNoise(0, NOISE_SIGMA);

  // 2. Pastikan tidak identik dengan kiriman sebelumnya
  if (lastSentPpm !== null) {
    const diff = Math.abs(finalPpm - lastSentPpm);
    if (diff < 0.6) {
      const nudge = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.5);
      finalPpm = lastSentPpm + nudge;
    }

    // 3. Guard detektor "lonjakan_aneh": jika tanpa event, max delta <= 60
    if (!hasEventAttached) {
      const delta = finalPpm - lastSentPpm;
      if (Math.abs(delta) > MAX_UNEXPLAINED_DELTA_PPM) {
        finalPpm = lastSentPpm + Math.sign(delta) * MAX_UNEXPLAINED_DELTA_PPM;
      }
    }
  }

  // 4. Hard clamp [300, 2000] dan bulatkan ke 1 desimal
  finalPpm = clampPpm(finalPpm);
  return Math.round(finalPpm * 10) / 10;
}

/**
 * Massa nutrisi awal (gram) untuk menghasilkan PPM default (500 PPM) pada volume default (50 L).
 */
export function getInitialNutrientMass(
  targetPpm: number = DEFAULT_TARGET_PPM,
  volumeL: number = DEFAULT_VOLUME_AIR_L
): number {
  return (targetPpm * volumeL) / CONVERSION_FACTOR;
}
