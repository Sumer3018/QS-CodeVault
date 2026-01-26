import React from 'react';
import { CloudOff, ShieldCheck, WifiOff, UserX } from 'lucide-react';

const ThreatModel = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">System Threat Model</h2>
      
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

export default ThreatModel;