import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, Briefcase, Lock, Sliders, TrendingUp } from 'lucide-react';
import logoTSF from './img/TSF.svg';
import backgroundImage from './img/background-ofc.svg';
import backgroundMobile from './img/background-mobile-new.svg';
import infrastructureImage from './img/image-pattern.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState<string>(backgroundImage);

  useEffect(() => {
    const updateBackground = () => {
      if (window.innerWidth < 768) {
        setBgImage(backgroundMobile);   // mobile
      } else {
        setBgImage(backgroundImage);    // desktop
      }
    };

    // chama na montagem
    updateBackground();

    // escuta resize
    window.addEventListener('resize', updateBackground);
    return () => window.removeEventListener('resize', updateBackground);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#9E9E9E] relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Header */}
      <header className="max-w-[1200px] mx-auto px-[40px] pt-[40px]">
        <img src={logoTSF} alt="TSF" className="h-[40px]" />
      </header>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-[40px] pt-[60px] pb-[150px]">
        <div className="max-w-[700px]">
          <h1 className="text-[48px] leading-[1.1] mb-5 text-white font-bold">
            Do not wait.
            <br />
            <span className="bg-[#169976] text-black px-4 py-1 inline-block">Unlock liquidity.</span>
          </h1>
          <p className="text-[16px] leading-[1.6] mb-[30px] text-white opacity-80 max-w-[500px]">
            Transform receivables operations with{' '}
            <span className="font-bold">automated, transparent, on-chain workflows.</span>
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-black px-8 py-[14px] rounded-[24px] text-[14px] font-medium transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:opacity-90 hover:scale-105 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          >
            Explore the Platform
          </button>
        </div>
      </section>


      {/* Features Section - 3 Cards */}
<section className="max-w-[1200px] mx-auto px-[40px] lg:px-[40px] md:px-[24px] pb-[140px]">
  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
    {/* Feature Card 1 */}
    <div className="bg-white/[0.08] md:bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.18] rounded-2xl p-[40px_32px] min-h-[280px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:translate-y-[-4px]">
      <div className="mb-6">
        <FileText size={48} className="text-white opacity-80" />
      </div>
      <h3 className="text-[20px] leading-[1.3] mb-4 text-white font-bold">
        Accelerate liquidity with on-chain fund shares
      </h3>
      <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-6 flex-grow">
        Access transparent on-chain fund shares with automated distributions and real-time visibility.
      </p>
      <button 
        onClick={() => navigate('/login')}
        className="bg-[#222222] text-white px-7 py-3 rounded-[20px] text-[13px] font-medium w-fit transition-all duration-300 hover:opacity-90 hover:scale-105"
      >
        I am an Investor
      </button>
    </div>

    {/* Feature Card 2 */}
    <div className="bg-white/[0.08] md:bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.18] rounded-2xl p-[40px_32px] min-h-[280px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:translate-y-[-4px]">
      <div className="mb-6">
        <Building2 size={48} className="text-white opacity-80" />
      </div>
      <h3 className="text-[20px] leading-[1.3] mb-4 text-white font-bold">
        Decentralized operations with automated reconciliation
      </h3>
      <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-6 flex-grow">
        Receivables are automatically registered and distributed according to rules, eliminating manual reconciliation.
      </p>
      <button 
        onClick={() => navigate('/login')}
        className="bg-[#222222] text-white px-7 py-3 rounded-[20px] text-[13px] font-medium w-fit transition-all duration-300 hover:opacity-90 hover:scale-105"
      >
        I am a Fund Manager
      </button>
    </div>

    {/* Feature Card 3 */}
    <div className="bg-white/[0.08] md:bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.18] rounded-2xl p-[40px_32px] min-h-[280px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:translate-y-[-4px]">
      <div className="mb-6">
        <Briefcase size={48} className="text-white opacity-80" />
      </div>
      <h3 className="text-[20px] leading-[1.3] mb-4 text-white font-bold">
        Full regulatory compliance and transparency
      </h3>
      <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-6 flex-grow">
        Register assignors and debtors with full compliance, transparency, and significantly reduced onboarding friction.
      </p>
      <button 
        onClick={() => navigate('/login')}
        className="bg-[#222222] text-white px-7 py-3 rounded-[20px] text-[13px] font-medium w-fit transition-all duration-300 hover:opacity-90 hover:scale-105"
      >
        I am a Consultant
      </button>
    </div>
  </div>
</section>


      {/* How It Works Section - Left Aligned, 1/3 width */}
<section className="max-w-[1200px] mx-auto px-[24px] md:px-[24px] pb-[160px]">
  {/* wrapper com fundo só no mobile */}
  <div
    className="
      max-w-[400px]
      bg-[#03241C]/95 rounded-2xl px-4 py-5
      md:bg-transparent md:rounded-none md:px-0 md:py-0
    "
  >
    <h2 className="text-[38px] md:text-[36px] leading-[1.1] mb-6 text-white font-bold">
      How
      <br />
      <span className="bg-[#169976] text-black px-3 py-1 inline-block">
        It Works?
      </span>
    </h2>

    <div className="mb-8">
      <p className="text-[14px] md:text-[15px] leading-[1.6] text-white md:opacity-85 mb-4">
        The Simple Fund brings receivables fund infrastructure on-chain,
        unlocking secondary liquidity and automated distribution.
      </p>
      <p className="text-[14px] md:text-[15px] leading-[1.6] text-white md:opacity-85">
        Instead of being locked until maturity, investors hold tokenized
        shares that can be traded on DEX with real-time visibility.
      </p>
    </div>

    {/* ================== DESKTOP / TABLET ================== */}
    <div className="hidden md:block">
      {/* Gráfico - Investor Liquidity (vertical) */}
      <div className="bg-white/[0.05] backdrop-blur-[8px] border border-white/[0.12] rounded-2xl p-6 mb-8">
        <div className="flex items-end justify-center gap-8 h-[240px] relative">
          {/* Label Liquidity */}
          <div className="absolute top-0 right-4 bg-emerald-400/30 px-3 py-1 rounded-lg">
            <span className="text-white font-bold text-xs">
              Investor Liquidity Index
            </span>
          </div>

          {/* Eixo Y */}
          <div className="flex flex-col justify-between h-full text-white text-[10px] font-medium absolute left-0">
            <div>100</div>
            <div>80</div>
            <div>60</div>
            <div>40</div>
            <div>20</div>
            <div>0</div>
          </div>

          {/* Barras */}
          <div className="flex items-end gap-8 h-full ml-10">
            {/* Barra 1 - Modelo Tradicional */}
            <div className="flex flex-col items-center justify-end h-full">
              <div className="text-white text-[11px] font-semibold mb-1">
                20
              </div>
              <div
                className="bg-slate-700 w-[70px] rounded-t-lg flex items-center justify-center"
                style={{ height: '28%' }} // índice ~20
              >
                <div className="text-white text-[9px] font-medium text-center leading-tight px-1">
                  Fund
                  <br />
                  Traditional
                  <br />
                  Off-chain
                </div>
              </div>
              <div className="text-white text-[11px] mt-2 text-center">
                Low liquidity
                <br />
                Almost no time-out
              </div>
            </div>

            {/* Barra 2 - Com The Simple Fund */}
            <div className="flex flex-col items-center justify-end h-full">
              <div className="text-white text-[11px] font-semibold mb-1">
                78
              </div>
              <div
                className="bg-emerald-400 w-[70px] rounded-t-lg flex items-center justify-center"
                style={{ height: '60%' }} // índice ~78
              >
                <div className="text-white text-[9px] font-medium text-center leading-tight px-1">
                  With
                  <br />
                  The Simple
                  <br />
                  Fund
                </div>
              </div>
              <div className="text-white text-[11px] mt-2 text-center">
                High liquidity
                <br />
                tokenized &amp; DEX
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Texto ponte */}
      <p className="text-[13px] md:text-[14px] text-white/80 mb-6">
        In other words, The Simple Fund not only increases investor liquidity,
        it also gives the manager much more visibility and control over the
        entire receivables flow.
      </p>

      {/* Gráfico - Manager Control Index (horizontal) */}
      <div className="bg-white/[0.05] backdrop-blur-[8px] border border-white/[0.20] rounded-2xl p-6 mb-8">
        <div className="relative flex flex-col gap-6">
          {/* Label topo direita */}
          <div className="absolute top-0 right-4 bg-emerald-400/30 px-3 py-1 rounded-lg">
            <span className="text-white font-bold text-xs">
              Manager Control Index
            </span>
          </div>

          {/* Escala 0–100 */}
          <div className="mt-10">
            <div className="flex items-center justify-between text-[10px] text-white/70 mb-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            <div className="w-full h-[2px] bg-white/10 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-2 bg-white/30" />
              <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[1px] h-2 bg-white/30" />
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-[1px] h-2 bg-white/30" />
              <div className="absolute left-3/4 top-1/2 -translate-y-1/2 w-[1px] h-2 bg-white/30" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-2 bg-white/30" />
            </div>
          </div>

          {/* Linha 1 - Fundo Tradicional */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-white text-[11px] font-semibold">
                Traditional Fund Off-chain
              </span>
              <span className="text-white text-[11px] font-semibold">
                30 / 100
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-700 transition-all duration-500"
                style={{ width: '30%' }} // controle baixo
              />
            </div>
            <p className="text-white/80 text-[11px] mt-1">
              Low control: fragmented onboarding, spreadsheets and manual
              reconciliation.
            </p>
          </div>

          {/* Linha 2 - Com The Simple Fund */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-white text-[11px] font-semibold">
                With The Simple Fund
              </span>
              <span className="text-white text-[11px] font-semibold">
                90 / 100
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: '90%' }} // controle alto
              />
            </div>
            <p className="text-white/80 text-[11px] mt-1">
              High control: on-chain register, approval trail and real-time
              dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* ================== MOBILE ================== */}
    <div className="block md:hidden space-y-4 mb-8">
      {/* Card 1 - Investor Liquidity (mobile) */}
      <div className="bg-[#0A4436]/90 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/70">
            Investor Liquidity Index
          </span>
          <span className="text-lg font-bold text-emerald-300">
            78 / 100
          </span>
        </div>
        <p className="text-[12px] text-white/80 leading-relaxed mb-2">
          With The Simple Fund, investors hold a tokenized position that can be
          traded on DEX instead of waiting only for receivable maturity.
        </p>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[78%] bg-emerald-400 rounded-full" />
        </div>
        <div className="flex justify-between text-[11px] text-white/60 mt-1">
          <span>Traditional funds</span>
          <span>Simple Fund</span>
        </div>
      </div>

      {/* Card 2 - Manager Control (mobile) */}
      <div className="bg-[#0A4436]/90 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/70">
            Manager Control Index
          </span>
          <span className="text-lg font-bold text-emerald-300">
            90 / 100
          </span>
        </div>
        <p className="text-[12px] text-white/80 leading-relaxed mb-2">
          Receivables, participants and distributions are recorded on-chain,
          giving managers real-time dashboards and a complete approval trail.
        </p>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[30%] bg-slate-500 rounded-full" />
        </div>
        <div className="flex justify-between text-[11px] text-white/60 mt-1">
          <span>Traditional</span>
          <span>On-chain</span>
        </div>
      </div>
    </div>

    <button className="bg-white text-black px-8 py-[14px] rounded-[24px] text-[14px] font-medium transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:opacity-90 hover:scale-105">
      See the whole solution
    </button>
  </div>
</section>

      {/* Advanced Infrastructure Section */}
<section className="max-w-[1000px] mx-auto px-[24px] md:px-[24px] pt-[80px] pb-[100px]">
  <h2 className="text-[32px] md:text-[36px] leading-[1.2] text-center mb-4 text-white font-bold max-w-[800px] mx-auto">
    Advanced infrastructure for compliant, automated receivables operations.
  </h2>
  <p className="text-[14px] md:text-[16px] text-center mb-10 text-white opacity-75 max-w-[600px] mx-auto">
    Built for efficiency, designed for scale, backed by security.
  </p>
  
  {/* Imagem Principal */}
  <div className="w-full h-[240px] sm:h-[280px] md:h-[320px] lg:h-[420px] rounded-2xl mb-14 overflow-hidden border border-white/10 bg-black/40">
    <img 
      src={infrastructureImage} 
      alt="Infrastructure" 
      className="w-full h-full object-cover"
    />
  </div>


        {/* Features Grid - Centralizado e Menor */}
        <div className="max-w-[900px] mx-auto">
          <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-12 text-center">
            <div>
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <TrendingUp size={28} className="text-white opacity-70" />
                </div>
              </div>
              <h4 className="text-[18px] font-bold mb-3 text-white">Automation</h4>
              <p className="text-[13px] leading-[1.5] text-white opacity-80">
                Automate receivable registration, validation, and distribution through secure smart-contract workflows.
              </p>
            </div>
            
            <div>
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <Lock size={28} className="text-white opacity-70" />
                </div>
              </div>
              <h4 className="text-[18px] font-bold mb-3 text-white">Compliance</h4>
              <p className="text-[13px] leading-[1.5] text-white opacity-80">
                Ensure every participant, receivable, and operation is fully auditable and tamper-proof.
              </p>
            </div>
            
            <div>
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <Sliders size={28} className="text-white opacity-70" />
                </div>
              </div>
              <h4 className="text-[18px] font-bold mb-3 text-white">Customization</h4>
              <p className="text-[13px] leading-[1.5] text-white opacity-80">
                Enable tailored fund configurations aligned with governance rules and operational requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-[40px] pt-[80px] pb-[40px] text-center">
        <p className="text-[14px] text-white opacity-60">
          © 2025 The Simple Fund. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;