import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FlashProvider } from './context/FlashContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FlashMessages from './components/FlashMessages';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Result from './pages/Result';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import TestHistory from './pages/TestHistory';

import './assets/css/global.css';

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="app-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <FlashMessages />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/"               element={isLoggedIn ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login/:userType"  element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup/:userType" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />} />

          {/* Protected – any logged-in user */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/result"    element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/doctors"   element={<ProtectedRoute><Doctors /></ProtectedRoute>} />

          {/* Protected – patients only */}
          <Route path="/assessment" element={<ProtectedRoute role="patient"><Assessment /></ProtectedRoute>} />
          <Route path="/history"    element={<ProtectedRoute role="patient"><TestHistory /></ProtectedRoute>} />

          {/* Protected – doctors only */}
          <Route path="/patients" element={<ProtectedRoute role="doctor"><Patients /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FlashProvider>
          <AppRoutes />
        </FlashProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
