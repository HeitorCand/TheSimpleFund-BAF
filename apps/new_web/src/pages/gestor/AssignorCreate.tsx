import React, { useState } from 'react';
import { useNavigate, Navigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cedenteService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/useAuth';

type AssignorForm = {
  name: string;
  fantasyName: string;
  document: string;
  cnae: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  beneficialOwners: string;
  isPep: 'no' | 'yes';
  revenueLast12m: string;
  totalDebt: string;
  mainBanks: string;
  riskRating: string;
  operationDescription: string;
  creditPolicy: string;
  guarantees: string;
  fundId: string;
};

const AssignorCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useParams<{ fundId?: string }>();
  const [searchParams] = useSearchParams();
  const initialFundId = searchParams.get('fundId') || params.fundId || '';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AssignorForm>({
    name: '',
    fantasyName: '',
    document: '',
    cnae: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'BR',
    postalCode: '',
    beneficialOwners: '',
    isPep: 'no',
    revenueLast12m: '',
    totalDebt: '',
    mainBanks: '',
    riskRating: '',
    operationDescription: '',
    creditPolicy: '',
    guarantees: '',
    fundId: initialFundId,
  });

  const handleChange = (field: keyof AssignorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cedenteService.create({
        name: form.name,
        fantasyName: form.fantasyName,
        document: form.document,
        cnae: form.cnae,
        email: form.email,
        phone: form.phone,
        website: form.website,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        beneficialOwners: form.beneficialOwners,
        isPep: form.isPep === 'yes',
        revenueLast12m: form.revenueLast12m ? Number(form.revenueLast12m) : undefined,
        totalDebt: form.totalDebt ? Number(form.totalDebt) : undefined,
        mainBanks: form.mainBanks,
        riskRating: form.riskRating,
        operationDescription: form.operationDescription,
        creditPolicy: form.creditPolicy,
        guarantees: form.guarantees,
        fundId: form.fundId || undefined,
      });
      toast.success('Assignor created successfully');
      navigate('/assignors');
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
      name: 'Assignor Agro Ltda',
      fantasyName: 'Assignor Agro',
      document: '12.345.678/0001-90',
      cnae: '0111-3/01',
      email: 'contact@assignoragro.com',
      phone: '+1 555-9999-9999',
      website: 'https://assignoragro.com',
      address: '123 Flower St',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      postalCode: '01000-000',
      beneficialOwners: 'John Doe; Mary Smith',
      isPep: 'no',
      revenueLast12m: '5000000',
      totalDebt: '2000000',
      mainBanks: 'Bank X; Bank Y',
      riskRating: 'BBB-',
      operationDescription: 'Supply of agricultural inputs',
      creditPolicy: 'Debtors with internal rating min B, registered invoices',
      guarantees: 'Recourse; credit insurance',
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create Assignor</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMock}
            className="text-sm text-primary border border-primary px-3 py-2 rounded-lg hover:bg-primary/10"
          >
            Fill with mock
          </button>
          <button onClick={() => navigate('/assignors')} className="text-sm text-primary hover:underline">
            Back to assignors
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">1) Identification & KYC</h3>
          <p className="text-sm text-gray-500">Basic assignor info and regulatory identification.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Legal name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Trade name</label>
            <input
              type="text"
              value={form.fantasyName}
              onChange={(e) => handleChange('fantasyName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ *</label>
            <input
              type="text"
              value={form.document}
              onChange={(e) => handleChange('document', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CNAE / Activity</label>
            <input
              type="text"
              value={form.cnae}
              onChange={(e) => handleChange('cnae', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">2) Contact & address</h3>
          <p className="text-sm text-gray-500">Contact and location information.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
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
          <h3 className="text-lg font-semibold text-gray-800">3) Compliance</h3>
          <p className="text-sm text-gray-500">Beneficial owners and PEP.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Controllers / Beneficial owners (text)</label>
            <textarea
              value={form.beneficialOwners}
              onChange={(e) => handleChange('beneficialOwners', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">PEP?</label>
            <select
              value={form.isPep}
              onChange={(e) => handleChange('isPep', e.target.value as AssignorForm['isPep'])}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">4) Finance & risk</h3>
          <p className="text-sm text-gray-500">Revenue, debt, and rating.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Revenue last 12m</label>
            <input
              type="number"
              value={form.revenueLast12m}
              onChange={(e) => handleChange('revenueLast12m', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Total debt</label>
            <input
              type="number"
              value={form.totalDebt}
              onChange={(e) => handleChange('totalDebt', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Main banks</label>
            <input
              type="text"
              value={form.mainBanks}
              onChange={(e) => handleChange('mainBanks', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Risk rating</label>
            <input
              type="text"
              value={form.riskRating}
              onChange={(e) => handleChange('riskRating', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </section>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">5) Operation & guarantees</h3>
          <p className="text-sm text-gray-500">Describe credit origination, credit policy, and guarantees.</p>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Operation description</label>
            <textarea
              value={form.operationDescription}
              onChange={(e) => handleChange('operationDescription', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Credit policy to debtors</label>
            <textarea
              value={form.creditPolicy}
              onChange={(e) => handleChange('creditPolicy', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Guarantees offered</label>
            <textarea
              value={form.guarantees}
              onChange={(e) => handleChange('guarantees', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
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
            {loading ? 'Saving...' : 'Create Assignor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignorCreate;
