import React from 'react';
import TransportistasList from '../components/TransportistasList';

const TransportistasPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transportistas</h1>
        <p className="text-slate-500 mt-1">Manage all registered transportistas</p>
      </div>
      <TransportistasList />
    </div>
  );
};

export default TransportistasPage;
