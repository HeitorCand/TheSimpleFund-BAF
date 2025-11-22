import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import api from '../../services/api';

interface BadgeInfo {
  badge: string;
  name: string;
  minAmount: number;
  color: string;
  icon: string;
  benefits: string[];
  hasProof: boolean;
}

interface BadgeProgress {
  currentBadge: string;
  nextBadge: string | null;
  progressPercentage: number;
  amountToNext: number;
}

interface UserBadgeData {
  user: {
    id: string;
    email: string;
    totalInvested: number;
    lastBadgeUpdate: string | null;
  };
  badge: BadgeInfo;
  progress: BadgeProgress;
}

const InvestorBadge: React.FC<{ userId: string }> = ({ userId }) => {
  const [badgeData, setBadgeData] = useState<UserBadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        console.log('Fetching badge data for user:', userId);
        const response = await api.get(`/badges/${userId}`);
        console.log('Badge data received:', response.data);
        setBadgeData(response.data);
      } catch (error: unknown) {
        console.error('Error loading badge:', error);
        const err = error as { response?: { data?: unknown }; message?: string };
        console.error('Error details:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBadgeData();
    } else {
      console.warn('No userId provided to InvestorBadge component');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="tsf-badge-card tsf-p-md">
        <div className="tsf-flex tsf-items-center tsf-justify-center tsf-py-xl">
          <div className="tsf-spinner"></div>
        </div>
      </Card>
    );
  }

  if (!badgeData) {
    return null;
  }

  const { badge, progress } = badgeData;

  return (
    <>
      <Card className="tsf-badge-card tsf-p-md">
        <div className="tsf-flex tsf-items-start tsf-gap-md">
        {/* Badge Icon */}
        <div 
          className="tsf-badge-icon-large"
          style={{ 
            backgroundColor: `${badge.color}20`,
            color: badge.color
          }}
        >
          <span className="tsf-text-3xl">{badge.icon}</span>
        </div>

        {/* Badge Info */}
        <div className="tsf-flex-1">
          <div className="tsf-flex tsf-items-center tsf-justify-between tsf-mb-sm">
            <div>
              <h4 className="tsf-text-lg tsf-font-medium tsf-mb-xs">
                Investor Badge
              </h4>
              <p className="tsf-text-sm tsf-text-secondary">
                Current Level
              </p>
            </div>
            {badge.hasProof && (
              <div className="tsf-badge-verified" title="Verified with ZK Proof">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Current Badge */}
          <div 
            className="tsf-badge-level tsf-mb-md tsf-p-sm tsf-rounded"
            style={{ 
              backgroundColor: `${badge.color}15`,
              borderLeft: `3px solid ${badge.color}`
            }}
          >
            <div className="tsf-flex tsf-items-center tsf-gap-sm">
              <span className="tsf-text-xl">{badge.icon}</span>
              <span className="tsf-text-base tsf-font-medium" style={{ color: badge.color }}>
                {badge.name}
              </span>
            </div>
          </div>

          {/* Progress to Next Badge */}
          {progress.nextBadge && (
            <div className="tsf-badge-progress tsf-mb-md">
              <div className="tsf-flex tsf-items-center tsf-justify-between tsf-mb-xs">
                <span className="tsf-text-xs tsf-text-secondary">
                  Progress to {progress.nextBadge}
                </span>
                <span className="tsf-text-xs tsf-font-medium">
                  {progress.progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="tsf-progress-bar-container">
                <div 
                  className="tsf-progress-bar-fill"
                  style={{ 
                    width: `${progress.progressPercentage}%`,
                    backgroundColor: badge.color
                  }}
                />
              </div>
              <p className="tsf-text-xs tsf-text-secondary tsf-mt-xs">
                {progress.amountToNext.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })} to next level
              </p>
            </div>
          )}

          {progress.nextBadge === null && (
            <div className="tsf-badge-max-level tsf-p-sm tsf-rounded tsf-mb-md" style={{ backgroundColor: `${badge.color}10` }}>
              <p className="tsf-text-xs tsf-font-medium" style={{ color: badge.color }}>
                🏆 Maximum level reached!
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="tsf-badge-benefits">
            <p className="tsf-text-xs tsf-font-medium tsf-mb-xs tsf-text-secondary">Benefits:</p>
            <ul className="tsf-benefits-list">
              {badge.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="tsf-text-xs tsf-text-secondary tsf-flex tsf-items-start tsf-gap-xs tsf-mb-xs">
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="tsf-mt-xs"
                    style={{ color: badge.color }}
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {badge.benefits.length > 3 && (
              <button className="tsf-text-xs tsf-text-primary tsf-mt-xs">
                +{badge.benefits.length - 3} more benefits
              </button>
            )}
          </div>
        </div>
        </div>
      </Card>

      <style>{`
        .tsf-badge-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,1) 100%);
        }
        
        .tsf-badge-icon-large {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          flex-shrink: 0;
        }
        
        .tsf-badge-verified {
          color: #10b981;
          background: #10b98120;
          padding: 4px 8px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .tsf-progress-bar-container {
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .tsf-progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .tsf-benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default InvestorBadge;
