import React, { useEffect, useState } from "react";
import { getFiles } from "../services/api";
import { Line } from "react-chartjs-2";
import { Activity, FlaskConical } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Benchmark = () => {
  const [files, setFiles] = useState([]);
  const [logScale, setLogScale] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFiles();
        setFiles(res.data || []);
      } catch {}
    };
    load();
  }, []);

  const getTotal = (f) => f?.metrics?.total_ms ?? f?.metrics?.total ?? null;

  const labels = files.map((f) =>
    f.filename.length > 15 ? f.filename.slice(0, 15) + "..." : f.filename
  );

  const totals = files.map(getTotal).filter((v) => v != null);

  const min = totals.length ? Math.min(...totals) : 0;
  const max = totals.length ? Math.max(...totals) : 0;
  const mean = totals.length
    ? totals.reduce((a, b) => a + b, 0) / totals.length
    : 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Latency",
        data: files.map(getTotal),
        borderColor: "#00ff9d",
        backgroundColor: "#00ff9d",
        tension: 0.35
      },
      {
        label: "Max",
        data: new Array(labels.length).fill(max),
        borderColor: "#ff4d4f",
        borderDash: [6, 6],
        pointRadius: 0
      },
      {
        label: "Min",
        data: new Array(labels.length).fill(min),
        borderColor: "#4ade80",
        borderDash: [6, 6],
        pointRadius: 0
      }
    ]
  };

  const perfClass = (file) => {
    const e = file?.metrics?.efficiency;
    if (!e?.ms_per_mb) return "Unknown";

    if (e.ms_per_mb < 5) return "⚡ Ultra Fast";
    if (e.ms_per_mb < 20) return "Fast";
    if (e.ms_per_mb < 100) return "Moderate";
    return "Heavy";
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FlaskConical size={20}/> Benchmark Lab
          </h2>
          <p className="text-gray-500 text-xs font-mono uppercase">
            Statistical Crypto Evaluation
          </p>
        </div>

        <button
          onClick={() => setLogScale(!logScale)}
          className="px-3 py-1 border border-gray-700 rounded text-xs hover:bg-white/10"
        >
          {logScale ? "Linear Scale" : "Log Scale"}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 text-xs font-mono">
        <Card label="Mean" value={`${mean.toFixed(2)} ms`} />
        <Card label="Min" value={`${min.toFixed(2)} ms`} />
        <Card label="Max" value={`${max.toFixed(2)} ms`} />
      </div>

      {/* CHART */}
      <div className="bg-scifi-panel border border-scifi-border p-6 rounded-xl">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={16}/> Latency Distribution
        </h3>

        <div className="h-80">
          <Line
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#fff" } } },
              scales: {
                y: {
                  type: logScale ? "logarithmic" : "linear",
                  grid: { color: "#222" }
                },
                x: { grid: { display: false } }
              }
            }}
          />
        </div>
      </div>

      {/* RANKING */}
      <div className="space-y-2">
        {files
          .slice()
          .sort((a, b) => (getTotal(a) ?? 0) - (getTotal(b) ?? 0))
          .map((f) => (
            <div key={f.id} className="p-3 bg-black/40 border border-gray-800 rounded flex justify-between text-xs">
              <span>{f.filename}</span>
              <div className="flex gap-4">
                <span>{getTotal(f)?.toFixed(2)} ms</span>
                <span className="text-yellow-400">{perfClass(f)}</span>
              </div>
            </div>
          ))}
      </div>

      {/* ================= METHODOLOGY ================= */}
      <div className="mt-10 bg-black/40 border border-scifi-border p-6 rounded-xl">
        <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
          Benchmark Methodology
        </h3>

        <div className="space-y-3 text-xs text-gray-400 leading-relaxed">

          <p>
            Latency values represent end-to-end cryptographic execution time measured 
            using high-resolution monotonic timers. Measurements begin at key 
            agreement initiation and end after payload packaging is completed.
          </p>

          <p>
            <span className="text-neon-green font-bold">ms / MB</span> is computed as:
            total cryptographic time divided by plaintext size in megabytes.
            This normalizes results across files of different sizes.
          </p>

          <p>
            Crypto time includes KEM operations, shared-secret derivation, HKDF,
            AES-GCM encryption, and authentication tag generation.
            External storage latency and network transport are excluded.
          </p>

          <p>
            Throughput and efficiency metrics assume CPU-bound execution on the 
            local gateway without hardware acceleration.
          </p>

          <p>
            Hybrid PQC and RSA baselines are executed under identical runtime 
            conditions to ensure fair comparative analysis.
          </p>

          <p>
            Results should be interpreted as relative performance indicators 
            rather than absolute hardware benchmarks.
          </p>

        </div>
      </div>

    </div>
  );
};

const Card = ({ label, value }) => (
  <div className="bg-black/40 border border-gray-800 p-4 rounded flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-bold">{value}</span>
  </div>
);

export default Benchmark;
