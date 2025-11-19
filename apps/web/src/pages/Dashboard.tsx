import React from 'react';
import { useAuth } from '../contexts/useAuth';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ConsultorDashboard from './ConsultorDashboard';
import GestorDashboard from './GestorDashboard';
import InvestidorDashboard from './InvestidorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout title="Carregando...">
        <div className="tsf-loading-screen">
          <div className="tsf-loading-content">
            <div className="tsf-loading-spinner">
              <div className="tsf-spinner-large"></div>
            </div>
            <p className="tsf-text-secondary">Loading panel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  switch (user.role.toLowerCase()) {
    case 'consultor':
      return <ConsultorDashboard />;
    case 'gestor':
      return <GestorDashboard />;
    case 'investidor':
      return <InvestidorDashboard />;
    default:
      return (
        <DashboardLayout title="Acesso Negado">
          <div className="tsf-loading-screen">
            <div className="tsf-loading-content">
              <h2 className="tsf-text-xl tsf-text-error">Unauthorized access</h2>
              <p className="tsf-text-secondary">User type not recognized.</p>
            </div>
          </div>
        </DashboardLayout>
      );
  }
};

export default Dashboard;