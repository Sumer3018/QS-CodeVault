import React, { useEffect, useState } from 'react';
import { getFiles, inspectFile } from '../services/api';
import { Server, Lock, Eye } from 'lucide-react';

const CloudStorage = () => {
  const [files, setFiles] = useState([]);
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const load = async () => { try { const res = await getFiles(); setFiles(res.data); } catch(e){} };
    load();
  }, []);

  const handleInspect = async (id) => {
      try {
          const res = await inspectFile(id);
          setInspection(res.data);
      } catch (e) { alert("Could not inspect file."); }
  };

  return (
    <div className="p-8 space-y-8 h-full">
        <h2 className="text-2xl font-bold text-white mb-6">Cloud Storage Inspector</h2>
        
        <div className="grid grid-cols-2 gap-8 h-[500px]">
            <div className="bg-scifi-panel border border-scifi-border rounded-xl p-6 flex flex-col">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Server size={18} /> Cloud Bucket: /uploads</h3>
                <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
                    {files.map(f => (
                        <div key={f.id} onClick={() => handleInspect(f.id)} className="p-3 border border-gray-700 hover:border-neon-blue rounded cursor-pointer bg-black flex justify-between items-center group">
                            <p className="text-xs text-gray-400 font-mono group-hover:text-white">{f.filename}</p>
                            <Eye size={14} className="text-gray-600 group-hover:text-neon-blue"/>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-6 font-mono overflow-hidden flex flex-col">
                <h3 className="text-neon-green font-bold mb-4 flex items-center gap-2"><Lock size={18} /> Raw Ciphertext View</h3>
                {inspection ? (
                    <div className="break-all text-xs text-gray-400 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-4 pb-4 border-b border-gray-800">
                            <p className="text-white mb-1">File: {inspection.filename}</p>
                            <p className="text-gray-600">Path: {inspection.cloud_path}</p>
                        </div>
                        <p className="text-neon-blue uppercase mb-2">HEX DUMP (First 64 Bytes):</p>
                        <div className="p-4 border border-neon-blue/30 bg-neon-blue/5 rounded tracking-widest leading-loose text-[10px]">
                            {inspection.hex_preview} ...
                        </div>
                        <p className="mt-4 text-gray-600 text-[10px]">
                            * This represents the encrypted data stored on the untrusted cloud. 
                            Without the PQC private key and AES session key, this data is mathematically 
                            indistinguishable from random noise.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 italic">
                        Select a file to inspect ciphertext...
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CloudStorage;