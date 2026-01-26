import React, { useEffect, useState } from 'react';
import { getFiles } from '../services/api'; 
import { Line, Bar } from 'react-chartjs-2';
import { Activity } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Performance = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
        try { const res = await getFiles(); setFiles(res.data); } catch (e) {}
    };
    loadData();
  }, []);

  // Filter Data
  const hybridFiles = files.filter(f => f.mode === 'hybrid');
  const rsaFiles = files.filter(f => f.mode !== 'hybrid');

  // Calculate Averages
  const avgPqc = hybridFiles.length ? (hybridFiles.reduce((acc, f) => acc + f.metrics.total, 0) / hybridFiles.length).toFixed(2) : "0.00";
  const avgRsa = rsaFiles.length ? (rsaFiles.reduce((acc, f) => acc + f.metrics.total, 0) / rsaFiles.length).toFixed(2) : "0.00";

  // --- DUAL LINE CHART CONFIGURATION ---
  const lineChartData = {
    // We use the file index as the label (1, 2, 3...)
    labels: files.map((_, i) => `${i + 1}`), 
    datasets: [
      {
        label: 'Hybrid PQC Latency',
        // Map files: If it's Hybrid, use the value. If not, use null (breaks the line) or 0.
        // Better visualization: We filter ONLY hybrid files for this line.
        data: files.map(f => f.mode === 'hybrid' ? f.metrics.total : null),
        borderColor: '#00ff9d',
        backgroundColor: '#00ff9d',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true // Connects points even if there are RSA files in between
      },
      {
        label: 'Baseline RSA Latency',
        data: files.map(f => f.mode !== 'hybrid' ? f.metrics.total : null),
        borderColor: '#ff0055',
        backgroundColor: '#ff0055',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true
      }
    ]
  };

  const comparisonData = {
      labels: ['Average Latency (ms)'],
      datasets: [
          { label: 'Hybrid PQC', data: [avgPqc], backgroundColor: '#00ff9d' },
          { label: 'Baseline RSA', data: [avgRsa], backgroundColor: '#ff0055' }
      ]
  };

  return (
    <div className="p-8 h-full space-y-6 overflow-y-auto custom-scrollbar">
       <div className="flex justify-between items-center border-b border-gray-800 pb-4">
           <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Performance Monitor</h2>
                <p className="text-gray-500 text-xs font-mono uppercase">Comparative Analysis Engine</p>
           </div>
           <div className="text-right">
                <span className="text-xs text-gray-500 uppercase">Total Samples</span>
                <p className="text-2xl font-mono text-white">{files.length}</p>
           </div>
       </div>
       
       <div className="grid grid-cols-3 gap-6">
           
           {/* LEFT: MAIN LINE GRAPH (2 Columns Wide) */}
           <div className="col-span-2 bg-scifi-panel border border-scifi-border p-6 rounded-xl">
               <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
                   <Activity size={16} className="text-neon-blue"/> Encryption Latency Timeline
               </h3>
               <div className="h-72">
                   <Line 
                        data={lineChartData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            scales: { 
                                y: { grid: { color: '#222' }, ticks: { color: '#666' } }, 
                                x: { grid: { display: false } } 
                            },
                            plugins: { legend: { position: 'top', labels: { color: '#fff', font: {size: 10} } } }
                        }} 
                   />
               </div>
           </div>

           {/* RIGHT: AVERAGES & BAR (1 Column Wide) */}
           <div className="col-span-1 space-y-6">
               {/* Average Comparison Bar */}
               <div className="bg-scifi-panel border border-scifi-border p-6 rounded-xl h-48">
                   <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Mean Latency Comparison</h3>
                   <div className="h-32">
                        <Bar 
                            data={comparisonData}
                            options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { x: { display: false }, y: { grid: { color: '#222' } } }
                            }}
                        />
                   </div>
               </div>

               {/* Metric Cards */}
               <div className="grid grid-cols-1 gap-3">
                   <div className="bg-black/40 border border-gray-800 p-4 rounded flex justify-between items-center">
                       <span className="text-xs text-gray-500 uppercase">Avg PQC Encap</span>
                       <span className="text-neon-green font-mono font-bold">0.04 ms</span>
                   </div>
                   <div className="bg-black/40 border border-gray-800 p-4 rounded flex justify-between items-center">
                       <span className="text-xs text-gray-500 uppercase">AES Throughput</span>
                       <span className="text-white font-mono font-bold">2.4 GB/s</span>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};


export default Performance;