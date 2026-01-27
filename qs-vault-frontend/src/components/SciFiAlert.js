import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const SciFiAlert = ({ type = 'success', title, message, onClose, onConfirm }) => {
  const isSuccess = type === 'success';
  const color = isSuccess ? 'text-neon-green' : 'text-red-500';
  const border = isSuccess ? 'border-neon-green' : 'border-red-500';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-[450px] bg-black border ${border} p-1 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)]`}>
        <div className="bg-scifi-panel p-6 rounded-lg relative overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-4 border-b border-gray-800 pb-4">
                {isSuccess ? <CheckCircle className={color} size={32} /> : <AlertTriangle className={color} size={32} />}
                <div>
                    <h3 className={`text-lg font-bold uppercase tracking-widest ${color}`}>{title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase">System Notification</p>
                </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-8 leading-relaxed font-mono">
                {message}
            </p>

            <div className="flex justify-end gap-3">
                {onConfirm ? (
                    <>
                        <button onClick={onClose} className="px-6 py-2 border border-gray-700 text-gray-400 hover:text-white rounded uppercase text-xs font-bold transition">Cancel</button>
                        <button onClick={onConfirm} className={`px-6 py-2 ${isSuccess ? 'bg-neon-green text-black' : 'bg-red-600 text-white'} font-bold rounded uppercase text-xs hover:shadow-lg transition`}>
                            Confirm
                        </button>
                    </>
                ) : (
                    <button onClick={onClose} className={`w-full py-3 ${isSuccess ? 'bg-neon-green text-black' : 'bg-red-600 text-white'} font-bold rounded uppercase text-xs tracking-widest hover:opacity-90 transition`}>
                        Dismiss Protocol
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SciFiAlert;