import React, { useState } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  History,
  CheckCircle,
  XCircle,
  Radio,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';

export const TransmissionLog: React.FC = () => {
  const recentLogs = useSimulationStore(state => state.recentLogs);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="w-full rounded-2xl glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Log Transmisi Supabase
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {recentLogs.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Riwayat pengiriman readings &amp; events</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          title={isExpanded ? 'Sembunyikan' : 'Tampilkan'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
                <History className="w-6 h-6 text-slate-700 animate-pulse" />
                <span>Belum ada data yang ditransmisikan.</span>
                <span className="text-[11px] text-slate-600">
                  Data otomatis dikirim tiap siklus atau saat tombol ditekan.
                </span>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/50 font-mono text-xs">
                {recentLogs.map(log => (
                  <div
                    key={log.id}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Status icon */}
                    <div className="shrink-0">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : log.status === 'mocked' ? (
                        <Radio className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[11px] text-slate-500 shrink-0 w-16">{log.timestamp}</span>

                    {/* Type badge */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      log.type === 'reading'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-600/30'
                        : 'bg-indigo-500/10 text-indigo-300 border border-indigo-600/30'
                    }`}>
                      {log.type === 'reading' ? 'READ' : 'EVT'}
                    </span>

                    {/* Summary */}
                    <span className="text-slate-300 text-[11px] truncate flex-1" title={log.summary}>
                      {log.summary}
                    </span>

                    {/* Error badge */}
                    {log.errorMessage && (
                      <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-700/30 shrink-0">
                        ERR
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
