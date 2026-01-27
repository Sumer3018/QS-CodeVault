import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, AlertTriangle, Database, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="w-64 bg-black border-r border-scifi-border flex flex-col p-4 h-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <ShieldCheck className="text-neon-green" size={32} />
        <div>
            <h1 className="text-white font-bold text-lg tracking-wider">QS-VAULT</h1>
            <p className="text-gray-500 text-[10px] uppercase">Post-Quantum Gateway</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem to="/dashboard" icon={<ShieldCheck size={18} />} label="Secure Gateway" />
        <NavItem to="/performance" icon={<Activity size={18} />} label="Performance Monitor" />
        <NavItem to="/threat-model" icon={<AlertTriangle size={18} />} label="Threat Model" />
        <NavItem to="/cloud" icon={<Database size={18} />} label="Cloud Storage" />
      </nav>

      <div className="border-t border-gray-800 pt-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-bold">Disconnect</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded transition-all duration-300 ${isActive ? 'bg-neon-green/10 text-neon-green border-r-2 border-neon-green' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
    }
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

export default Sidebar;