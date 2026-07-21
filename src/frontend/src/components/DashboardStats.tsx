import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
} from 'lucide-react';
import Skeleton from './Skeleton';
import {
  getTransportistas,
  TransportistaResponse,
} from '../services/api';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  const [transportistas, setTransportistas] = useState<TransportistaResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransportistas();
        setTransportistas(data);
      } catch {
        // Silently handle — stats just show 0
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28" count={4} />
      </div>
    );
  }

  const total = transportistas.length;
  const active = transportistas.filter((t) => !t.esta_bloqueado).length;
  const blocked = transportistas.filter((t) => t.esta_bloqueado).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Users size={22} className="text-blue-600" />}
        label="Total Transportistas"
        value={total}
        color="bg-blue-50"
      />
      <StatCard
        icon={<UserCheck size={22} className="text-green-600" />}
        label="Active"
        value={active}
        color="bg-green-50"
      />
      <StatCard
        icon={<UserX size={22} className="text-red-600" />}
        label="Blocked"
        value={blocked}
        color="bg-red-50"
      />
      <StatCard
        icon={<Calendar size={22} className="text-purple-600" />}
        label="Registered"
        value="—"
        color="bg-purple-50"
      />
    </div>
  );
};

export default DashboardStats;
