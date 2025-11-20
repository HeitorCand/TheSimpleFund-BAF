import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token } = await authService.login({ email, password });
      await login(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Login</h2>
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
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-white rounded-lg bg-primary hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <a href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
};

export default LoginPage;
