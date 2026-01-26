import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import ThreatModel from './pages/ThreatModel';
import CloudStorage from './pages/CloudStorage';

// Wrapper for protected routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If token exists, wrap child in Layout. If not, redirect to Login.
  return token ? <Layout>{children}</Layout> : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes (Wrapped in Sidebar Layout) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/performance" 
          element={
            <PrivateRoute>
              <Performance />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/threat-model" 
          element={
            <PrivateRoute>
              <ThreatModel />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/cloud" 
          element={
            <PrivateRoute>
              <CloudStorage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;