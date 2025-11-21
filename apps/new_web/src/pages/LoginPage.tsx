import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { authService } from '../services/api';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const heroImage = '/login.png';

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

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setLoading(true);
    setError('');
    setEmail(testEmail);
    setPassword(testPassword);

    try {
      const { token } = await authService.login({ email: testEmail, password: testPassword });
      await login(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <div
        className="hidden lg:flex flex-[0.65] bg-cover bg-left"
        style={{
          backgroundImage: `url("${heroImage}")`,
        }}
      />

      <div className="flex-1 lg:flex-[0.35] flex items-center justify-center px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-2xl px-4 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-10 px-2 sm:px-4">
            <div>
              <h2 className="text-5xl font-semibold text-gray-900">Login</h2>
            </div>

            {error && <p className="text-red-500 text-base">{error}</p>}

            <div className="space-y-8">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-0 border-b border-gray-300 focus:border-purple-700 focus:ring-0 px-3 py-2 pb-3 text-lg placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-0 border-b border-gray-300 focus:border-purple-700 focus:ring-0 px-3 py-2 pb-3 text-lg placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <button
                type="button"
                className="hover:text-purple-700 transition-colors"
                onClick={() => alert('Please contact support to reset your password.')}
              >
                Forgot your password?
              </button>
              <div className="flex items-center gap-1">
                <span>Don&apos;t have an account?</span>
                <Link to="/register" className="text-purple-700 font-semibold hover:underline">
                  Create one
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white rounded-lg bg-gradient-to-r from-purple-700 to-indigo-600 hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>

            <div className="pt-6 border-t border-gray-200 space-y-3">
              <p className="text-sm text-gray-500">Quick access to test profiles</p>
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => handleTestLogin('gestor@vero.com', '123456')}
                  disabled={loading}
                  className="w-full py-2 text-sm text-purple-800 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 transition-colors"
                >
                  Login as <strong>MANAGER</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestLogin('consultor@vero.com', '123456')}
                  disabled={loading}
                  className="w-full py-2 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  Login as <strong>CONSULTANT</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestLogin('investidor@vero.com', '123456')}
                  disabled={loading}
                  className="w-full py-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                >
                  Login as <strong>INVESTOR</strong>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
