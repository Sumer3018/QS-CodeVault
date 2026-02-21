import React, { useState } from "react";
import axios from "axios";
import { ShieldAlert, Cpu } from "lucide-react";

const attacks = [
  { id: "bitflip", name: "Bit Flip Injection", color: "red" },
  { id: "tag", name: "Tag Corruption", color: "orange" },
  { id: "truncate", name: "Ciphertext Truncation", color: "yellow" },
  { id: "mitm", name: "Man-in-the-Middle", color: "purple" },
  { id: "cpa", name: "Chosen Plaintext", color: "blue" },
  { id: "cca", name: "Chosen Ciphertext", color: "pink" }
];

const ThreatLab = () => {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [defense, setDefense] = useState(null);
  const [property, setProperty] = useState(null);
  const [running, setRunning] = useState(false);

  const run = async (type) => {
    setLogs([]);
    setDefense(null);
    setProperty(null);
    setStatus(null);
    setRunning(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/simulate/attack?attack=" + type
      );

      const steps =
        res.data.steps || [res.data.attack_info, res.data.detail];

      let i = 0;
      const interval = setInterval(() => {
        if (i >= steps.length) {
          clearInterval(interval);
          setStatus(res.data.status);
          setDefense(res.data.defense);
          setProperty(res.data.property);
          setRunning(false);
        } else {
          setLogs((prev) => [...prev, steps[i]]);
          i++;
        }
      }, 600);
    } catch (e) {
      setStatus("error");
      setRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Threat Simulation Lab
        </h2>
        <p className="text-gray-500 text-xs uppercase font-mono">
          Active Adversary Emulation Environment
        </p>
      </div>

      {/* ================= ATTACK SELECTOR ================= */}
      <div className="grid grid-cols-3 gap-4">
        {attacks.map((a) => (
          <button
            key={a.id}
            disabled={running}
            onClick={() => run(a.id)}
            className="bg-black/40 border border-gray-800 p-4 rounded-xl 
                       hover:border-neon-green hover:bg-neon-green/5 
                       transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <Cpu size={18} className="text-neon-green" />
              <span className="text-sm font-bold text-white">{a.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Simulate adversarial interference
            </p>
          </button>
        ))}
      </div>

      {/* ================= LIVE TERMINAL ================= */}
      <div className="bg-black border border-scifi-border rounded-xl p-6 font-mono text-xs">
        <div className="text-gray-500 mb-3">Live Execution Trace</div>

        {logs.length === 0 && !running && (
  <div className="space-y-2 text-xs font-mono">
    <div className="text-neon-green animate-pulse">
      ● Sensors Online
    </div>
    <div className="text-cyan-400">
      ● Defense Engine Ready
    </div>
    <div className="text-gray-500">
      ● No Active Threats
    </div>
  </div>
)}


        {logs.map((l, i) => (
          <div key={i} className="text-green-400 animate-fadeIn">
            ➜ {l}
          </div>
        ))}
      </div>

      {/* ================= RESULT ================= */}
      {status === "DETECTED" && (
        <div className="bg-red-600/20 border border-red-500 p-6 rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-400"/>
            <span className="text-red-400 font-bold text-lg">
              INTRUSION DETECTED
            </span>
          </div>
        </div>
      )}

      {status === "FAILED" && (
        <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded">
          Attack bypassed defenses
        </div>
      )}

      {/* ================= DEFENSE ================= */}
      {defense && (
        <div className="text-cyan-400 text-sm">
          Defense Activated → <b>{defense}</b>
        </div>
      )}

      {/* ================= PROPERTY ================= */}
      {property && (
        <div className="text-yellow-400 text-sm">
          Security Guarantee → <b>{property}</b>
        </div>
      )}

    </div>
  );
};

export default ThreatLab;
