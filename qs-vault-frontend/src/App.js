import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase'; // Import the client we made

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import ThreatModel from './pages/ThreatModel';
import CloudStorage from './pages/CloudStorage';
import Benchmark from './pages/Benchmark';
import ThreatLab from './pages/ThreatLab';



function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an active session immediately when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Set up a listener for Login/Logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Show a loading screen while we ask Supabase "Is this user logged in?"
  if (loading) {
    return (
      <div className="h-screen bg-black text-green-500 flex items-center justify-center font-mono">
        INITIALIZING QUANTUM LINK...
      </div>
    );
  }

  // 3. The New Protected Route Wrapper
  // Instead of checking localStorage, it checks the 'session' state variable
  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/threat-model" replace />;
    }
    return <Layout>{children}</Layout>;
  };

  return (
    // future flags fix the Router warnings you saw earlier
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>

  {/* DEFAULT ENTRY */}
  <Route path="/" element={<Navigate to="/threat-model" replace />} />

  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />

  <Route 
    path="/performance" 
    element={
      <ProtectedRoute>
        <Performance />
      </ProtectedRoute>
    } 
  />

  <Route 
    path="/benchmark" 
    element={
      <ProtectedRoute>
        <Benchmark />
      </ProtectedRoute>
    } 
  />

  <Route 
    path="/threat-model" 
    element={
      <ProtectedRoute>
        <ThreatModel />
      </ProtectedRoute>
    } 
  />

  <Route 
    path="/cloud" 
    element={
      <ProtectedRoute>
        <CloudStorage />
      </ProtectedRoute>
    } 
  />
  <Route
    path="/threat-lab"
    element={
      <ProtectedRoute>
        <ThreatLab />
      </ProtectedRoute>
    }
  />


</Routes>

    </BrowserRouter>
  );
}

export default App;