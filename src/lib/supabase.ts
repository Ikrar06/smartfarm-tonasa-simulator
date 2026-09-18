import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NODE_ID, FW_IDENTIFIER, EVENT_CREATOR, EVENT_SOURCE } from '../engine/constants';
import type { EventKind, ReadingPayload, EventPayload } from '../engine/types';

// Ambil kredensial dari environment variable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Inisialisasi Supabase Client tunggal dengan Anon Key
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export interface SendResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

/**
 * Mengirim telemetry reading ke tabel `readings`.
 * WAJIB:
 * - node_id: NODE_ID ('gh-01')
 * - fw: FW_IDENTIFIER ('SIMULATOR')
 * - ppm, tds_raw, suhu, rssi
 */
export async function sendReading(payload: {
  ppm: number;
  tds_raw: number;
  suhu: number;
  rssi: number;
}): Promise<SendResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: true,
      message: 'Mode Mock: Supabase belum dikonfigurasi, payload diuji secara lokal.',
    };
  }

  const row: ReadingPayload = {
    node_id: NODE_ID,
    tds_raw: payload.tds_raw,
    ppm: payload.ppm,
    suhu: payload.suhu,
    rssi: payload.rssi,
    fw: FW_IDENTIFIER,
    ts: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('readings').insert([row]).select();

    if (error) {
      console.error('[Supabase sendReading Error]', error);
      return {
        success: false,
        error: error.message || 'Gagal mengirim readings ke Supabase',
      };
    }

    return {
      success: true,
      message: `Terkirim ke readings: ${row.ppm} PPM, TDS raw ${row.tds_raw}`,
      data,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Supabase Network/Unexpected Error]', err);
    return {
      success: false,
      error: errMsg,
    };
  }
}

/**
 * Mengirim event intervensi ke tabel `events`.
 * WAJIB:
 * - node_id: NODE_ID ('gh-01')
 * - jenis: 'isi_nutrisi' | 'tambah_air' | 'ganti_larutan'
 * - sumber: 'tombol'
 * - dibuat_oleh: 'SIMULATOR'
 * - rekomendasi_id: null
 */
export async function sendEvent(payload: {
  jenis: EventKind;
  catatan: string;
}): Promise<SendResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: true,
      message: `Mode Mock: Event '${payload.jenis}' dicatat secara lokal.`,
    };
  }

  const row: EventPayload = {
    node_id: NODE_ID,
    jenis: payload.jenis,
    catatan: payload.catatan,
    sumber: EVENT_SOURCE,
    dibuat_oleh: EVENT_CREATOR,
    rekomendasi_id: null,
    ts: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('events').insert([row]).select();

    if (error) {
      console.error('[Supabase sendEvent Error]', error);
      return {
        success: false,
        error: error.message || `Gagal mencatat event ${payload.jenis} ke Supabase`,
      };
    }

    return {
      success: true,
      message: `Event '${payload.jenis}' berhasil dicatat di Supabase`,
      data,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Supabase Event Unexpected Error]', err);
    return {
      success: false,
      error: errMsg,
    };
  }
}
