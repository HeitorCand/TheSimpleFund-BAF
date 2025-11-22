import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../utils/errorHandler';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://thesimplefund.onrender.com/api');

const InvestorBadge: React.FC<{ userId: string }> = React.memo(({ userId }) => {
  const [badgeData, setBadgeData] = useState<UserBadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        console.log('Fetching badge data for user:', userId);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_BASE_URL}/badges/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Badge data received:', response.data);
        setBadgeData(response.data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        console.error('Error loading badge:', errorMessage);
        setError(errorMessage);
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
      <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !badgeData) {
    return null;
  }

  const { badge, progress } = badgeData;

  return (
    <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <h4 className="text-lg font-semibold text-white mb-3">
        Investor Badge
      </h4>
      
      <div className="mb-4">
        <p className="text-xs text-gray-300 mb-2">Current Level</p>
        <div 
          className="inline-block px-4 py-2 rounded-lg"
          style={{ 
            backgroundColor: `${badge.color}15`,
            borderLeft: `3px solid ${badge.color}`
          }}
        >
          <span className="text-lg font-semibold" style={{ color: badge.color }}>
            {badge.name}
          </span>
        </div>
      </div>

      {progress.nextBadge && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">
              Progress to {progress.nextBadge}
            </span>
            <span className="text-xs font-medium text-gray-200">
              {Math.round(progress.progressPercentage)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.max(2, progress.progressPercentage)}%`,
                backgroundColor: badge.color
              }}
            />
          </div>
          <p className="text-xs text-gray-300 mt-2">
            {progress.amountToNext.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })} to next level
          </p>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-300 mb-2">Benefits:</p>
        <ul className="space-y-1">
          {badge.benefits && badge.benefits.length > 0 ? (
            badge.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: badge.color }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>{benefit}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-300">No benefits available</li>
          )}
        </ul>
      </div>
    </div>
  );
});

InvestorBadge.displayName = 'InvestorBadge';

export default InvestorBadge;
