import React, { useState, useEffect } from 'react';
import { uploadFile, getFiles, downloadFile, deleteFile } from '../services/api';
import CryptoFlow from '../components/CryptoFlow';
import { Upload, Download, FileText, AlertTriangle, Server, HardDrive, Terminal, Trash2, Activity, Play, X, RefreshCw } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadStep, setUploadStep] = useState(0); 
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [successMode, setSuccessMode] = useState(false);
  const [storageMode, setStorageMode] = useState('local');
  const [cryptoMode, setCryptoMode] = useState('hybrid'); 

  useEffect(() => { fetchFiles(); }, []);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const fetchFiles = async () => {
    try { const res = await getFiles(); setFiles(res.data); } catch (err) {}
  };

  const resetUpload = () => {
      setFileToUpload(null);
      setSuccessMode(false);
      setUploadStep(0);
      setError(null);
  };

  const onFileDrop = (e) => {
      const file = e.target.files[0];
      if (file) {
          setFileToUpload(file);
          setError(null);
          setSuccessMode(false);
          addLog(`STAGE: ${file.name} loaded.`);
      }
  };

  const startEncryption = async () => {
    if (!fileToUpload) return;
    setUploadStep(1);
    setLogs([]); 
    addLog(`INIT: Protocol for ${fileToUpload.name}`);
    addLog(`MODE: ${cryptoMode.toUpperCase()}`);

    // Animation
    if (cryptoMode === 'hybrid') {
        setTimeout(() => { setUploadStep(2); addLog("PQC: Generating Kyber-512 Keys..."); }, 800);
        setTimeout(() => { setUploadStep(3); addLog("PQC: Encapsulating Secret..."); }, 2000);
    } else {
        setTimeout(() => { addLog("RSA: Generating Baseline Keys..."); }, 800);
    }
    
    setTimeout(() => { setUploadStep(4); addLog("KDF: Deriving Session Key..."); }, 3000);

    try {
      const res = await uploadFile(fileToUpload, cryptoMode); 
      
      setTimeout(() => {
        setUploadStep(5);
        addLog("AES: Encrypting Payload...");
        addLog("NET: Uploading Blob...");
      }, 4000);
      
      setTimeout(() => {
        setUploadStep(0);
        setSuccessMode(true);
        addLog(`SUCCESS: Sealed ID: ${res.data.file_id}`);
        fetchFiles();
      }, 5500);

    } catch (err) {
      setUploadStep(0);
      addLog("ERROR: Protocol Failed.");
      setError("Upload Failed. Check backend logs.");
    }
  };

  const handleDownload = async (file) => {
    if (file.mode !== 'hybrid') {
        setError("BASELINE: RSA files are benchmark only.");
        return;
    }
    try {
      addLog(`REQ: Download ${file.filename}`);
      await downloadFile(file.id, file.filename);
      addLog("SUCCESS: Decrypted.");
    } catch (err) {
      addLog("❌ FAILURE: Integrity Check Failed.");
      setError("CRITICAL: Ciphertext Tag Mismatch.");
    }
  };

  const confirmDelete = async () => {
      if (!showDeleteModal) return;
      await deleteFile(showDeleteModal);
      fetchFiles();
      setShowDeleteModal(null);
      setSelectedFile(null);
  };

  return (
    <div className="p-8 space-y-6 relative h-full flex flex-col">
      {/* CENTRAL MODAL RESTORED */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-scifi-panel border border-neon-blue w-[600px] p-8 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] relative">
                <button onClick={() => setSelectedFile(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Activity className="text-neon-blue" /> File Security Report</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="text-gray-500">File:</span> <span className="text-white font-mono">{selectedFile.filename}</span></div>
                    <div><span className="text-gray-500">Mode:</span> <span className="text-neon-green font-bold uppercase">{selectedFile.mode}</span></div>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 mb-6 h-48">
                     <Bar data={{
                            labels: ['PQC/Key', 'AES', 'Total'],
                            datasets: [{
                                label: 'Time (ms)',
                                data: [selectedFile.metrics.pqc, selectedFile.metrics.aes, selectedFile.metrics.total],
                                backgroundColor: ['#00ff9d', '#00f3ff', '#ffffff'],
                            }]
                        }} 
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={() => { setShowDeleteModal(selectedFile.id); setSelectedFile(null); }} className="px-4 py-2 border border-red-500 text-red-500 rounded">Delete</button>
                    {selectedFile.mode === 'hybrid' && (
                        <button onClick={() => { handleDownload(selectedFile); setSelectedFile(null); }} className="px-4 py-2 bg-neon-blue text-black font-bold rounded">Decrypt & Download</button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div><h2 className="text-2xl font-bold text-white">QS-VAULT</h2><p className="text-gray-400 text-xs font-mono">Post-Quantum Gateway</p></div>
        <div className="flex gap-4">
            <select value={cryptoMode} onChange={(e) => setCryptoMode(e.target.value)} className="bg-black border border-gray-700 text-xs text-neon-blue p-2 rounded">
                <option value="hybrid">Hybrid (PQC + AES)</option>
                <option value="rsa">RSA-2048 (Baseline)</option>
            </select>
            <button className="flex items-center gap-2 border border-gray-700 text-xs p-2 rounded text-gray-300"><HardDrive size={14} /> Local FS</button>
        </div>
      </div>

      {error && <div className="bg-red-900/20 border border-red-500 p-3 rounded text-red-400 text-sm">{error}</div>}

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-scifi-panel border border-scifi-border rounded-xl p-6 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                {uploadStep > 0 ? (
                    <div className="text-center">
                        <h3 className="text-neon-green font-bold mb-8 animate-pulse">ENCRYPTION RUNNING...</h3>
                        <CryptoFlow currentStep={uploadStep} mode={cryptoMode} />
                    </div>
                ) : successMode ? (
                    <div className="text-center">
                        <Activity className="mx-auto text-neon-green mb-4" size={48} />
                        <h4 className="text-white font-bold text-xl mb-2">File Sealed</h4>
                        <button onClick={resetUpload} className="mt-6 px-6 py-2 bg-white text-black font-bold rounded flex items-center gap-2 mx-auto hover:bg-neon-green transition">
                            <RefreshCw size={16} /> Encrypt Another
                        </button>
                    </div>
                ) : !fileToUpload ? (
                     <label className="border-2 border-dashed border-gray-700 rounded-lg h-full flex flex-col items-center justify-center cursor-pointer hover:border-neon-green/50 hover:bg-white/5 transition-all">
                        <input type="file" onChange={onFileDrop} className="hidden" />
                        <Upload className="text-gray-500 mb-4" size={40} />
                        <p className="text-white font-bold text-lg">Drop files to Stage</p>
                    </label>
                ) : (
                    <div className="text-center">
                        <FileText className="mx-auto text-neon-green mb-4" size={48} />
                        <p className="text-xl font-bold text-white mb-2">{fileToUpload.name}</p>
                        <div className="flex justify-center gap-4 mt-8">
                            <button onClick={resetUpload} className="px-6 py-2 border border-gray-600 text-gray-400 rounded hover:text-white">Cancel</button>
                            <button onClick={startEncryption} className="px-6 py-2 bg-neon-green text-black font-bold rounded hover:bg-white transition flex items-center gap-2">
                                <Play size={16} fill="black" /> Engage Protocol
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-4 flex-1 overflow-hidden flex flex-col">
                <div className="text-gray-500 text-xs border-b border-gray-800 pb-2 mb-2 flex items-center gap-2"><Terminal size={12} /> CRYPTO_KERNEL_LOGS</div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {logs.map((log, i) => <p key={i} className="text-neon-green/80 mb-1 font-mono text-xs">{log}</p>)}
                </div>
            </div>
        </div>
        <div className="col-span-1 bg-scifi-panel border border-scifi-border rounded-xl p-4 flex flex-col">
             <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Server size={16} className="text-neon-blue"/> Vault Contents</h3>
             <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2">
                {files.map(file => (
                    <div key={file.id} onClick={() => setSelectedFile(file)} className="p-3 rounded border border-transparent bg-white/5 hover:border-neon-blue cursor-pointer transition group">
                        <div className="flex justify-between items-start">
                            <p className="text-xs text-white font-bold truncate w-32">{file.filename}</p>
                            <span className={`text-[9px] px-1 rounded font-bold uppercase ${file.mode === 'hybrid' ? 'text-neon-green bg-neon-green/10' : 'text-neon-purple bg-neon-purple/10'}`}>{file.mode === 'hybrid' ? 'PQC' : 'RSA'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{new Date(file.date).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;