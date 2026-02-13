import React from 'react';
import { CloudOff, ShieldCheck, WifiOff, UserX } from 'lucide-react';

const ThreatModel = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">System Threat Model</h2>

    {/* ================= ABOUT PROJECT ================= */}
        <div className="mb-10 bg-scifi-panel border border-neon-blue/40 p-6 rounded-xl">
          <h3 className="text-neon-blue font-bold text-lg mb-3">
            About QS-Vault
          </h3>

          <p className="text-gray-300 text-sm leading-relaxed">
            QS-Vault is a next-generation post-quantum secure file protection
            platform. It combines modern Key Encapsulation mechanisms,
            deterministic session key derivation, and authenticated encryption
            to ensure data confidentiality even against future quantum-capable
            adversaries.
          </p>

          <p className="text-gray-400 text-sm mt-3">
            Encryption occurs on the trusted client side. Cloud providers,
            network intermediaries, and storage backends never access plaintext
            or usable keys. Each upload establishes a fresh cryptographic
            session with forward secrecy and tamper detection.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-mono">
            <AboutStat label="Key Exchange" value="PQC / Hybrid" />
            <AboutStat label="Session KDF" value="HKDF-SHA256" />
            <AboutStat label="Payload Cipher" value="AES-256-GCM" />
          </div>
        </div>

      
      <div className="grid grid-cols-2 gap-6">
        <ThreatCard 
            icon={<ShieldCheck size={40} className="text-neon-green" />}
            title="Local Gateway"
            status="TRUSTED"
            desc="The user's local machine runs the PQC engine. Keys are generated here and never leave plaintext."
            color="border-neon-green"
            textColor="text-neon-green"
        />
        <ThreatCard 
            icon={<CloudOff size={40} className="text-red-500" />}
            title="Cloud Storage Provider"
            status="UNTRUSTED"
            desc="The storage provider is assumed to be honest-but-curious or fully malicious. They only see high-entropy ciphertext."
            color="border-red-500"
            textColor="text-red-500"
        />
        <ThreatCard 
            icon={<WifiOff size={40} className="text-red-500" />}
            title="Network Layer"
            status="UNTRUSTED"
            desc="Active MITM attackers are assumed. PQC Authenticated Key Exchange prevents interception even by quantum computers."
            color="border-red-500"
            textColor="text-red-500"
        />
        <ThreatCard 
            icon={<UserX size={40} className="text-yellow-500" />}
            title="Quantum Adversary"
            status="MITIGATED"
            desc="A future attacker with a CRQC (Cryptographically Relevant Quantum Computer) cannot break captured sessions due to Kyber-512."
            color="border-yellow-500"
            textColor="text-yellow-500"
        />
      </div>
    </div>
  );
};

const ThreatCard = ({ icon, title, status, desc, color, textColor }) => (
    <div className={`bg-scifi-panel border ${color} p-6 rounded-xl relative overflow-hidden group`}>
        <div className="flex justify-between items-start mb-4">
            {icon}
            <span className={`text-xs font-bold px-2 py-1 rounded bg-opacity-10 ${textColor} bg-white border border-current`}>
                {status}
            </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const AboutStat = ({ label, value }) => (
  <div className="bg-black/40 border border-gray-800 p-3 rounded flex flex-col">
    <span className="text-gray-500">{label}</span>
    <span className="text-neon-green font-bold mt-1">{value}</span>
  </div>
);


export default ThreatModel;