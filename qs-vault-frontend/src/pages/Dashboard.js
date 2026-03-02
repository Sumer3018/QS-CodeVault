import React, { useState, useEffect } from 'react';
import { uploadFile, getFiles, downloadEncryptedFile, downloadDecryptedFile, deleteFile } from '../services/api';
import CryptoFlow from '../components/CryptoFlow';
import SciFiAlert from '../components/SciFiAlert';
import { Upload, Server, HardDrive, Terminal, Activity, Play, X, RefreshCw, FileCheck, FileText } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {

  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadStep, setUploadStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMode, setSuccessMode] = useState(false);
  const [customAlert, setCustomAlert] = useState(null);
  const [cryptoMode, setCryptoMode] = useState('hybrid');
  const [variant, setVariant] = useState("ML-KEM-768");
  const [activeTab, setActiveTab] = useState("overview");

  // ================= THEME =================
  const isHybrid = cryptoMode === "hybrid";
  const primaryColor = isHybrid ? "text-neon-green" : "text-purple-400";
  const borderColor = isHybrid ? "border-neon-green" : "border-purple-400";
  const buttonColor = isHybrid ? "bg-neon-green text-black" : "bg-purple-500 text-white";

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    try {
      const res = await getFiles();
      setFiles(res.data || []);
    } catch {}
  };

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const resetUpload = () => {
    setFileToUpload(null);
    setSuccessMode(false);
    setUploadStep(0);
  };

  const onFileDrop = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFileToUpload(f);
      setSuccessMode(false);
      addLog(`STAGE: ${f.name} loaded.`);
    }
  };

  const startEncryption = async () => {
    if (!fileToUpload) return;

    setUploadStep(1);
    setLogs([]);
    addLog(`INIT: Protocol for ${fileToUpload.name}`);

    if (cryptoMode === 'hybrid') {
      setTimeout(() => { setUploadStep(2); addLog("PQC: Generating Keys..."); }, 800);
      setTimeout(() => { setUploadStep(3); addLog("PQC: Encapsulating..."); }, 2000);
    } else {
      setTimeout(() => { addLog("RSA: Generating Keys..."); }, 800);
    }

    setTimeout(() => { setUploadStep(4); addLog("KDF: Deriving Key..."); }, 3000);

    try {
      const res = await uploadFile(fileToUpload, cryptoMode, variant);
      setTimeout(() => { setUploadStep(5); addLog("AES: Encrypting..."); }, 4000);
      setTimeout(() => {
        setSuccessMode(true);
        addLog(`SUCCESS: Sealed ID: ${res.data.file_id}`);
        fetchFiles();
      }, 5500);
    } catch {
      setUploadStep(0);
      setCustomAlert({ type: 'error', title: 'Upload Failed', message: 'Server error.' });
    }
  };

  const handleEncryptedDownload = async (file) => {
    try {
      await downloadEncryptedFile(file.id, file.filename);
    } catch {
      setCustomAlert({ type: 'error', title: 'Error', message: 'Download failed.' });
    }
  };

  const handleDecryptedDownload = async (file) => {
    if (file.mode !== 'hybrid') {
      setCustomAlert({ type: 'error', title: 'Denied', message: 'RSA benchmark only.' });
      return;
    }
    try {
      await downloadDecryptedFile(file.id, file.filename);
    } catch {
      setCustomAlert({ type: 'error', title: 'Integrity Breach', message: 'Signature mismatch.' });
    }
  };

  return (
    <div className="p-8 space-y-6 relative h-full flex flex-col">
      {customAlert && <SciFiAlert {...customAlert} onClose={() => setCustomAlert(null)} />}

      {/* ================= MODAL ================= */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-scifi-panel border border-neon-blue w-[650px] p-8 rounded-2xl relative">
            <button onClick={() => setSelectedFile(null)} className="absolute top-4 right-4"><X /></button>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Activity className="text-neon-blue" /> File Security Report
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 text-xs">
              <Tab id="overview" active={activeTab} set={setActiveTab}/>
              <Tab id="deep" active={activeTab} set={setActiveTab}/>
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (() => {
              const m = selectedFile?.metrics || {};
              const p2 = m.phase_2 || {};
              const p4 = m.phase_4 || {};

              return (
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 h-56">
                  <Bar
                    data={{
                      labels: ['KEM', 'AES', 'Total'],
                      datasets: [{
                        label: 'Latency (ms)',
                        data: [
                          (p2.encap_us || 0) / 1000,
                          p4.aes_enc_ms || 0,
                          m.total_ms || m.total || 0
                        ],
                        backgroundColor: ['#00ff9d', '#00f3ff', '#ffffff'],
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                  />
                </div>
              );
            })()}

            {/* DEEP */}
            {activeTab === "deep" && (() => {
              const m = selectedFile?.metrics || {};
              const p1 = m.phase_1 || {};
              const p2 = m.phase_2 || {};
              const p3 = m.phase_3 || {};
              const p4 = m.phase_4 || {};
              const p5 = m.phase_5 || {};

              return (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <Metric label="File Size" value={(p1.size_bytes || 0) + " B"} />
                  <Metric
                    label="Read"
                    value={
                      p1.read_ms == null
                        ? "N/A"
                        : p1.read_ms < 0.01
                        ? "<0.01 ms"
                        : `${p1.read_ms.toFixed(2)} ms`
                    }
                  />

                  <Metric label="Encapsulation" value={(p2.encap_us || 0) + " us"} />
                  <Metric label="HKDF" value={(p3.hkdf_us || 0) + " us"} />
                  <Metric label="AES" value={(p4.aes_enc_ms || 0).toFixed(2) + " ms"} />
                  <Metric label="Throughput" value={(p4.throughput_mb_s || 0).toFixed(2) + " MB/s"} />
                  <Metric label="Pack" value={(p5.pack_us || 0) + " us"} />
                  <Metric label="Total" value={(m.total_ms || 0).toFixed(2) + " ms"} />
                </div>
              );
            })()}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={async () => {
                  await deleteFile(selectedFile.id);
                  setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500/10"
              >
                Delete
              </button>

              <button
                onClick={() => handleEncryptedDownload(selectedFile)}
                className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-white/10"
              >
                Download Encrypted
              </button>

              <button
                onClick={() => handleDecryptedDownload(selectedFile)}
                className={`px-4 py-2 font-bold rounded ${buttonColor}`}
              >
                Decrypt & Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-2xl font-bold ${primaryColor}`}>QS-VAULT</h2>
          <p className="text-gray-400 text-xs font-mono">Post-Quantum Gateway</p>
        </div>

        <div className="flex gap-4">

  {/* Crypto Mode */}
  <select
    value={cryptoMode}
    onChange={(e) => setCryptoMode(e.target.value)}
    className={`bg-black border ${borderColor} ${primaryColor} text-xs p-2 rounded`}
  >
    <option value="hybrid">Hybrid PQC</option>
    <option value="rsa">RSA-2048</option>
  </select>

  {/* Variant Selector (ONLY for Hybrid) */}
  {cryptoMode === "hybrid" && (
    <select
      value={variant}
      onChange={(e) => setVariant(e.target.value)}
      className="bg-black border border-neon-green text-neon-green text-xs p-2 rounded"
    >
      <option value="ML-KEM-512">ML-KEM-512</option>
      <option value="ML-KEM-768">ML-KEM-768</option>
      <option value="ML-KEM-1024">ML-KEM-1024</option>
    </select>
  )}

  <div className="flex items-center gap-2 border border-neon-green/30 bg-neon-green/5 text-xs p-2 rounded text-neon-green">
    <HardDrive size={14}/>
    <span className="font-bold">MinIO Cloud Storage</span>
  </div>

</div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">

        {/* LEFT */}
        <div className="col-span-2 flex flex-col gap-6">

          <div className="bg-scifi-panel border border-scifi-border rounded-xl p-6 min-h-[300px] flex flex-col justify-center">
            {uploadStep > 0 || successMode ? (
              <div className="text-center">
                <h3 className={`${primaryColor} font-bold mb-6`}>
                  {successMode ? "ENCRYPTION COMPLETE" : "ENCRYPTION RUNNING"}
                </h3>

                <CryptoFlow currentStep={uploadStep} mode={cryptoMode} />

                {successMode && (
                  <div className="mt-8 bg-neon-green/5 border border-neon-green/30 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <FileCheck className="text-neon-green" size={24}/>
                      <span className="text-white font-bold">Sealed & Stored</span>
                    </div>

                    <button 
                      onClick={resetUpload} 
                      className={`mt-2 px-6 py-2 font-bold rounded-lg hover:scale-105 transition ${buttonColor}`}
                    >
                      <RefreshCw size={14}/> Encrypt Another
                    </button>
                  </div>
                )}
              </div>
            ) : !fileToUpload ? (
              <label className="border-2 border-dashed border-gray-700 rounded-lg h-full flex flex-col items-center justify-center cursor-pointer">
                <input type="file" onChange={onFileDrop} className="hidden" />
                <Upload className="mb-3" />
                Drop files to Stage
              </label>
            ) : (
              <div className="text-center">
                <FileText className="mx-auto mb-3"/>
                <p>{fileToUpload.name}</p>
                <button 
                  onClick={startEncryption} 
                  className={`mt-4 px-6 py-2 font-bold rounded-lg hover:scale-105 transition ${buttonColor}`}
                >
                  <Play size={14}/> Engage
                </button>
              </div>
            )}
          </div>

          {/* LOGS */}
          <div className="bg-black border border-gray-800 rounded-xl p-4 flex-1 overflow-y-auto">
            {logs.map((l, i) => <p key={i} className="text-xs font-mono">{l}</p>)}
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-span-1 bg-scifi-panel border border-scifi-border rounded-xl p-4 flex flex-col">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Server size={14}/> Vault Contents
          </h3>

          <div className="overflow-y-auto flex-1 space-y-2">
            {files.map(file => (
              <div key={file.id} onClick={() => setSelectedFile(file)} className="p-2 bg-white/5 rounded cursor-pointer">
                <p className="text-xs font-bold truncate">{file.filename}</p>
                <p className={`text-[10px] ${file.mode === 'hybrid' ? 'text-neon-green' : 'text-purple-400'}`}>
                  {file.mode}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const Tab = ({ id, active, set }) => (
  <button
    onClick={() => set(id)}
    className={`px-3 py-1 rounded capitalize ${active === id ? "bg-neon-blue text-black" : "bg-white/10 text-gray-400"}`}
  >
    {id}
  </button>
);

const Metric = ({ label, value }) => (
  <div className="bg-black/40 border border-gray-800 p-3 rounded flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="text-neon-green">{value}</span>
  </div>
);

export default Dashboard;
