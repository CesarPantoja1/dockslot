import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, KeyRound } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import TransportistasPage from './pages/TransportistasPage';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/auth', label: 'Session', icon: <KeyRound size={18} /> },
    { to: '/transportistas', label: 'Transportistas', icon: <Users size={18} /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-lg font-bold text-slate-900">DockSlot</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/transportistas" element={<TransportistasPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
