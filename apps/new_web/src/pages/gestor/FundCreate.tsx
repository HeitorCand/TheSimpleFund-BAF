import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fundService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/useAuth';
import { useXlmPrice } from '../../hooks/useXlmPrice';

type FundForm = {
  name: string;
  symbol: string;
  maxSupply: string;
  price: string;
  cnpj: string;
  type: 'FIDC' | 'FIDC_NP';
  targetInvestor: 'GERAL' | 'QUALIFICADO' | 'PROFISSIONAL';
  cvmCode: string;
  administratorName: string;
  administratorCnpj: string;
  managerName: string;
  managerCnpj: string;
  custodianName: string;
  auditorName: string;
  fiduciaryAgentName: string;
  strategy: string;
  eligibility: string;
  limitCedente: string;
  limitSacado: string;
  limitSector: string;
  pmt: string;
  risks: string;
  adminFee: string;
  managementFee: string;
  performanceFee: string;
  otherFees: string;
  liquidityType: 'ABERTO' | 'FECHADO' | 'RESTRITO';
  lockupDays: string;
  redemptionTerms: string;
  nav: string;
  aum: string;
  return12m: string;
  returnYtd: string;
  returnSinceInception: string;
  description: string;
};

const FundCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { price: xlmPrice, loading: xlmLoading, error: xlmError } = useXlmPrice();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FundForm>({
    name: '',
    symbol: '',
    maxSupply: '',
    price: '',
    cnpj: '',
    type: 'FIDC',
    targetInvestor: 'PROFISSIONAL',
    cvmCode: '',
    administratorName: '',
    administratorCnpj: '',
    managerName: '',
    managerCnpj: '',
    custodianName: '',
    auditorName: '',
    fiduciaryAgentName: '',
    strategy: '',
    eligibility: '',
    limitCedente: '',
    limitSacado: '',
    limitSector: '',
    pmt: '',
    risks: '',
    adminFee: '',
    managementFee: '',
    performanceFee: '',
    otherFees: '',
    liquidityType: 'FECHADO',
    lockupDays: '',
    redemptionTerms: '',
    nav: '',
    aum: '',
    return12m: '',
    returnYtd: '',
    returnSinceInception: '',
    description: '',
  });

  const handleChange = (field: keyof FundForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMockFill = () => {
    setForm({
      name: 'Fundo Recebíveis Agro',
      symbol: 'FRA',
      maxSupply: '1000000',
      price: '1.00',
      cnpj: '12.345.678/0001-90',
      type: 'FIDC',
      targetInvestor: 'PROFISSIONAL',
      cvmCode: '99999',
      administratorName: 'Admin XYZ',
      administratorCnpj: '11.222.333/0001-44',
      managerName: 'Gestora ABC',
      managerCnpj: '55.666.777/0001-88',
      custodianName: 'Custódia Segura',
      auditorName: 'Auditoria Audit',
      fiduciaryAgentName: 'Agente Fiduciário',
      strategy: 'Multisector focus in agro',
      eligibility: 'Approved assignors; debtors with internal rating min B; registered invoices/receivables.',
      limitCedente: '20',
      limitSacado: '15',
      limitSector: '30',
      pmt: '60',
      risks: 'Credit, concentration, liquidity; mitigated via registration and limits.',
      adminFee: '1.5',
      managementFee: '1.0',
      performanceFee: '10',
      otherFees: 'Custody/registry/audit per regulation',
      liquidityType: 'FECHADO', // value kept for backend
      lockupDays: '0',
      redemptionTerms: 'No redemption; secondary trading only.',
      nav: '1.05',
      aum: '5000000',
      return12m: '12.5',
      returnYtd: '4.2',
      returnSinceInception: '18.3',
    description: 'Multisector receivables fund focused on agro with low default history.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fundService.create({
        name: form.name,
        symbol: form.symbol,
        maxSupply: Number(form.maxSupply),
        price: form.price ? Number(form.price) : undefined,
        cnpj: form.cnpj || undefined,
        fundType: form.type,
        investorProfile: form.targetInvestor,
        cvmCode: form.cvmCode || undefined,
        administratorName: form.administratorName || undefined,
        administratorCnpj: form.administratorCnpj || undefined,
        managerName: form.managerName || undefined,
        managerCnpj: form.managerCnpj || undefined,
        custodianName: form.custodianName || undefined,
        auditorName: form.auditorName || undefined,
        fiduciaryAgentName: form.fiduciaryAgentName || undefined,
        sectorFocus: form.strategy || undefined,
        eligibilityCriteria: form.eligibility || undefined,
        maxCedenteConcentrationPercent: form.limitCedente ? Number(form.limitCedente) : undefined,
        maxSacadoConcentrationPercent: form.limitSacado ? Number(form.limitSacado) : undefined,
        sectorConcentrationPercent: form.limitSector ? Number(form.limitSector) : undefined,
        targetPmt: form.pmt ? Number(form.pmt) : undefined,
        keyRisks: form.risks || undefined,
        administrationFee: form.adminFee ? Number(form.adminFee) : undefined,
        managementFee: form.managementFee ? Number(form.managementFee) : undefined,
        performanceFee: form.performanceFee ? Number(form.performanceFee) : undefined,
        otherFees: form.otherFees || undefined,
        liquidityType: form.liquidityType,
        lockupDays: form.lockupDays ? Number(form.lockupDays) : undefined,
        redemptionTerms: form.redemptionTerms || undefined,
        navPerShare: form.nav ? Number(form.nav) : undefined,
        aum: form.aum ? Number(form.aum) : undefined,
        return12m: form.return12m ? Number(form.return12m) : undefined,
        returnYtd: form.returnYtd ? Number(form.returnYtd) : undefined,
        returnSinceInception: form.returnSinceInception ? Number(form.returnSinceInception) : undefined,
        description: form.description || undefined,
      });
      toast.success('Fund created successfully');
      navigate('/fundos');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'CONSULTOR') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create Fund</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMockFill}
            className="text-sm text-primary border border-primary px-3 py-2 rounded-lg hover:bg-primary/10"
          >
            Fill with mock
          </button>
          <button onClick={() => navigate('/fundos')} className="text-sm text-primary hover:underline">
            Back to funds
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">1) Identification & strategy</h3>
          <p className="text-sm text-gray-500">Fill in basic fund info and strategy focus.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Symbol *</label>
            <input
              type="text"
              value={form.symbol}
              onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Max supply *</label>
            <input
              type="number"
              value={form.maxSupply}
              onChange={(e) => handleChange('maxSupply', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price (USD) *
              <span className="block text-xs text-gray-500">Enter the quota price in USD. XLM equivalent will be estimated.</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
              placeholder="Enter price in USD"
            />
            <p className="text-xs text-gray-600 mt-1">
              {form.price
                ? xlmLoading
                  ? 'Loading XLM price...'
                  : xlmError || !xlmPrice
                    ? 'XLM price unavailable now'
                    : `$${Number(form.price).toLocaleString()} (~ ${(Number(form.price) / xlmPrice).toFixed(4)} XLM)`
                : 'Enter a USD amount to see XLM estimate'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value as FundForm['type'])}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="FIDC">FIDC</option>
              <option value="FIDC_NP">FIDC-NP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Investor *</label>
            <select
              value={form.targetInvestor}
              onChange={(e) => handleChange('targetInvestor', e.target.value as FundForm['targetInvestor'])}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="GERAL">General</option>
              <option value="QUALIFICADO">Qualified</option>
              <option value="PROFISSIONAL">Professional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CVM Code</label>
            <input
              type="text"
              value={form.cvmCode}
              onChange={(e) => handleChange('cvmCode', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Strategy / Sector Focus *</label>
            <input
              type="text"
              value={form.strategy}
              onChange={(e) => handleChange('strategy', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Multisector receivables"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">2) Service providers</h3>
          <p className="text-sm text-gray-500">Administrator, manager, custodian, auditor, fiduciary agent.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Administrator (name)</label>
            <input
              type="text"
              value={form.administratorName}
              onChange={(e) => handleChange('administratorName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Administrator CNPJ</label>
            <input
              type="text"
              value={form.administratorCnpj}
              onChange={(e) => handleChange('administratorCnpj', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Manager (name)</label>
            <input
              type="text"
              value={form.managerName}
              onChange={(e) => handleChange('managerName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Manager CNPJ</label>
            <input
              type="text"
              value={form.managerCnpj}
              onChange={(e) => handleChange('managerCnpj', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Custodian</label>
            <input
              type="text"
              value={form.custodianName}
              onChange={(e) => handleChange('custodianName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Auditor</label>
            <input
              type="text"
              value={form.auditorName}
              onChange={(e) => handleChange('auditorName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fiduciary Agent</label>
            <input
              type="text"
              value={form.fiduciaryAgentName}
              onChange={(e) => handleChange('fiduciaryAgentName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">3) Eligibility & risks</h3>
          <p className="text-sm text-gray-500">Credit eligibility and key risks for investors.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Eligibility criteria (cedente/sacado/credit)</label>
            <textarea
              value={form.eligibility}
              onChange={(e) => handleChange('eligibility', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Key risks (credit/liquidity/concentration)</label>
            <textarea
              value={form.risks}
              onChange={(e) => handleChange('risks', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">4) Concentration limits & tenor</h3>
          <p className="text-sm text-gray-500">Limits per assignor/debtor/sector and PMT/PMH.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">% Limit per Cedente</label>
            <input
              type="number"
              value={form.limitCedente}
              onChange={(e) => handleChange('limitCedente', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., 20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">% Limit per Sacado</label>
            <input
              type="number"
              value={form.limitSacado}
              onChange={(e) => handleChange('limitSacado', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">% Limit per Sector</label>
            <input
              type="number"
              value={form.limitSector}
              onChange={(e) => handleChange('limitSector', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">PMT/PMH (days)</label>
            <input
              type="number"
              value={form.pmt}
              onChange={(e) => handleChange('pmt', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., 60"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">5) Fees</h3>
          <p className="text-sm text-gray-500">Mandatory fees and other relevant charges.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin fee (% a.a.)</label>
            <input
              type="number"
              step="0.01"
              value={form.adminFee}
              onChange={(e) => handleChange('adminFee', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Management fee (% a.a.)</label>
            <input
              type="number"
              step="0.01"
              value={form.managementFee}
              onChange={(e) => handleChange('managementFee', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Performance fee (% over benchmark)</label>
            <input
              type="number"
              step="0.01"
              value={form.performanceFee}
              onChange={(e) => handleChange('performanceFee', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Other fees</label>
            <input
              type="text"
              value={form.otherFees}
              onChange={(e) => handleChange('otherFees', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Custody, registry, audit..."
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">6) Liquidity</h3>
          <p className="text-sm text-gray-500">Liquidity type, lockup, and redemption terms.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Liquidity type</label>
            <select
              value={form.liquidityType}
              onChange={(e) => handleChange('liquidityType', e.target.value as FundForm['liquidityType'])}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="ABERTO">Open</option>
              <option value="FECHADO">Closed</option>
              <option value="RESTRITO">Restricted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lockup (days)</label>
            <input
              type="number"
              value={form.lockupDays}
              onChange={(e) => handleChange('lockupDays', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Redemption terms</label>
            <input
              type="text"
              value={form.redemptionTerms}
              onChange={(e) => handleChange('redemptionTerms', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ex.: D+30, sem resgate"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">7) Indicators</h3>
          <p className="text-sm text-gray-500">NAV, AUM, and returns for investor exposure.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">NAV (per share)</label>
            <input
              type="number"
              step="0.01"
              value={form.nav}
              onChange={(e) => handleChange('nav', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">AUM / PL</label>
            <input
              type="number"
              step="0.01"
              value={form.aum}
              onChange={(e) => handleChange('aum', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Return 12m (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.return12m}
              onChange={(e) => handleChange('return12m', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Return YTD (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.returnYtd}
              onChange={(e) => handleChange('returnYtd', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Return since inception (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.returnSinceInception}
              onChange={(e) => handleChange('returnSinceInception', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Short description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Fund focus, risk highlights, track record summary"
          />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Fund'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FundCreate;
