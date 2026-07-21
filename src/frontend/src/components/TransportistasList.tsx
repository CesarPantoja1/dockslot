import React, { useEffect, useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, User, Lock, Unlock } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import {
  getTransportistas,
  blockTransportista,
  unblockTransportista,
  TransportistaResponse,
} from '../services/api';

const TransportistasList: React.FC = () => {
  const [transportistas, setTransportistas] = useState<TransportistaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchTransportistas = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransportistas({ search: searchTerm || undefined });
      setTransportistas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transportistas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportistas();
  }, []);

  const handleSearch = () => {
    fetchTransportistas(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleToggleBlock = async (usuarioId: number, currentlyBlocked: boolean) => {
    setToggling(usuarioId);
    try {
      if (currentlyBlocked) {
        await unblockTransportista(usuarioId);
      } else {
        await blockTransportista(usuarioId);
      }
      await fetchTransportistas(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transportista');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Transportistas</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" count={5} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchTransportistas(search)} />
      ) : transportistas.length === 0 ? (
        <EmptyState
          icon={<User size={48} />}
          title="No transportistas found"
          description={search ? 'Try a different search term.' : 'No transportistas have been registered yet.'}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Company</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transportistas.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-800">{t.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{t.email}</td>
                  <td className="py-3 px-4 text-slate-600">{t.empresa || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        t.esta_bloqueado
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {t.esta_bloqueado ? (
                        <ShieldAlert size={12} />
                      ) : (
                        <ShieldCheck size={12} />
                      )}
                      {t.esta_bloqueado ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(t.id, t.esta_bloqueado)}
                      disabled={toggling === t.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        t.esta_bloqueado
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      } disabled:opacity-50`}
                    >
                      {toggling === t.id ? (
                        <span className="animate-pulse">...</span>
                      ) : t.esta_bloqueado ? (
                        <Unlock size={14} />
                      ) : (
                        <Lock size={14} />
                      )}
                      {t.esta_bloqueado ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransportistasList;
