/**
 * KONSTANTA UTAMA SIMULATOR SMART FARM HIDROPONIK
 * Disinkronkan dengan skema database Supabase dan konvensi PWA Dashboard.
 */

// Single Source of Truth untuk node_id — PWA Dashboard terkunci hardcode ke 'gh-01'
export const NODE_ID = 'gh-01';

// Tanda Wajib untuk Cleanup Pasca-Expo (kompatibel dengan clear-sim.ts di repo dashboard)
export const FW_IDENTIFIER = 'SIMULATOR';
export const EVENT_CREATOR = 'SIMULATOR';
export const EVENT_SOURCE = 'tombol';

// Kalibrasi TDS & Ambang Batas Live (Greenhouse Kangkung - Fase Vegetatif)
// Mudah disesuaikan jika nilai live di tabel settings/phases berubah sebelum hari-H
export const TDS_SLOPE = 0.414615;
export const TDS_OFFSET = -116.7063;
export const PPM_TARGET_MIN = 400;
export const PPM_TARGET_MAX = 600;

// Batasan Guardrails (Mereplikasi guard simulate.ts agar tidak memicu false alert AI worker)
export const PPM_HARD_MIN = 300;
export const PPM_HARD_MAX = 2000;
export const MAX_UNEXPLAINED_DELTA_PPM = 60; // Max selisih tanpa event pendamping
export const NOISE_SIGMA = 1.8;              // Variasi gaussian agar std != 0

// Nilai Default Sistem
export const DEFAULT_VOLUME_AIR_L = 1000.0;   // Liter (Tangki tandon skala real greenhouse)
export const TANK_CAPACITY_L = DEFAULT_VOLUME_AIR_L;
export const DEFAULT_SUHU_AIR_C = 26.0;        // °C
export const DEFAULT_TARGET_PPM = 500.0;       // PPM titik tengah sehat (400-600)
export const DEFAULT_SEND_INTERVAL_SEC = 60;   // 60 detik pada kecepatan 1x (skala real-time)

// RSSI acak untuk kosmetik WiFi (-55 s.d. -70 dBm)
export const RSSI_MIN = -70;
export const RSSI_MAX = -55;
