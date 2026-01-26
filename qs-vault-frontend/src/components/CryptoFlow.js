import React from 'react';
import { motion } from 'framer-motion';
import { Key, Shuffle, FileLock, UploadCloud, CheckCircle, Lock, Server } from 'lucide-react';

const CryptoFlow = ({ currentStep, mode }) => {
  
  // Define steps dynamically based on mode
  const steps = mode === 'hybrid' ? [
    { id: 1, label: "Generate Ephemeral Keys", sub: "Kyber-512", icon: Key },
    { id: 2, label: "Encapsulate Secret", sub: "PQC-KEM", icon: FileLock },
    { id: 3, label: "Derive Session Key", sub: "HKDF-SHA256", icon: Shuffle },
    { id: 4, label: "Encrypt Payload", sub: "AES-256-GCM", icon: Lock },
    { id: 5, label: "Upload to Cloud", sub: "Untrusted", icon: UploadCloud },
  ] : [
    // RSA MODE STEPS (Simpler)
    { id: 1, label: "Gen. RSA Keypair", sub: "RSA-2048", icon: Key },
    { id: 2, label: "Key Exchange", sub: "PKCS#1 v1.5", icon: Shuffle },
    { id: 3, label: "Derive Session Key", sub: "Standard KDF", icon: FileLock },
    { id: 4, label: "Encrypt Payload", sub: "AES-GCM", icon: Lock },
    { id: 5, label: "Upload to Cloud", sub: "Untrusted", icon: UploadCloud },
  ];

  return (
    <div className="bg-black/40 p-6 rounded-lg border border-scifi-border mb-6">
      <div className="flex justify-between items-center relative">
        
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-0"></div>
        <div 
          className={`absolute top-1/2 left-0 h-1 transition-all duration-500 -z-0 ${mode === 'hybrid' ? 'bg-neon-green' : 'bg-neon-purple'}`}
          style={{ width: `${(Math.max(currentStep - 1, 0) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = currentStep >= index + 1;
          const isCurrent = currentStep === index + 1;
          const Icon = step.icon;
          const activeColor = mode === 'hybrid' ? 'text-neon-green border-neon-green' : 'text-neon-purple border-neon-purple';

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-scifi-bg 
                  ${isActive ? activeColor + ' shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-gray-700 text-gray-700'}`}
              >
                {isActive && !isCurrent ? <CheckCircle size={20} /> : <Icon size={20} />}
              </motion.div>
              
              <div className="mt-3 text-center">
                <p className={`text-[10px] font-bold uppercase ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {step.label}
                </p>
                <p className="text-[9px] text-gray-500 font-mono">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoFlow;