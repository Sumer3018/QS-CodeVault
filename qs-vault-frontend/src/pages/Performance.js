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
    const load = async () => {
      try {
        const res = await getFiles();
        setFiles(res.data || []);
      } catch {}
    };
    load();
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
    <div className="p-8 h-full space-y-6 overflow-y-auto custom-scrollbar">

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
                y: { grid: { color: '#222' } },
                x: { grid: { display: false } }
              }
            }}
          />
        </div>
      </div>

      {/* AVERAGES */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Average PQC" value={`${avgPqc} ms`} color="text-neon-green"/>
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

          return (
            <div key={file.id} className="bg-black/40 border border-gray-800 p-4 rounded">
              <div className="flex justify-between mb-3">
                <span className="text-white font-bold">{file.filename}</span>
                <span className={file.mode === 'hybrid' ? 'text-neon-green' : 'text-purple-400'}>
                  {file.mode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <Metric label="Size" value={`${p1.size_bytes || 0} B`} />
                <Metric label="Read" value={`${p1.read_ms || 0} ms`} />
                <Metric label="Encap" value={`${p2.encap_us || 0} us`} />
                <Metric label="HKDF" value={`${p3.hkdf_us || 0} us`} />
                <Metric label="AES" value={`${p4.aes_enc_ms || 0} ms`} />
                <Metric label="Pack" value={`${p5.pack_us || 0} us`} />
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

const Metric = ({ label, value, highlight }) => (
  <div className={`p-2 rounded border border-gray-800 ${highlight ? 'text-white' : 'text-gray-400'}`}>
    {label}: <span className="ml-1">{value}</span>
  </div>
);

export default Performance;
