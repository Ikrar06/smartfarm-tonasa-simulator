import { NODE_ID } from './constants';

export type EventKind = 'isi_nutrisi' | 'tambah_air' | 'ganti_larutan';

export interface ReadingPayload {
  node_id: typeof NODE_ID;
  tds_raw: number;
  ppm: number;
  suhu: number;
  rssi: number;
  fw: string;
  ts?: string;
}

export interface EventPayload {
  node_id: typeof NODE_ID;
  jenis: EventKind;
  catatan: string;
  sumber: string;
  dibuat_oleh: string;
  rekomendasi_id: null;
  ts?: string;
}

export interface TransmissionLogItem {
  id: string;
  timestamp: string;
  type: 'reading' | 'event';
  summary: string;
  ppm?: number;
  tds_raw?: number;
  suhu?: number;
  eventKind?: EventKind;
  status: 'success' | 'error' | 'mocked';
  errorMessage?: string;
}

export interface GuidedDemoProgress {
  isActive: boolean;
  stage: 'idle' | 'draining' | 'critical_low' | 'auto_recovering' | 'stabilized';
  progressPercent: number;
  statusText: string;
}
