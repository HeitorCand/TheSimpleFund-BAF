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
    <div className="min-h-screen flex bg-dark text-gray-200">
      <div
        className="hidden lg:flex flex-[0.65] bg-cover bg-left"
        style={{
          backgroundImage: `url("${heroImage}")`,
        }}
      />

      <div className="flex-1 lg:flex-[0.35] flex items-center justify-center px-6 lg:px-10 xl:px-14">
        <div className="w-full max-w-2xl px-3 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-8 px-2 sm:px-3">
            <div>
              <h2 className="text-4xl sm:text-5xl font-semibold text-white">Login</h2>
            </div>

            {error && <p className="text-red-500 text-base">{error}</p>}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-dark-200 border border-gray-600 rounded-lg px-3 py-3 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-dark-200 border border-gray-600 rounded-lg px-3 py-3 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span>Don&apos;t have an account?</span>
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Create one
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white rounded-lg bg-primary hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>

            <div className="pt-6 border-t border-gray-700 space-y-3">
              <p className="text-sm text-gray-400">Quick access to test profiles</p>
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => handleTestLogin('gestor@vero.com', '123456')}
                  disabled={loading}
                  className="w-full py-2 text-sm text-primary-700 bg-primary-100 border border-primary-200 rounded-lg hover:bg-primary-200 disabled:opacity-50 transition-colors"
                >
                  Login as <strong>MANAGER</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestLogin('consultor@vero.com', '123456')}
                  disabled={loading}
                  className="w-full py-2 text-sm text-primary-700 bg-primary-100 border border-primary-200 rounded-lg hover:bg-primary-200 disabled:opacity-50 transition-colors"
                >
                  Login as <strong>CONSULTANT</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestLogin('investidor@vero.com', '123456')}
                  disabled={loading}
                  className="w-full py-2 text-sm text-primary-700 bg-primary-100 border border-primary-200 rounded-lg hover:bg-primary-200 disabled:opacity-50 transition-colors"
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
