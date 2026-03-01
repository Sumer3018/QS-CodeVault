import React, { useEffect, useState } from 'react';
import { getFiles } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const Performance = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
  let mounted = true;

  const load = async () => {
    try {
      const res = await getFiles();
      if (mounted) setFiles(res.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    }
  };

  load();

  return () => {
    mounted = false;
  };
}, []);


  const getTotal = (f) => f?.metrics?.total_ms ?? f?.metrics?.total ?? 0;

  // ================= SAME X AXIS =================
  const labels = files.map(f =>
    f.filename.length > 15 ? f.filename.slice(0, 15) + "..." : f.filename
  );

  const pqcData = files.map(f => f.mode === 'hybrid' ? getTotal(f) : null);
  const rsaData = files.map(f => f.mode !== 'hybrid' ? getTotal(f) : null);

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Hybrid PQC',
        data: pqcData,
        borderColor: '#00ff9d',
        backgroundColor: '#00ff9d',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true
      },
      {
        label: 'RSA Baseline',
        data: rsaData,
        borderColor: '#a855f7',
        backgroundColor: '#a855f7',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true
      }
    ]
  };

  const hybrid = files.filter(f => f.mode === 'hybrid');
  const rsa = files.filter(f => f.mode !== 'hybrid');

  const avgPqc = hybrid.length
    ? (hybrid.reduce((a, f) => a + getTotal(f), 0) / hybrid.length).toFixed(2)
    : "0.00";

  const avgRsa = rsa.length
    ? (rsa.reduce((a, f) => a + getTotal(f), 0) / rsa.length).toFixed(2)
    : "0.00";

  return (
    <div className="p-8 flex-1 min-h-0 space-y-6 overflow-y-auto custom-scrollbar">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Monitor</h2>
          <p className="text-gray-500 text-xs font-mono uppercase">
            Comparative Analysis Engine
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase">Total Files</span>
          <p className="text-2xl font-mono text-white">{files.length}</p>
        </div>
      </div>

      {/* GRAPH */}
      <div className="bg-scifi-panel border border-scifi-border p-6 rounded-xl">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={16} /> Encryption Latency Timeline
        </h3>

        <div className="h-80">
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    title: (items) => files[items[0].dataIndex]?.filename
                  }
                },
                legend: { labels: { color: '#fff' } }
              },
              scales: {
      x: {
        title: {
          display: true,
          text: 'Encrypted Files',
          color: '#aaa',
          font: { size: 12 }
        },
        ticks: {
          color: '#888',
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Encryption Latency (ms)',
          color: '#aaa',
          font: { size: 12 }
        },
        ticks: {
          color: '#888'
        },
        grid: {
          color: '#222'
        }
      }
    }
            }}
          />
        </div>
      </div>

      {/* AVERAGES */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-3 text-[10px] text-gray-600 mt-2">
  CRYPTO PHASES
</div>

        <Card title="Average PQC" value={`${avgPqc} ms`} color="text-neon-green"/>
        <div className="col-span-3 text-[10px] text-gray-600 mt-2">
  CRYPTO PHASES
</div>

        <Card title="Average RSA" value={`${avgRsa} ms`} color="text-purple-400"/>
      </div>

      {/* ================= FULL PER FILE METRICS ================= */}
            <div className="space-y-3">
        {files.map(file => {
          const m = file.metrics || {};
          const p1 = m.phase_1 || {};
          const p2 = m.phase_2 || {};
          const p3 = m.phase_3 || {};
          const p4 = m.phase_4 || {};
          const p5 = m.phase_5 || {};

          const d = m.derived || {};
          const e = m.efficiency || {};
          const x = m.expansion || {};
          const s = m.structural || {};

          return (
            <div key={file.id} className="bg-black/40 border border-gray-800 p-4 rounded">
              <div className="flex justify-between mb-3">
                <span className="text-white font-bold">{file.filename}</span>
                <span className={file.mode === 'hybrid' ? 'text-neon-green' : 'text-purple-400'}>
                  {file.mode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">

                {/* ===== ORIGINAL ===== */}
                <Metric label="Size" value={`${p1.size_bytes ?? "N/A"} B`} />
                <Metric
                  label="Buffer"
                  value={
                    p1.read_ms == null
                      ? "N/A"
                      : p1.read_ms < 0.01
                      ? "<0.01 ms"
                      : `${p1.read_ms.toFixed(2)} ms`
                  }
                />

                <Metric label="Encap" value={p2.encap_us != null ? `${p2.encap_us.toFixed(0)} us` : "N/A"} />
                <Metric label="HKDF" value={p3.hkdf_us != null ? `${p3.hkdf_us.toFixed(0)} us` : "N/A"} />
                <Metric label="AES" value={p4.aes_enc_ms != null ? `${p4.aes_enc_ms.toFixed(2)} ms` : "N/A"} />
                <Metric label="Pack" value={p5.pack_us != null ? `${p5.pack_us.toFixed(0)} us` : "N/A"} />

                {/* ===== DERIVED ===== */}
                <Metric label="Crypto Time" value={d.crypto_time_ms != null ? `${d.crypto_time_ms.toFixed(2)} ms` : "N/A"} />
                <Metric label="IO Time" value={d.io_time_ms != null ? `${d.io_time_ms.toFixed(2)} ms` : "N/A"} />
                <Metric label="Overhead" value={d.overhead_ms != null ? `${d.overhead_ms.toFixed(2)} ms` : "N/A"} />
                <Metric label="Crypto %" value={d.crypto_percent != null ? `${d.crypto_percent.toFixed(1)}%` : "N/A"} />
                <Metric label="IO %" value={d.io_percent != null ? `${d.io_percent.toFixed(1)}%` : "N/A"} />

                {/* ===== EFFICIENCY ===== */}
                <Metric label="MB/s" value={e.mb_per_sec != null ? e.mb_per_sec.toFixed(2) : "N/A"} />
                <Metric label="ms/MB" value={e.ms_per_mb != null ? e.ms_per_mb.toFixed(2) : "N/A"} />
                <Metric label="ns/byte" value={e.time_per_byte_ns != null ? e.time_per_byte_ns.toFixed(0) : "N/A"} />

                {/* ===== EXPANSION ===== */}
                <Metric label="Cipher Size" value={x.ciphertext_bytes != null ? `${x.ciphertext_bytes} B` : "N/A"} />
                <Metric label="Expansion" value={x.expansion_ratio != null ? x.expansion_ratio.toFixed(2) : "N/A"} />

                {/* ===== STRUCTURE ===== */}
                <Metric label="Key Size" value={s.aes_key_size != null ? `${s.aes_key_size} B` : "N/A"} />
                <Metric label="Nonce" value={s.aes_nonce != null ? `${s.aes_nonce} B` : "N/A"} />
                <Metric label="Tag" value={s.aes_tag != null ? `${s.aes_tag} B` : "N/A"} />
                <Metric label="KEM CT" value={s.kem_ciphertext != null ? `${s.kem_ciphertext} B` : "N/A"} />

                {/* ===== TOTAL ===== */}
                <Metric label="Total" value={`${getTotal(file)} ms`} highlight />
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-black/40 border border-gray-800 p-4 rounded flex justify-between">
    <span className="text-gray-400">{title}</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

const Metric = ({ label, value, highlight }) => {
  let color = "text-gray-400";

  if (highlight) color = "text-white";

  if (label.includes("%")) color = "text-yellow-400";
  else if (label.includes("Crypto")) color = "text-cyan-400";
  else if (label.includes("IO")) color = "text-blue-400";
  else if (label.includes("MB/s") || label.includes("ms/MB")) color = "text-green-400";
  else if (label.includes("Key") || label.includes("Nonce") || label.includes("Tag")) color = "text-purple-400";
  else if (label.includes("Cipher") || label.includes("Expansion")) color = "text-pink-400";

  return (
    <div className={`p-2 rounded border border-gray-800 ${color}`}>
      {label}: <span className="ml-1">{value}</span>
    </div>
  );
};


export default Performance;
