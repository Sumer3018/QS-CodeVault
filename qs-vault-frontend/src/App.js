import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';

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
    // Get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen bg-black text-green-500 flex items-center justify-center font-mono">
        INITIALIZING QUANTUM LINK...
      </div>
    );
  }

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return <Layout>{children}</Layout>;
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* DEFAULT ENTRY */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate to="/threat-model" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* PROTECTED ROUTES */}
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