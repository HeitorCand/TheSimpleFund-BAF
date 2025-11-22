import React, { useState, useEffect } from 'react';
import { dashboardService, userService, fundService, orderService } from '../services/api';
import { FiUsers, FiUserCheck, FiBox, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

interface Stats {
  totalConsultants: number;
  totalInvestors: number;
  totalFunds: number;
  totalInvestments: number;
  pendingApprovals: {
    consultores: number;
    investidores: number;
    funds: number;
    assignors: number;
    debtors: number;
  };
}

const GestorDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [pendingCounts, consultores, investidores, funds, orders] = await Promise.all([
          dashboardService.getPendingCounts(),
          userService.getConsultores(),
          userService.getInvestidores(),
          fundService.list(),
          orderService.list()
        ]);

        setStats({
          totalConsultants: consultores?.consultores?.length || 0,
          totalInvestors: investidores?.investidores?.length || 0,
          totalFunds: funds?.funds?.length || 0,
          totalInvestments: orders?.orders?.length || 0,
          pendingApprovals: pendingCounts.pendingCounts
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mb-4"></div>
        <p className="text-white">Loading dashboard...</p>
      </div>
    );
  }

  const totalPending = stats ? 
    stats.pendingApprovals.consultores + 
    stats.pendingApprovals.investidores + 
    stats.pendingApprovals.funds + 
    stats.pendingApprovals.assignors + 
    stats.pendingApprovals.debtors : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Management Dashboard</h1>
        <p className="text-gray-300 mt-1">Overview of the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiUsers className="text-primary" />}
          title="Consultants"
          value={stats?.totalConsultants || 0}
          pending={stats?.pendingApprovals.consultores || 0}
        />
        <StatCard
          icon={<FiUserCheck className="text-primary" />}
          title="Investors"
          value={stats?.totalInvestors || 0}
          pending={stats?.pendingApprovals.investidores || 0}
        />
        <StatCard
          icon={<FiBox className="text-primary" />}
          title="Funds"
          value={stats?.totalFunds || 0}
          pending={stats?.pendingApprovals.funds || 0}
        />
        <StatCard
          icon={<FiDollarSign className="text-primary" />}
          title="Investments"
          value={stats?.totalInvestments || 0}
          pending={0}
        />
      </div>

      {/* Pending Approvals Alert */}
      {totalPending > 0 && (
        <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-start">
            <FiAlertCircle className="text-[#F8FBA2] text-2xl mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white text-lg">Pending Approvals</h3>
              <p className="text-gray-300 mt-1">
                You have <span className="font-bold">{totalPending}</span> items waiting for approval.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-300">
                {stats && stats.pendingApprovals.consultores > 0 && (
                  <li>• {stats.pendingApprovals.consultores} Consultant{stats.pendingApprovals.consultores > 1 ? 's' : ''}</li>
                )}
                {stats && stats.pendingApprovals.investidores > 0 && (
                  <li>• {stats.pendingApprovals.investidores} Investor{stats.pendingApprovals.investidores > 1 ? 's' : ''}</li>
                )}
                {stats && stats.pendingApprovals.funds > 0 && (
                  <li>• {stats.pendingApprovals.funds} Fund{stats.pendingApprovals.funds > 1 ? 's' : ''}</li>
                )}
                {stats && stats.pendingApprovals.assignors > 0 && (
                  <li>• {stats.pendingApprovals.assignors} Assignor{stats.pendingApprovals.assignors > 1 ? 's' : ''}</li>
                )}
                {stats && stats.pendingApprovals.debtors > 0 && (
                  <li>• {stats.pendingApprovals.debtors} Debtor{stats.pendingApprovals.debtors > 1 ? 's' : ''}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton to="/consultores" label="Review Consultants" />
          <QuickActionButton to="/investidores" label="Review Investors" />
          <QuickActionButton to="/fundos" label="Manage Funds" />
          <QuickActionButton to="/investments" label="Review Investments" />
          <QuickActionButton to="/assignors" label="Manage Assignors" />
          <QuickActionButton to="/debtors" label="Manage Debtors" />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  value: number;
  pending?: number;
}> = ({ icon, title, value, pending }) => (
  <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
    <div className="flex items-center justify-between">
      <div className="text-3xl">{icon}</div>
      {pending !== undefined && pending > 0 && (
        <span className="px-2 py-1 text-xs font-bold text-white bg-[#FA7F7F] rounded-full">
          {pending}
        </span>
      )}
    </div>
    <h3 className="text-gray-300 text-sm font-medium mt-4">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
    {pending !== undefined && pending > 0 && (
      <p className="text-xs text-[#FA7F7F] mt-1">{pending} pending approval</p>
    )}
  </div>
);

const QuickActionButton: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <a
    href={to}
    className="block px-4 py-3 text-center text-sm font-medium text-gray-300 bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] hover:bg-white/[0.08] transition-colors"
  >
    {label}
  </a>
);

export default GestorDashboard;
