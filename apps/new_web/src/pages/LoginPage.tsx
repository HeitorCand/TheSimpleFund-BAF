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

  const inputBase =
    'w-full rounded-lg px-3 py-3 bg-white/5 border border-white/15 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#169976] focus:border-transparent transition';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] bg-[radial-gradient(circle_at_top,_#134e4a_0,_#020617_55%,_#020617_100%)] text-white">
      {/* Hero topo (mobile) / lateral (desktop) */}
      <div className="w-full h-40 sm:h-56 lg:h-auto lg:flex-[0.6] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#020617]/40 to-transparent" />
      </div>

      {/* Bloco do formulário */}
      <div className="flex-1 lg:flex-[0.4] flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-14 py-8 lg:py-0">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-emerald-300">
                  The Simple Fund
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Sign in
                </h2>
                <p className="text-xs sm:text-sm text-white/70">
                  Access your receivables operations dashboard.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Campos */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1 tracking-wide uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputBase}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1 tracking-wide uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputBase}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Link register */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <span>Don&apos;t have an account?</span>
                  <Link
                    to="/register"
                    className="text-emerald-300 font-semibold hover:text-emerald-200 hover:underline underline-offset-4 transition"
                  >
                    Create one
                  </Link>
                </div>
              </div>

              {/* Botão principal */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-medium rounded-2xl bg-white text-black hover:opacity-90 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in…' : 'Sign in'}
              </button>

              {/* Acesso rápido – perfis de teste */}
              <div className="pt-5 border-t border-white/10 space-y-3">
                <p className="text-[11px] sm:text-xs text-white/60">
                  Quick access to test profiles
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleTestLogin('gestor@vero.com', '123456')}
                    disabled={loading}
                    className="w-full py-2.5 text-xs sm:text-sm rounded-xl bg-white/5 border border-white/15 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Login as <span className="font-semibold">MANAGER</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestLogin('consultor@vero.com', '123456')}
                    disabled={loading}
                    className="w-full py-2.5 text-xs sm:text-sm rounded-xl bg-white/5 border border-white/15 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Login as <span className="font-semibold">CONSULTANT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestLogin('investidor@vero.com', '123456')}
                    disabled={loading}
                    className="w-full py-2.5 text-xs sm:text-sm rounded-xl bg-white/5 border border-white/15 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Login as <span className="font-semibold">INVESTOR</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} The Simple Fund
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
