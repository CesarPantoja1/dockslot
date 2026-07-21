import React from 'react';
import { Package, Truck, Activity } from 'lucide-react';
import DashboardStats from '../components/DashboardStats';
import TransportistasList from '../components/TransportistasList';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your DockSlot platform</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-blue-50">
            <Truck size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Transportistas</h3>
            <p className="text-sm text-slate-500">Manage registered carriers</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-green-50">
            <Package size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Reservations</h3>
            <p className="text-sm text-slate-500">View dock schedules</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-purple-50">
            <Activity size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Activity</h3>
            <p className="text-sm text-slate-500">Recent platform activity</p>
          </div>
        </div>
      </div>

      {/* Transportistas Table */}
      <TransportistasList />
    </div>
  );
};

export default DashboardPage;
