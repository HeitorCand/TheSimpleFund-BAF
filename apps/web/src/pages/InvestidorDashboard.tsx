import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { fundService, orderService, stellarService } from '../services/api';
import DashboardLayout from '../components/layouts/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

interface Fund {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number | null;
  symbol: string;
  status: string;
  maxSupply: number;
  totalIssued: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  consultorId?: string;
}

interface Order {
  id: string;
  fundId: string;
  total: number;
  price: number;
  quantity: number;
  status: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    name: string;
    symbol: string;
  };
}

const InvestidorDashboard: React.FC = () => {
  const { user, logout, updateStellarKey, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio'>('marketplace');
  const [funds, setFunds] = useState<Fund[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [stellarKeys, setStellarKeys] = useState<{publicKey: string, secretKey: string} | null>(null);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fundService.list();
      setFunds(response.filter((fund: Fund) => fund.status === 'APPROVED'));
    } catch {
      toast.error('Error loading funds');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.list();
      setOrders(response);
    } catch {
      toast.error('Error loading portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (activeTab === 'marketplace') {
      await loadFunds();
    } else {
      await loadOrders();
    }
  }, [activeTab, loadFunds, loadOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateStellarKeys = async () => {
    try {
      const response = await stellarService.generateKeys();
      setStellarKeys(response);
      await updateStellarKey(response.publicKey, response.secretKey);
      toast.success('Stellar keys generated successfully!');
    } catch {
      toast.error('Error generating Stellar keys');
    }
  };

  const fundAccount = async () => {
    if (!stellarKeys) {
      toast.error('Generate Stellar keys first');
      return;
    }

    try {
      await stellarService.fundAccount(stellarKeys.publicKey);
      toast.success('Account funded with test XLM!');
    } catch {
      toast.error('Error funding account');
    }
  };

  const handleInvestment = async () => {
    if (!selectedFund || !investmentAmount) {
      toast.error('Select a fund and investment amount');
      return;
    }

    if (!stellarKeys) {
      toast.error('Generate Stellar keys first');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(investmentAmount);
      
      await orderService.create({
        fundId: selectedFund.id,
        amount,
        quantity: amount
      });
      
      toast('Adding investor to whitelist...', { icon: 'ℹ️' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast('Minting tokens for investor...', { icon: '🪙' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast('Updating token balance...', { icon: '📊' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Investment of R$ ${amount.toLocaleString('en-US')} completed successfully!`);
      toast.success(`You received ${amount} ${selectedFund.symbol || 'FUND'} tokens!`);
      
      setSelectedFund(null);
      setInvestmentAmount('');
      loadOrders();
    } catch {
      toast.error('Error creating investment order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'tsf-status-approved';
      case 'pending':
        return 'tsf-status-pending';
      case 'cancelled':
        return 'tsf-status-rejected';
      default:
        return 'tsf-status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <>
      {/* Awaiting Approval Modal */}
      <Modal
        isOpen={user?.status !== 'APPROVED'}
        onClose={() => {}}
        title="Awaiting Approval"
        closeOnOverlayClick={false}
        showCloseButton={false}
        size="md"
      >
        <div className="tsf-text-center">
          <div className="tsf-status-icon tsf-status-icon--warning tsf-mb-md">
            ⚠️
          </div>
          
          <div className="tsf-mb-lg">
            <p className="tsf-mb-md">
              Your investor account is being reviewed by the management team.
              Please wait for approval to access all platform features.
            </p>
            
            <Card className="tsf-alert tsf-alert--warning">
              <h4 className="tsf-text-sm tsf-font-medium tsf-mb-sm">Current status:</h4>
              <div className="tsf-flex tsf-items-center tsf-justify-center">
                <span className={`tsf-status-badge tsf-status-${
                  user?.status === 'PENDING' ? 'pending' :
                  user?.status === 'REJECTED' ? 'rejected' :
                  'pending'
                }`}>
                  {user?.status === 'PENDING' ? 'Pending Approval' :
                   user?.status === 'REJECTED' ? 'Rejected' :
                   user?.status || 'Under Review'}
                </span>
              </div>
            </Card>
            
            {user?.status === 'REJECTED' && (
              <Card className="tsf-alert tsf-alert--error tsf-mt-md">
                <p className="tsf-text-sm">
                  Your account was rejected. Please contact support for more information.
                </p>
              </Card>
            )}
            
            <p className="tsf-text-xs tsf-text-tertiary tsf-mt-md">
              📧 For questions, contact: suporte@TheSimpleFund.com.br
            </p>
          </div>
          
          <div className="tsf-flex tsf-gap-md">
            <Button
              variant="primary"
              size="md"
              onClick={async () => {
                try {
                  await refreshUser();
                  toast.success('Status updated!');
                } catch {
                  toast.error('Error updating status');
                }
              }}
              className="tsf-flex-1"
            >
              Update Status
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={logout}
              className="tsf-flex-1"
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dashboard Content - Only shown if approved */}
      {user?.status === 'APPROVED' && (
        <DashboardLayout>
          {/* Investor Summary */}
          <div className="tsf-dashboard-header tsf-mb-xl tsf-p-md">
            <div className="tsf-dashboard-welcome">
              <h2 className="tsf-text-2xl tsf-font-medium tsf-mb-sm">
                Olá, {user?.email ? user.email.split('@')[0] : 'Investidor'} 👋
              </h2>
              <p className="tsf-text-secondary tsf-text-base">
                Welcome to your investment dashboard. Here you can manage your assets and explore new opportunities.
              </p>
            </div>
          </div>

          {/* Wallet Setup */}
          {!stellarKeys && (
            <Card className="tsf-mb-lg tsf-border-l-warning">
              <div className="tsf-flex tsf-items-start tsf-gap-md">
                <div className="tsf-wallet-setup-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 14h.01M7 7h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14"></path>
                  </svg>
                </div>
                <div className="tsf-flex-1">
                  <h4 className="tsf-text-base tsf-font-medium tsf-mb-xs">
                    Set Up Stellar Wallet
                  </h4>
                  <p className="tsf-text-sm tsf-text-secondary tsf-mb-sm">
                    You need to generate your Stellar keys to make investments via blockchain.
This is a necessary step to ensure the security of your transactions.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={generateStellarKeys}
                  >
                    <svg width="16" height="16" fill="none" className="tsf-mr-xs" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                    Generate Keys
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {stellarKeys && (
            <Card className="tsf-mb-lg tsf-wallet-card">
              <div className="tsf-flex tsf-flex-col tsf-sm:flex-row tsf-gap-md">
                <div className="tsf-wallet-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 7v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z"></path>
                    <path d="M19 14h-4a2 2 0 110-4h4"></path>
                    <circle cx="16" cy="12" r="1"></circle>
                  </svg>
                </div>
                <div className="tsf-flex-1">
                  <div className="tsf-wallet-header">
                    <h4 className="tsf-wallet-title">
                      <svg width="16" height="16" className="tsf-mr-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                     Stellar Wallet
                    </h4>
                    <span className="tsf-wallet-badge">Ativo</span>
                  </div>
                  
                  <div className="tsf-wallet-address">
                    <div className="tsf-wallet-address-label">Public Key</div>
                    <div className="tsf-wallet-address-value">
                      <code>{stellarKeys.publicKey}</code>
                      <button 
                        className="tsf-wallet-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(stellarKeys.publicKey);
                          toast.success('Chave copiada!');
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="tsf-wallet-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={fundAccount}
                    >
                      <svg width="16" height="16" className="tsf-mr-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1v22M1 12h22"></path>
                      </svg>
                      Finance (Testnet)
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="tsf-grid-stats mb-16 tsf-mb-2xl tsf-gap-md">
            <Card className="tsf-stat-card tsf-p-md">
              <div className="tsf-stat-icon tsf-stat-icon--purple tsf-p-sm">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="tsf-stat-content tsf-mt-sm">
                <h3 className="tsf-stat-value tsf-text-xl">
                  {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </h3>
                <p className="tsf-stat-label">Total Invested</p>
              </div>
            </Card>

            <Card className="tsf-stat-card">
              <div className="tsf-stat-icon tsf-stat-icon--blue">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 12V8h-4M4 12v4h4M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"></path>
                </svg>
              </div>
              <div className="tsf-stat-content">
                <h3 className="tsf-stat-value">{orders.length}</h3>
                <p className="tsf-stat-label">Active Investments</p>
              </div>
            </Card>

            <Card className="tsf-stat-card">
              <div className="tsf-stat-icon tsf-stat-icon--green">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 8v8m-8-8v8M3 12h18M5 4h14l1 2H4l1-2z"></path>
                  <path d="M6 6l.223 14h11.554L18 6"></path>
                </svg>
              </div>
              <div className="tsf-stat-content">
                <h3 className="tsf-stat-value">{funds.length}</h3>
                <p className="tsf-stat-label">Available Funds</p>
              </div>
            </Card>

            <Card className="tsf-stat-card">
              <div className="tsf-stat-icon tsf-stat-icon--amber">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="tsf-stat-content">
                <h3 className="tsf-stat-value">
                  {orders.filter(order => order.status === 'pending').length}
                </h3>
                <p className="tsf-stat-label">Pending Approval</p>
              </div>
            </Card>
          </div>

          

          {/* Main Tabs Navigation */}
          <div className="tsf-tabs-modern tsf-mb-xl tsf-mt-xl tsf-p-sm">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`tsf-tab-modern ${activeTab === 'marketplace' ? 'tsf-tab-modern--active' : ''} tsf-p-md`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="tsf-text-base tsf-mx-sm">Marketplace</span>
              {funds.length > 0 && <span className="tsf-tab-modern__badge">{funds.length}</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`tsf-tab-modern ${activeTab === 'portfolio' ? 'tsf-tab-modern--active' : ''} tsf-p-md`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
              <span className="tsf-text-base tsf-mx-sm">My Portfolio</span>
              {orders.length > 0 && <span className="tsf-tab-modern__badge">{orders.length}</span>}
            </button>
            
            <div 
              className="tsf-tab-modern__indicator" 
              style={{ 
                left: activeTab === 'marketplace' ? '0%' : '50%', 
                width: '50%' 
              }} 
            />
          </div>

          {/* Content */}
          {activeTab === 'marketplace' ? (
            <div className="tsf-marketplace tsf-p-md">
              <div className="tsf-section-header tsf-mb-lg tsf-p-md tsf-bg-secondary tsf-rounded">
                <div>
                  <h3 className="tsf-section-title tsf-text-xl tsf-mb-sm">Available Funds</h3>
                  <p className="tsf-section-subtitle tsf-text-base">Explore and invest in the funds available on the platform</p>
                </div>
                <div className="tsf-section-actions tsf-flex tsf-gap-md">
                  <button className="tsf-filter-button tsf-p-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span className="tsf-ml-xs">Filter</span>
                  </button>
                                    <button className="tsf-sort-button tsf-p-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5h10M11 9h7M11 13h4M3 17h18M3 13V3l4 4M7 3L3 7"></path>
                    </svg>
                    <span className="tsf-ml-xs">Sort</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="tsf-loading-container">
                  <div className="tsf-loading-spinner">
                    <div className="tsf-spinner"></div>
                  </div>
                  <p className="tsf-loading-text">Loading available funds...</p>
                </div>
              ) : (
                <div className="tsf-funds-grid tsf-gap-lg tsf-p-md">
                  {funds.map((fund) => (
                    <div key={fund.id} className="tsf-fund-card-modern tsf-p-md">
                      <div className="tsf-fund-card-header tsf-mb-md">
                        <div className="tsf-fund-card-symbol tsf-text-lg tsf-p-sm">{fund.symbol}</div>
                        <div className="tsf-fund-card-badge tsf-p-xs">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                          Approved
                        </div>
                      </div>
                      
                      <h4 className="tsf-fund-card-title">{fund.name}</h4>
                      
                      {fund.description && (
                        <p className="tsf-fund-card-description">
                          {fund.description.length > 80 
                            ? `${fund.description.substring(0, 80)}...` 
                            : fund.description}
                        </p>
                      )}
                      
                      <div className="tsf-fund-card-stats">
                        <div className="tsf-fund-card-stat">
                          <div className="tsf-fund-card-stat-label">Price</div>
                          <div className="tsf-fund-card-stat-value tsf-highlight">
                            R$ {fund.price.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="tsf-fund-card-stat">
                          <div className="tsf-fund-card-stat-label">Available Quotas</div>
                          <div className="tsf-fund-card-stat-value">
                            {(fund.maxSupply - fund.totalIssued).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="tsf-fund-card-stat">
                          <div className="tsf-fund-card-stat-label">Capitalization</div>
                          <div className="tsf-fund-card-stat-value">
                            {(fund.totalIssued * fund.price).toLocaleString('pt-BR', {
                              style: 'currency', 
                              currency: 'BRL'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="tsf-fund-card-progress">
                        <div className="tsf-fund-card-progress-label">
                          <span>Fundraising</span>
                          <span>{Math.round((fund.totalIssued / fund.maxSupply) * 100)}%</span>
                        </div>
                        <div className="tsf-fund-card-progress-bar">
                          <div 
                            className="tsf-fund-card-progress-fill" 
                            style={{width: `${Math.round((fund.totalIssued / fund.maxSupply) * 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="tsf-fund-card-actions">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setSelectedFund(fund)}
                          fullWidth
                          disabled={fund.maxSupply <= fund.totalIssued}
                        >
                          {fund.maxSupply <= fund.totalIssued ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                              <span>Sold out</span>
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                              </svg>
                              <span>Invest Now</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {funds.length === 0 && !loading && (
                <Card className="tsf-empty-state-card">
                  <div className="tsf-empty-state">
                    <div className="tsf-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <h3 className="tsf-empty-title">No funds available</h3>
                    <p className="tsf-empty-description">
                      There are no approved funds for investment at this time.
New funds will be available after approval by the manager.
                    </p>
                    <Button variant="secondary" size="sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>Monitor New Funds</span>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="tsf-portfolio">
              <div className="tsf-section-header tsf-mb-md">
                <div>
                  <h3 className="tsf-section-title">My Portfolio</h3>
                  <p className="tsf-section-subtitle">Track your investments and performance</p>
                </div>
                <div className="tsf-section-actions">
                  <button className="tsf-view-toggle-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>Preview</span>
                  </button>
                  <button className="tsf-export-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="tsf-loading-container">
                  <div className="tsf-loading-spinner">
                    <div className="tsf-spinner"></div>
                  </div>
                  <p className="tsf-loading-text">Loading your portfolio...</p>
                </div>
              ) : (
                <Card className="tsf-portfolio-table-card">
                  <div className="tsf-portfolio-overview">
                    <div className="tsf-portfolio-summary">
                      <div className="tsf-portfolio-summary-item">
                        <div className="tsf-portfolio-summary-label">Total Invested</div>
                        <div className="tsf-portfolio-summary-value">
                          {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </div>
                      </div>
                      <div className="tsf-portfolio-summary-item">
                        <div className="tsf-portfolio-summary-label">Total Tokens</div>
                        <div className="tsf-portfolio-summary-value">
                          {orders.reduce((sum, order) => sum + order.quantity, 0).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="tsf-portfolio-summary-item">
                        <div className="tsf-portfolio-summary-label">Operations</div>
                        <div className="tsf-portfolio-summary-value">
                          {orders.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tsf-table-container">
                    <table className="tsf-table-modern">
                      <thead>
                        <tr>
                          <th>Fund</th>
                          <th>Quantity</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <div className="tsf-fund-cell">
                                <div className="tsf-fund-cell-icon">{order.fund?.symbol?.charAt(0) || 'F'}</div>
                                <div>
                                  <div className="tsf-fund-cell-name">{order.fund?.name || 'N/A'}</div>
                                  <div className="tsf-fund-cell-symbol">{order.fund?.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="tsf-quantity-cell">
                                <span className="tsf-quantity-value">
                                  {order.quantity.toLocaleString('pt-BR')}
                                </span>
                                <span className="tsf-quantity-label">tokens</span>
                              </div>
                            </td>
                            <td>
                              <div className="tsf-amount-cell">
                                {order.total.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </div>
                            </td>
                            <td>
                              <span className={`tsf-status-badge-modern tsf-status-${getStatusBadgeClass(order.status).split('-')[1]}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td>
                              <div className="tsf-date-cell">
                                <div className="tsf-date-value">
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="tsf-date-time">
                                  {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </td>
                            <td>
                              <button className="tsf-row-action-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="12" cy="5" r="1"></circle>
                                  <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {orders.length === 0 && (
                      <div className="tsf-empty-state">
                        <div className="tsf-empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                          </svg>
                        </div>
                        <h3 className="tsf-empty-title">No investment made</h3>
                        <p className="tsf-empty-description">
                          Your investments will appear here after your first purchase.
Explore the marketplace to start investing.
                        </p>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => setActiveTab('marketplace')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                          </svg>
                          <span>Explore Marketplace</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </DashboardLayout>
      )}

      {/* Investment Modal */}
      <Modal
        isOpen={!!selectedFund}
        onClose={() => {
          setSelectedFund(null);
          setInvestmentAmount('');
        }}
        title={`Invest in ${selectedFund?.name}`}
        size="lg"
        className="tsf-investment-modal"
      >
        {selectedFund && (
          <div className="tsf-p-md">
            <Card className="tsf-mb-xl tsf-p-md tsf-border-l-info">
              <h4 className="tsf-font-medium tsf-mb-md tsf-text-lg">Fund Information</h4>
              <div className="tsf-text-sm tsf-space-y-md">
                <div className="tsf-fund-detail tsf-py-xs">
                  <span className="tsf-detail-label tsf-font-medium">Symbol:</span>
                  <span className="tsf-detail-value">{selectedFund.symbol}</span>
                </div>
                <div className="tsf-fund-detail tsf-py-xs">
                  <span className="tsf-detail-label tsf-font-medium">Price per share:</span>
                  <span className="tsf-detail-value">R$ {selectedFund.price.toLocaleString('pt-BR')}</span>
                </div>
                <div className="tsf-fund-detail tsf-py-xs">
                  <span className="tsf-detail-label tsf-font-medium">Available Quotas:</span>
                  <span className="tsf-detail-value">
                    {(selectedFund.maxSupply - selectedFund.totalIssued).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              {selectedFund.description && (
                <p className="tsf-text-sm tsf-text-secondary tsf-mt-md tsf-p-sm tsf-bg-secondary tsf-rounded">{selectedFund.description}</p>
              )}
            </Card>
            
            <div className="tsf-mb-xl tsf-p-md tsf-bg-secondary tsf-rounded">
              <label className="tsf-font-medium tsf-mb-sm tsf-block tsf-text-base">Investment Amount (R$)</label>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={`Mínimo: R$ ${selectedFund.price.toLocaleString('pt-BR')}`}
                className="tsf-input-investment tsf-py-md tsf-text-lg"
              />
              {investmentAmount && (
                <div className="tsf-mt-md tsf-p-sm tsf-bg-primary tsf-rounded tsf-flex tsf-items-center tsf-justify-between">
                  <span className="tsf-text-sm tsf-text-white">Tokens receivable:</span>
                  <span className="tsf-text-lg tsf-font-bold tsf-text-white">
                    {Math.floor(parseFloat(investmentAmount) / selectedFund.price)} {selectedFund.symbol}
                  </span>
                </div>
              )}
            </div>

            <Card className="tsf-alert tsf-alert--info tsf-mb-xl tsf-p-md">
              <div className="tsf-flex tsf-items-start tsf-gap-md">
                <div className="tsf-status-icon tsf-status-icon--info tsf-p-sm">ℹ️</div>
                <div className="tsf-text-sm">
                  <p className="tsf-mb-sm">
                    <strong className="tsf-text-base">Investing via Blockchain:</strong>
                  </p>
                  <p> 
                    Your transaction will be processed on the Stellar network, ensuring complete transparency and security.
The tokens will be available in your wallet after confirmation.
                  </p>
                </div>
              </div>
            </Card>

            <div className="tsf-flex tsf-gap-md tsf-mt-xl">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSelectedFund(null);
                  setInvestmentAmount('');
                }}
                className="tsf-flex-1 tsf-py-md"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleInvestment}
                disabled={loading || !investmentAmount || parseFloat(investmentAmount) < selectedFund.price}
                className="tsf-flex-1 tsf-py-md tsf-font-medium"
                loading={loading}
              >
                {loading ? 'Processing...' : 'Confirm Investment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default InvestidorDashboard;