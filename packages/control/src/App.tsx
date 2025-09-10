import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RemoteControlPage } from './pages/RemoteControlPage';
import { useAuthStore } from './stores/authStore';
import './App.css';

function App() {
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/control/:deviceId" element={<RemoteControlPage />} />
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
