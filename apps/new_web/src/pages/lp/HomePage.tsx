import React from 'react';
import { FileText, Building2, Briefcase, Lock, Sliders, TrendingUp } from 'lucide-react';
import logoTSF from './img/TSF.svg';
import backgroundImage from './img/background.svg';
import infrastructureImage from './img/image-pattern.png';

const HomePage: React.FC = () => {
  return (
    <div 
      className="min-h-screen bg-[#9E9E9E] relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
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
            <span className="bg-[#FBE968] text-black px-4 py-1 inline-block">Unlock liquidity.</span>
          </h1>
          <p className="text-[16px] leading-[1.6] mb-[30px] text-white opacity-80 max-w-[500px]">
            Transform receivables operations with{' '}
            <span className="font-bold">automated, transparent, on-chain workflows.</span>
          </p>
          <button className="bg-white text-black px-8 py-[14px] rounded-[24px] text-[14px] font-medium transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:opacity-90 hover:scale-105 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
            Explore the Platform
          </button>
        </div>
      </section>

      {/* Features Section - 3 Cards */}
      <section className="max-w-[1200px] mx-auto px-[40px] lg:px-[40px] md:px-[24px] pb-[140px]">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {/* Feature Card 1 */}
          <div className="bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.18] rounded-2xl p-[40px_32px] min-h-[280px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:translate-y-[-4px]">
            <div className="mb-6">
              <FileText size={48} className="text-white opacity-80" />
            </div>
            <h3 className="text-[20px] leading-[1.3] mb-4 text-white font-bold">
              Accelerate liquidity with on-chain fund shares
            </h3>
            <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-6 flex-grow">
              Access transparent on-chain fund shares with automated distributions and real-time visibility.
            </p>
            <button className="bg-[#028C35] text-white px-7 py-3 rounded-[20px] text-[13px] font-medium w-fit transition-all duration-300 hover:opacity-90 hover:scale-105">
              I am an Investor
            </button>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.18] rounded-2xl p-[40px_32px] min-h-[280px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:translate-y-[-4px]">
            <div className="mb-6">
              <Building2 size={48} className="text-white opacity-80" />
            </div>
            <h3 className="text-[20px] leading-[1.3] mb-4 text-white font-bold">
              Decentralized operations with automated reconciliation
            </h3>
            <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-6 flex-grow">
              Receivables are automatically registered and distributed according to rules, eliminating manual reconciliation.
            </p>
            <button className="bg-[#028C35] text-white px-7 py-3 rounded-[20px] text-[13px] font-medium w-fit transition-all duration-300 hover:opacity-90 hover:scale-105">
              I am a Fund Manager
            </button>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.18] rounded-2xl p-[40px_32px] min-h-[280px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:translate-y-[-4px]">
            <div className="mb-6">
              <Briefcase size={48} className="text-white opacity-80" />
            </div>
            <h3 className="text-[20px] leading-[1.3] mb-4 text-white font-bold">
              Full regulatory compliance and transparency
            </h3>
            <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-6 flex-grow">
              Register assignors and debtors with full compliance, transparency, and significantly reduced onboarding friction.
            </p>
            <button className="bg-[#028C35] text-white px-7 py-3 rounded-[20px] text-[13px] font-medium w-fit transition-all duration-300 hover:opacity-90 hover:scale-105">
              I am a Consultant
            </button>
          </div>
        </div>
      </section>

      {/* Como Funciona Section - Left Aligned, 1/3 width */}
      <section className="max-w-[1200px] mx-auto px-[40px] md:px-[24px] pb-[160px]">
        <div className="max-w-[400px]">
          <h2 className="text-[44px] md:text-[36px] leading-[1.1] mb-6 text-white font-bold">
            Como
            <br />
            <span className="bg-[#FBE968] text-black px-3 py-1 inline-block">funciona?</span>
          </h2>
          
          <div className="mb-8">
            <p className="text-[15px] leading-[1.6] text-white opacity-85 mb-4">
              Você controla onde e como seus anúncios são exibidos.
            </p>
            <p className="text-[15px] leading-[1.6] text-white opacity-85">
              Nossa tecnologia otimiza sua campanha para mais segurança, alinhamento e impacto.
            </p>
          </div>
          
          {/* Gráfico ROI */}
          <div className="bg-white/[0.05] backdrop-blur-[8px] border border-white/[0.12] rounded-2xl p-6 mb-8">
            <div className="flex items-end justify-center gap-8 h-[280px] relative">
              {/* Label ROI */}
              <div className="absolute top-0 right-4 bg-cyan-400/30 px-3 py-1 rounded-lg">
                <span className="text-white font-bold text-xs">ROI</span>
              </div>
              
              {/* Eixo Y */}
              <div className="flex flex-col justify-between h-full text-white text-xs font-medium absolute left-0">
                <div>25</div>
                <div>20</div>
                <div>15</div>
                <div>10</div>
                <div>5</div>
                <div>0</div>
              </div>
              
              {/* Barras */}
              <div className="flex items-end gap-6 h-full ml-8">
                {/* Barra 1 - Sem Contextual */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-700 w-[80px] rounded-t-lg flex items-center justify-center" style={{ height: '40%' }}>
                    <div className="text-white text-[10px] font-medium text-center leading-tight">
                      Sem<br/>Contextual<br/>Targeting
                    </div>
                  </div>
                  <div className="text-white text-xs mt-2">5-10%</div>
                </div>
                
                {/* Barra 2 - Com Contextual */}
                <div className="flex flex-col items-center">
                  <div className="bg-cyan-500 w-[80px] rounded-t-lg flex items-center justify-center" style={{ height: '75%' }}>
                    <div className="text-white text-[10px] font-medium text-center leading-tight">
                      Com<br/>Contextual<br/>Targeting
                    </div>
                  </div>
                  <div className="text-white text-xs mt-2">15-22%</div>
                </div>
              </div>
            </div>
          </div>
          
          <button className="bg-white text-black px-8 py-[14px] rounded-[24px] text-[14px] font-medium transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:opacity-90 hover:scale-105">
            Ver solução completa
          </button>
        </div>
      </section>

      {/* Advanced Infrastructure Section */}
      <section className="max-w-[1000px] mx-auto px-[40px] md:px-[24px] pt-[80px] pb-[100px]">
        <h2 className="text-[48px] md:text-[36px] leading-[1.2] text-center mb-6 text-white font-bold max-w-[800px] mx-auto">
          Advanced infrastructure for compliant, automated receivables operations.
        </h2>
        <p className="text-[16px] text-center mb-12 text-white opacity-75 max-w-[600px] mx-auto">
          Built for efficiency, designed for scale, backed by security.
        </p>
        
        {/* Imagem Principal */}
        <div className="w-full h-[480px] md:h-[320px] rounded-lg mb-16 overflow-hidden">
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
          © 2024 The Simple Fund. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;