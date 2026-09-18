# 🌿 Smart Farm Hidroponik — Standalone IoT Simulator (gh-01)

Web simulator interaktif berbasis **Vite + React + TypeScript + Tailwind CSS + Framer Motion** untuk mendemonstrasikan sistem IoT Smart Farm Hidroponik satu tangki dan bak nutrisi pada **EXPO KKN**.

Simulator ini mensimulasikan dinamika fisik dan kimia nutrisi hidroponik, lalu mentransmisikan data telemetri secara berkala langsung ke Supabase yang sama persis dengan yang dikonsumsi oleh aplikasi PWA Monitoring Dashboard.

---

## 🚀 Fitur Utama

- **Tangki & Bak Nutrisi Interaktif (SVG + Framer Motion)**:
  - Animasi ketinggian air realistis berdasarkan volume tangki skala real greenhouse (**1000L baseline**, visual hingga 1200L).
  - Gradasi warna larutan dinamis sesuai konsentrasi PPM:
    - 🔵 **Biru Muda / Cyan**: Kurang nutrisi / encer ($< 400$ PPM)
    - 🟢 **Hijau Emerald**: Nutrisi optimal vegetatif ($400 - 600$ PPM)
    - 🟠 **Kuning Amber**: Nutrisi tinggi / pekat ($600 - 800$ PPM)
    - 🔴 **Merah Crimson**: Sangat pekat / kritis ($> 800$ PPM)
  - Animasi partikel kristal nutrisi larut bertahap saat AB mix dituangkan.
  - Probe sensor TDS hardware gantung dengan lampu indikator status.

- **Kontrol Tindakan Petani (Intervensi Tandon 1000L)**:
  - **Tambah Air Bersih**: (+20L, +50L, +100L, atau kustom) $\to$ volume air naik $\to$ PPM turun (dilusi) $\to$ mencatat event `'tambah_air'`.
  - **Tambah Pupuk AB Mix**: (+25g, +50g, +100g, atau kustom) $\to$ garam nutrisi larut bertahap ke dalam 1000L $\to$ PPM naik bertahap $\to$ mencatat event `'isi_nutrisi'`.
  - **Slider Suhu Air (20°C – 38°C)**: Mengatur suhu larutan $\to$ suhu tinggi meningkatkan laju penguapan alami air $\to$ larutan perlahan semakin pekat.
  - **Kuras / Ganti Larutan (Reset)**: Mengembalikan kondisi tangki ke baseline sehat (1000L, 500g nutrisi, 500 PPM, 26°C) $\to$ mencatat event `'ganti_larutan'`.

- **Mesin Telemetri & Guardrails AI Worker**:
  - `node_id` tunggal terpusat: `'gh-01'`.
  - Formula konversi hardware TDS Raw:
    $$\text{tds\_raw} = \text{clamp}\left(\text{round}\left(\frac{\text{ppm} - \text{TDS\_OFFSET}}{\text{TDS\_SLOPE}}\right), 0, 4095\right)$$
  - **Perturbasi Gaussian ($\sigma \approx 1.8$)**: Memastikan nilai PPM tidak identik berturut-turut untuk mencegah detektor `sensor_macet`.
  - **Guard Lonjakan Aneh**: Membatasi perubahan $\Delta \le 60$ PPM per interval pengiriman jika tidak ada event intervensi pendamping.
  - **Hard Clamp**: Nilai PPM selalu dijaga dalam rentang aman $[300, 2000]$.

- **Pengaturan Waktu & Transmisi Supabase**:
  - Pengatur kecepatan simulasi: **1x sampai 10x** (tombol cepat 1x, 2x, 5x, 10x dan slider kontinu 1-10x).
  - **Interval Transmisi Cepat**: Interval default 5 detik (atau 1 detik pada mode cepat) sehingga setiap perubahan langsung tercatat di dashboard.
  - **Transmisi Instan**: Setiap aksi pengguna (tambah air, tambah nutrisi, kuras) langsung mentransmisikan data seketika tanpa delay.
  - Tombol **Kirim Sekarang**: Memaksa transmisi reading seketika untuk keperluan demonstrasi langsung ke audiens/juri.
  - Log transmisi real-time dengan status sukses/gagal.

- **Mode Demo Terpandu (Guided Demo)**:
  - Skenario otomatis yang mengencerkan larutan hingga PPM $< 400$, memicu kartu rekomendasi darurat di dashboard PWA secara live, lalu otomatis memulihkannya dengan dosis AB mix yang sesuai.

---

## 🛠️ Instalasi & Menjalankan Lokal

### 1. Prasyarat
- **Node.js**: v18+ (direkomendasikan v20+)
- **NPM**: v9+

### 2. Kloning & Masuk ke Folder Proyek
```bash
cd Simulation_Greenhouse
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` di root proyek (atau salin dari `.env.example`):

```env
# Supabase Project Credentials (Anon Client)
VITE_SUPABASE_URL=https://wmujckyljsgcsnonouxp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdWpja3lsanNnY3Nub25vdXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NDEzOTcsImV4cCI6MjA5OTUxNzM5N30.VNskeKfQI1LVIylrySX5ZizrMnfy5x-9czIuSHHhaNs

# Web Push — VAPID Public Key
VITE_VAPID_PUBLIC_KEY=BNaQ2aJnDFhBlnCVK_Y9ziM7w3GzRN89k3U1skomLaZbWSZULUnqNwzFAjxu9J-9y_1ZOvXE8qu7DDa3AeS8HIU
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui browser di `http://localhost:5173/`.

### 6. Build Produksi (Deploy ke Vercel / Netlify)
```bash
npm run build
```
Hasil build berada di folder `dist/` dan siap dideploy langsung sebagai static site di Vercel atau Netlify.

---

## 📋 Checklist & Panduan Hari-H Expo KKN

Pastikan Anda membaca dan mengikuti checklist ini sebelum membuka stan demo:

### 1. Periksa Nilai Kalibrasi Live (Tabel `settings` & `phases`)
Buka Supabase Table Editor atau menu Pengaturan di PWA Dashboard untuk memastikan konstanta kalibrasi belum diubah. Jika berbeda, sesuaikan di `src/engine/constants.ts`:
```typescript
export const TDS_SLOPE = 0.414615;
export const TDS_OFFSET = -116.7063;
export const PPM_TARGET_MIN = 400;
export const PPM_TARGET_MAX = 600;
```

### 2. Nyalakan Simulator 15–20 Menit SEBELUM Sesi Expo Dimulai
> **PENTING**: Worker cron AI di dashboard memeriksa status kesehatan dan data historis setiap 15 menit. Dengan menyalakan simulator 15–20 menit sebelum juri atau pengunjung tiba, simulator akan mengisi baris `readings` baru dengan status optimal sehat (500 PPM), sehingga dashboard PWA akan bertransisi dari status lama ("kritis" atau "alat offline") menjadi status **"Aman / Aktif"**.

### 3. Demonstrasi ke Pengunjung / Juri
1. Tampilkan layar laptop simulator berdampingan dengan layar monitor/HP yang membuka PWA Dashboard.
2. Jelaskan tangki nutrisi dan pembacaan sensor probe TDS (1487 raw = 500 PPM).
3. Tekan **Mode Demo Terpandu** atau tekan tombol **+100 Liter Air**:
   - Tunjukkan bagaimana PPM turun (air tangki berubah menjadi biru muda/encer jika $<400$ PPM).
   - Tunjukkan layar PWA Dashboard: sistem mendeteksi dilusi dan worker AI memunculkan kartu rekomendasi: *"Nutrisi Rendah — Tambah AB Mix"*.
4. Tekan tombol **+50 Gram AB Mix**:
   - Tunjukkan animasi garam nutrisi yang melarut bertahap ke dalam tandon 1000L.
   - Nilai PPM naik kembali ke ~500 PPM (warna tangki kembali hijau subur).
   - Dashboard PWA otomatis kembali ke status optimal.

### 4. Pembersihan Data Pasca-Expo (Cleanup)
Data yang dikirim oleh simulator memiliki tanda unik:
- **Tabel `readings`**: `fw = 'SIMULATOR'`
- **Tabel `events`**: `dibuat_oleh = 'SIMULATOR'`

Setelah acara expo selesai, jalankan script `clear-sim.ts` bawaan dari repo dashboard:
```bash
# Di dalam repo dashboard:
npx ts-node scripts/clear-sim.ts
```
Script tersebut akan menghapus seluruh data yang berlabel `SIMULATOR` tanpa mengubah atau menghapus 10.360 baris data sensor asli KKN Anda.

---

## 📁 Struktur Proyek

```
Simulation_Greenhouse/
├── src/
│   ├── components/
│   │   ├── TankVisual.tsx         # Visualisasi tangki SVG & animasi Framer Motion
│   │   ├── ControlPanel.tsx       # Intervensi: tambah air, AB mix, suhu, kuras
│   │   ├── StatsPanel.tsx         # Telemetri lokal real-time & target gauge
│   │   ├── SimControls.tsx        # Start/Pause, multiplier speed, sync interval
│   │   ├── TransmissionLog.tsx    # Log riwayat transmisi Supabase
│   │   └── GuidedDemoModal.tsx    # Modal panduan interaktif Demo Terpandu
│   ├── engine/
│   │   ├── constants.ts           # NODE_ID ('gh-01'), rumus kalibrasi, batas target
│   │   ├── types.ts               # Interface TypeScript payload reading & event
│   │   └── simulationEngine.ts    # Model fisika & kimia hidroponik terisolasi
│   ├── store/
│   │   └── useSimulationStore.ts   # Zustand state management
│   ├── lib/
│   │   └── supabase.ts            # Supabase client anon + fungsi sendReading & sendEvent
│   ├── App.tsx                    # Layout utama dashboard & loop simulasi
│   ├── main.tsx                   # Entry point React
│   └── index.css                  # Tailwind CSS & Glassmorphism styles
├── .env.example
├── .env.local                     # Kredensial Supabase (gitignored)
├── tailwind.config.js
├── vite.config.ts
└── README.md
```
