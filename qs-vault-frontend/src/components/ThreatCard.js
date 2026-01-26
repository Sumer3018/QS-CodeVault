import React from 'react';

const ThreatCard = ({ icon, title, status, desc, color, textColor }) => (
    <div className={`bg-scifi-panel border ${color} p-6 rounded-xl relative overflow-hidden group hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all`}>
        <div className="flex justify-between items-start mb-4">
            {icon}
            <span className={`text-xs font-bold px-2 py-1 rounded bg-opacity-10 ${textColor} bg-white border border-current`}>
                {status}
            </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        
        {/* Subtle background glow effect */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-current opacity-5 blur-3xl rounded-full ${textColor}`}></div>
    </div>
);

export default ThreatCard;