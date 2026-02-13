import React from "react";
import { CheckCircle } from "lucide-react";

const CryptoTreeFlow = ({ currentStep, mode }) => {

  const isRSA = mode === "rsa";

  const color = isRSA ? "neon-purple" : "neon-green";
  const text = isRSA ? "text-neon-purple" : "text-neon-green";
  const border = isRSA ? "border-neon-purple" : "border-neon-green";
  const line = isRSA ? "bg-neon-purple" : "bg-neon-green";

  const steps = isRSA ? [
    {
      title: "RSA KEY GEN",
      sub: "2048-bit",
      children: ["Generate modulus", "Public / Private"]
    },
    {
      title: "KEY WRAP",
      sub: "OAEP",
      children: ["Encrypt session key"]
    },
    {
      title: "SESSION SETUP",
      sub: "KDF",
      children: ["Prepare AES"]
    },
    {
      title: "AES ENCRYPT",
      sub: "GCM",
      children: ["Encrypt blocks", "Auth tag"]
    },
    {
      title: "UPLOAD",
      sub: "Untrusted",
      children: ["Push blob"]
    }
  ] : [
    {
      title: "EPHEMERAL AGREEMENT",
      sub: "X25519",
      children: ["Generate key", "Exchange public"]
    },
    {
      title: "ENCAPSULATE SECRET",
      sub: "PQC",
      children: ["Shared secret", "Create ciphertext"]
    },
    {
      title: "HKDF DERIVATION",
      sub: "SHA-256",
      children: ["Mix salt", "Expand"]
    },
    {
      title: "AES ENCRYPT",
      sub: "GCM",
      children: ["Encrypt blocks", "Generate tag"]
    },
    {
      title: "UPLOAD",
      sub: "Untrusted",
      children: ["Pack blob", "Push storage"]
    }
  ];

  return (
    <div className="bg-black/40 p-6 rounded-xl border border-scifi-border">
      <div className="flex justify-between items-center relative">

        {/* Base line */}
        <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-800"></div>

        {/* Active line */}
        <div
          className={`absolute top-6 left-0 h-[2px] ${line} transition-all`}
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s, i) => {
          const done = currentStep > i + 1;
          const active = currentStep >= i + 1;

          return (
            <div key={i} className="relative flex flex-col items-center w-40">

              {/* circle */}
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-scifi-bg
                ${active ? border + " " + text : "border-gray-700 text-gray-600"}`}>
                {done ? <CheckCircle size={18} /> : i + 1}
              </div>

              {/* titles */}
              <p className={`text-[10px] mt-2 font-bold ${active ? "text-white" : "text-gray-500"}`}>
                {s.title}
              </p>
              <p className="text-[9px] text-gray-600 font-mono">{s.sub}</p>

              {/* children */}
              <div className="mt-3 space-y-1">
                {s.children.map((c, k) => (
                  <p key={k} className={`text-[10px] font-mono ${text}`}>{c}</p>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoTreeFlow;
