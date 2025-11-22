import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fundService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import InvestmentModal from '../../components/InvestmentModal';

interface Fund {
  id: string;
  name: string;
  symbol?: string;
  cnpj?: string;
  fundType?: string;
  investorProfile?: string;
  cvmCode?: string;
  administratorName?: string;
  administratorCnpj?: string;
  managerName?: string;
  managerCnpj?: string;
  custodianName?: string;
  auditorName?: string;
  fiduciaryAgentName?: string;
  sectorFocus?: string;
  eligibilityCriteria?: string;
  maxCedenteConcentrationPercent?: number;
  maxSacadoConcentrationPercent?: number;
  sectorConcentrationPercent?: number;
  targetPmt?: number;
  keyRisks?: string;
  administrationFee?: number;
  managementFee?: number;
  performanceFee?: number;
  otherFees?: string;
  liquidityType?: string;
  lockupDays?: number;
  redemptionTerms?: string;
  navPerShare?: number;
  aum?: number;
  return12m?: number;
  returnYtd?: number;
  returnSinceInception?: number;
  description?: string;
  price?: number;
  maxSupply?: number;
  totalIssued?: number;
  status?: string;
}

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text-gray-500 font-semibold">{label}</p>
    <p className="text-sm text-gray-900">{value ?? 'N/A'}</p>
  </div>
);

const FundDetail: React.FC = () => {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fund, setFund] = useState<Fund | null>(null);
  const [showInvest, setShowInvest] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!fundId) return;
      setLoading(true);
      try {
        const response = await fundService.getById(fundId);
        const resolvedFund = response.fund || response;
        setFund(resolvedFund);
        setSelectedFund(resolvedFund);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fundId]);

  if (loading) return <div className="p-8 text-center">Loading fund...</div>;
  if (!fund) return <div className="p-8 text-center text-gray-600">Fund not found.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft space-y-6 relative">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{fund.name}</h1>
          <p className="text-sm text-gray-600">{fund.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/marketplace')} className="text-primary text-sm hover:underline">
            Back to marketplace
          </button>
          {fund && (
            <button
              onClick={() => {
                setSelectedFund(fund);
                setShowInvest(true);
              }}
              className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90"
            >
              Invest Now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="CNPJ" value={fund.cnpj} />
        <Field label="Type" value={fund.fundType} />
        <Field label="Target investor" value={fund.investorProfile} />
        <Field label="CVM code" value={fund.cvmCode} />
        <Field label="Status" value={fund.status} />
        <Field label="Price" value={fund.price ? `$${fund.price.toLocaleString()}` : undefined} />
        <Field label="NAV (per share)" value={fund.navPerShare ? `$${fund.navPerShare}` : undefined} />
        <Field label="AUM / PL" value={fund.aum ? `$${fund.aum.toLocaleString()}` : undefined} />
        <Field label="Return 12m" value={fund.return12m ? `${fund.return12m}%` : undefined} />
        <Field label="Return YTD" value={fund.returnYtd ? `${fund.returnYtd}%` : undefined} />
        <Field label="Return since inception" value={fund.returnSinceInception ? `${fund.returnSinceInception}%` : undefined} />
        <Field
          label="Issued / Max"
          value={
            typeof fund.totalIssued === 'number' && typeof fund.maxSupply === 'number'
              ? `${fund.totalIssued.toLocaleString()} / ${fund.maxSupply.toLocaleString()}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Service providers</h3>
          <Field label="Administrator" value={fund.administratorName} />
          <Field label="Administrator CNPJ" value={fund.administratorCnpj} />
          <Field label="Manager" value={fund.managerName} />
          <Field label="Manager CNPJ" value={fund.managerCnpj} />
          <Field label="Custodian" value={fund.custodianName} />
          <Field label="Auditor" value={fund.auditorName} />
          <Field label="Fiduciary agent" value={fund.fiduciaryAgentName} />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Policy & limits</h3>
          <Field label="Strategy / Sector focus" value={fund.sectorFocus} />
          <Field label="Eligibility" value={fund.eligibilityCriteria} />
          <Field label="% limit per cedente" value={fund.maxCedenteConcentrationPercent} />
          <Field label="% limit per sacado" value={fund.maxSacadoConcentrationPercent} />
          <Field label="% limit per sector" value={fund.sectorConcentrationPercent} />
          <Field label="PMT/PMH (days)" value={fund.targetPmt} />
          <Field label="Key risks" value={fund.keyRisks} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Fees</h3>
          <Field label="Admin fee (% a.a.)" value={fund.administrationFee} />
          <Field label="Management fee (% a.a.)" value={fund.managementFee} />
          <Field label="Performance fee (%)" value={fund.performanceFee} />
          <Field label="Other fees" value={fund.otherFees} />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Liquidity</h3>
          <Field label="Type" value={fund.liquidityType} />
          <Field label="Lockup (days)" value={fund.lockupDays} />
          <Field label="Redemption terms" value={fund.redemptionTerms} />
        </div>
      </div>

      {showInvest && selectedFund && (
        <InvestmentModal
          fund={selectedFund as any}
          onClose={() => {
            setShowInvest(false);
            setSelectedFund(null);
          }}
          onConfirm={() => setShowInvest(false)}
        />
      )}
    </div>
  );
};

export default FundDetail;
