import React, { useState } from 'react';
import { authService } from '../services/api';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CONSULTOR' | 'GESTOR' | 'INVESTIDOR'>('INVESTIDOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register({ email, password, role });
      setSuccess(true);
    } catch (err) {
      setError('Failed to register. The email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Registration Successful!</h2>
        <p className="text-gray-600">
          Your account has been created and is now awaiting approval from an administrator.
        </p>
        <p className="text-gray-600">
          You will be notified by email once your account is approved.
        </p>
        <Link to="/login" className="inline-block mt-4 text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Create Account</h2>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Create a password"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">I am a...</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="INVESTIDOR">Investor</option>
          <option value="CONSULTOR">Consultant</option>
          <option value="GESTOR">Manager</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-white rounded-lg bg-primary hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
      >
        {loading ? 'Creating Account...' : 'Register'}
      </button>

      <p className="text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
};

export default RegisterPage;
