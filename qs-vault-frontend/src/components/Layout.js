import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-scifi-bg text-gray-300 font-mono overflow-hidden">
      {/* The Transparency Panel / Sidebar */}
      <Sidebar />
      
      {/* Main Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
        {/* Optional: A subtle grid background for sci-fi effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        {children}
      </div>
    </div>
  );
};

export default Layout;