import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, Lock, Database, LayoutGrid, AlertTriangle } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-72 bg-scifi-panel border-r border-scifi-border flex flex-col h-screen p-6 shadow-2xl z-20">
      
      {/* BRANDING */}
      <div className="flex items-center gap-3 mb-10 text-neon-green">
        <Shield size={32} />
        <div>
          <h1 className="text-xl font-bold tracking-widest">QS-VAULT</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Post-Quantum Gateway</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2">
        <NavItem to="/dashboard" icon={<LayoutGrid size={18} />} label="Secure Gateway" />
        <NavItem to="/performance" icon={<Activity size={18} />} label="Performance Monitor" />
        <NavItem to="/threat-model" icon={<AlertTriangle size={18} />} label="Threat Model" />
        <NavItem to="/cloud" icon={<Database size={18} />} label="Cloud Storage" />
      </nav>

      {/* TRANSPARENCY PANEL (Requirement 1) */}
      <div className="mt-auto border-t border-scifi-border pt-6 space-y-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
          <Lock size={12} /> Cryptographic Spec
        </h3>
        
        <SpecItem label="PQC KEM" value="CRYSTALS-Kyber" color="text-neon-green" sub="NIST Level 5" />
        <SpecItem label="Symmetric" value="AES-256-GCM" color="text-neon-blue" sub="Authenticated Encryption" />
        <SpecItem label="Key Derivation" value="HKDF-SHA256" color="text-neon-purple" sub="Salted Extraction" />
        
        <div className="p-3 bg-red-900/10 border border-red-500/30 rounded text-center">
          <p className="text-[10px] text-red-400 uppercase mb-1">Cloud Trust Level</p>
          <p className="text-red-500 font-bold text-sm flex items-center justify-center gap-2">
            <Database size={12} /> UNTRUSTED
          </p>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 p-3 rounded transition-all duration-200 ${
        isActive 
          ? 'bg-neon-green/10 text-neon-green border-l-2 border-neon-green' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

const SpecItem = ({ label, value, color, sub }) => (
  <div>
    <p className="text-[10px] text-gray-500 uppercase">{label}</p>
    <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    <p className="text-[10px] text-gray-600">{sub}</p>
  </div>
);

export default Sidebar;