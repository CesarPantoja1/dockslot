import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Lock, Unlock } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { validateSession, blockTransportista, unblockTransportista, UsuarioResponse } from '../services/api';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await validateSession();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleToggleBlock = async () => {
    if (!session) return;
    setToggling(true);
    try {
      if (session.esta_bloqueado) {
        await unblockTransportista(session.id);
      } else {
        await blockTransportista(session.id);
      }
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="p-2 rounded-xl hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Session</h1>
          <p className="text-slate-500 mt-1">Validate current user session</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-3" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSession} />
      ) : session ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{session.nombre}</h2>
              <p className="text-sm text-slate-500">{session.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Role</p>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                <span className="font-medium text-slate-800 capitalize">{session.rol}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                {session.esta_bloqueado ? (
                  <Lock size={16} className="text-red-500" />
                ) : (
                  <Unlock size={16} className="text-green-500" />
                )}
                <span className={`font-medium ${session.esta_bloqueado ? 'text-red-600' : 'text-green-600'}`}>
                  {session.esta_bloqueado ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>
            {session.empresa && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Company</p>
                <span className="font-medium text-slate-800">{session.empresa}</span>
              </div>
            )}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">User ID</p>
              <span className="font-medium text-slate-800">#{session.id}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions</h3>
            <button
              type="button"
              onClick={handleToggleBlock}
              disabled={toggling}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                session.esta_bloqueado
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              } disabled:opacity-50`}
            >
              {toggling ? (
                <span className="animate-pulse">Updating...</span>
              ) : session.esta_bloqueado ? (
                <>
                  <Unlock size={16} /> Unblock User
                </>
              ) : (
                <>
                  <Lock size={16} /> Block User
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <User size={48} className="text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-800">No Active Session</h2>
          <p className="text-sm text-slate-500 mt-1">No user is currently logged in.</p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
