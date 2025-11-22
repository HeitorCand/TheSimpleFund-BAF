import React, { useState } from 'react';
import { useNavigate, Navigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sacadoService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/useAuth';

type DebtorForm = {
  name: string;
  document: string;
  personType: 'PF' | 'PJ';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  sector: string;
  size: string;
  rating: string;
  paymentHistory: string;
  exposure: string;
  creditLimitFund: string;
  concentrationPercent: string;
  defaultRate30d: string;
  defaultRate60d: string;
  defaultRate90d: string;
  fundId: string;
};

const DebtorCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useParams<{ fundId?: string }>();
  const [searchParams] = useSearchParams();
  const initialFundId = searchParams.get('fundId') || params.fundId || '';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<DebtorForm>({
    name: '',
    document: '',
    personType: 'PJ',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'BR',
    postalCode: '',
    sector: '',
    size: '',
    rating: '',
    paymentHistory: '',
    exposure: '',
    creditLimitFund: '',
    concentrationPercent: '',
    defaultRate30d: '',
    defaultRate60d: '',
    defaultRate90d: '',
    fundId: initialFundId,
  });

  const handleChange = (field: keyof DebtorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sacadoService.create({
        name: form.name,
        document: form.document,
        personType: form.personType,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        sector: form.sector,
        size: form.size,
        rating: form.rating,
        paymentHistory: form.paymentHistory,
        exposure: form.exposure ? Number(form.exposure) : undefined,
        creditLimitFund: form.creditLimitFund ? Number(form.creditLimitFund) : undefined,
        concentrationPercent: form.concentrationPercent ? Number(form.concentrationPercent) : undefined,
        defaultRate30d: form.defaultRate30d ? Number(form.defaultRate30d) : undefined,
        defaultRate60d: form.defaultRate60d ? Number(form.defaultRate60d) : undefined,
        defaultRate90d: form.defaultRate90d ? Number(form.defaultRate90d) : undefined,
        fundId: form.fundId || undefined,
      });
      toast.success('Debtor created successfully');
      navigate('/debtors');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'CONSULTOR') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleMock = () => {
    setForm((prev) => ({
      ...prev,
      name: 'Sacado Tech SA',
      document: '98.765.432/0001-10',
      personType: 'PJ',
      email: 'finance@debtor-tech.com',
      phone: '+1 555-8888-8888',
      address: '1000 Paulista Ave',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      postalCode: '01310-000',
      sector: 'Technology',
      size: 'Mid-size',
      rating: 'A-',
      paymentHistory: 'Good history, no recent delays',
      exposure: '200000',
      creditLimitFund: '500000',
      concentrationPercent: '10',
      defaultRate30d: '0.5',
      defaultRate60d: '0.3',
      defaultRate90d: '0.1',
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create Debtor</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMock}
            className="text-sm text-primary border border-primary px-3 py-2 rounded-lg hover:bg-primary/10"
          >
            Fill with mock
          </button>
          <button onClick={() => navigate('/debtors')} className="text-sm text-primary hover:underline">
            Back to debtors
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">1) Identificação</h3>
          <p className="text-sm text-gray-500">Dados básicos do sacado (devedor).</p>
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document (CNPJ/CPF) *</label>
            <input
              type="text"
              value={form.document}
              onChange={(e) => handleChange('document', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Person type</label>
            <select
              value={form.personType}
              onChange={(e) => handleChange('personType', e.target.value as DebtorForm['personType'])}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="PJ">PJ</option>
              <option value="PF">PF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sector</label>
            <input
              type="text"
              value={form.sector}
              onChange={(e) => handleChange('sector', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Size</label>
            <input
              type="text"
              value={form.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="ME, EPP, Média, Grande..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
            <input
              type="text"
              value={form.rating}
              onChange={(e) => handleChange('rating', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">2) Contato e endereço</h3>
          <p className="text-sm text-gray-500">Informações de contato e localização.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="City"
            />
            <input
              type="text"
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="State"
            />
            <input
              type="text"
              value={form.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Country"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Postal code</label>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">3) Risk & exposure</h3>
          <p className="text-sm text-gray-500">Payment history, limits, and delinquency.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">History / notes</label>
            <textarea
              value={form.paymentHistory}
              onChange={(e) => handleChange('paymentHistory', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder="Payment history with cedente, risk notes"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Exposure (value in fund)</label>
            <input
              type="number"
              value={form.exposure}
              onChange={(e) => handleChange('exposure', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">4) Limits & concentration</h3>
          <p className="text-sm text-gray-500">Define exposure, limits, and max concentration.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Credit limit in fund</label>
            <input
              type="number"
              value={form.creditLimitFund}
              onChange={(e) => handleChange('creditLimitFund', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">% Concentration allowed</label>
            <input
              type="number"
              value={form.concentrationPercent}
              onChange={(e) => handleChange('concentrationPercent', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Default rate 30d (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.defaultRate30d}
              onChange={(e) => handleChange('defaultRate30d', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Default rate 60d (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.defaultRate60d}
              onChange={(e) => handleChange('defaultRate60d', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Default rate 90d (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.defaultRate90d}
              onChange={(e) => handleChange('defaultRate90d', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.fundId && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fund ID (auto)</label>
              <input
                type="text"
                value={form.fundId}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
              />
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Create Debtor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DebtorCreate;
