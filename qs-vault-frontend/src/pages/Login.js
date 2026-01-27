import React, { useState } from 'react';
import { login, register } from '../services/api';
import { ShieldCheck, UserPlus, Lock, Key } from 'lucide-react';
import SciFiAlert from '../components/SciFiAlert';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [alert, setAlert] = useState(null); // Managed state for GUI Alert

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (password !== confirmPass) {
          setError("Passwords do not match.");
          return;
        }
        
        await register(username, password);
        
        // GUI Alert instead of window.alert
        setAlert({
            type: 'success',
            title: 'Identity Verified',
            message: 'New secure identity has been initialized in the Quantum Ledger. You may now access the Gateway.',
            onClose: () => {
                setAlert(null);
                setIsRegister(false); // Auto-switch to login after closing alert
            }
        });

      } else {
        const data = await login(username, password);
        localStorage.setItem('token', data.access_token);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      setError(isRegister 
        ? "Registration Failed: Username may be taken." 
        : "Access Denied: Invalid Identity or Passcode."
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-scifi-bg font-mono overflow-hidden relative">
      
      {/* RENDER THE GUI ALERT IF ACTIVE */}
      {alert && <SciFiAlert {...alert} />}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black"></div>
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-50"></div>

      <div className="z-10 w-[450px] bg-scifi-panel border border-scifi-border p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black border border-neon-green/50 mb-4 shadow-[0_0_15px_rgba(0,255,157,0.2)]">
            {isRegister ? <UserPlus className="text-neon-blue" size={28} /> : <ShieldCheck className="text-neon-green" size={28} />}
          </div>
          <h1 className={`text-2xl font-bold tracking-widest ${isRegister ? 'text-neon-blue' : 'text-neon-green'}`}>
            {isRegister ? 'NEW IDENTITY' : 'QS-VAULT'}
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1">
            {isRegister ? 'Initialize Secure Profile' : 'Post-Quantum Gateway'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
             <label className="flex items-center gap-2 text-[10px] uppercase text-gray-500 mb-1 group-focus-within:text-white transition-colors">
                <ShieldCheck size={12} /> Identity String
             </label>
             <input
                type="text" required
                className="w-full p-3 bg-black border border-gray-800 rounded focus:border-neon-green focus:outline-none text-white transition-all"
                placeholder="Enter Username"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
          </div>

          <div className="group">
             <label className="flex items-center gap-2 text-[10px] uppercase text-gray-500 mb-1 group-focus-within:text-white transition-colors">
                <Key size={12} /> Passcode
             </label>
             <input
                type="password" required
                className="w-full p-3 bg-black border border-gray-800 rounded focus:border-neon-green focus:outline-none text-white transition-all"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
          </div>

          {isRegister && (
            <div className="group animate-pulse-fast">
              <label className="flex items-center gap-2 text-[10px] uppercase text-neon-blue mb-1">
                  <Lock size={12} /> Confirm Passcode
              </label>
              <input
                  type="password" required
                  className="w-full p-3 bg-black border border-neon-blue/50 rounded focus:border-neon-blue focus:outline-none text-white transition-all"
                  placeholder="Re-enter to verify"
                  value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                />
            </div>
          )}

          {error && <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-center"><p className="text-red-500 text-xs font-bold">{error}</p></div>}

          <button type="submit" className={`w-full py-4 font-bold uppercase tracking-widest rounded transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${isRegister ? 'bg-neon-blue text-black hover:bg-white hover:shadow-neon-blue/50' : 'bg-neon-green text-black hover:bg-white hover:shadow-neon-green/50'}`}>
            {isRegister ? 'Initialize Protocol' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-gray-800">
           <p className="text-xs text-gray-600 mb-2">{isRegister ? "Already part of the system?" : "Need secure access?"}</p>
           <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className={`text-xs font-bold uppercase border-b border-transparent transition-colors ${isRegister ? 'text-neon-green hover:border-neon-green' : 'text-neon-blue hover:border-neon-blue'}`}>
             {isRegister ? "Return to Login" : ">>> Register New Identity <<<"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;