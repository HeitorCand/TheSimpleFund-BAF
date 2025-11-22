// src/services/recommendationService.ts
import { PrismaClient, Fund } from '@prisma/client';

const prisma = new PrismaClient();

// Tipos para o sistema de recomendação (SQLite não suporta enums nativos)
type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';
type FundType = 'FIDC' | 'FII' | 'AGRO' | 'VAREJO' | 'OUTROS';
type FundInteractionType = 'VIEW' | 'CLICK' | 'FAVORITE' | 'START_ORDER';

/**
 * Monta um "perfil" simples do investidor
 * com base nos fundos em que ele já investiu ou interagiu.
 */
export async function buildInvestorProfile(investorId: string) {
  // Executa as queries em paralelo para melhor performance
  const [orders, interactions] = await Promise.all([
    // 1) Ordens concluídas - select apenas os campos necessários
    prisma.order.findMany({
      where: {
        investorId,
        status: 'COMPLETED',
      },
      select: {
        fund: {
          select: {
            fundType: true,
            sector: true,
            riskLevel: true,
            durationMonths: true,
            minTicket: true,
          }
        }
      },
    }),
    // 2) Interações - select apenas os campos necessários
    prisma.fundInteraction.findMany({
      where: { investorId },
      select: {
        type: true,
        fund: {
          select: {
            fundType: true,
            sector: true,
            riskLevel: true,
            durationMonths: true,
            minTicket: true,
          }
        }
      },
    })
  ]);

  const touchedFunds: { fund: Fund; weight: number }[] = [
    // investimento pesa mais
    ...orders.map((o) => ({ fund: o.fund, weight: 3 })),
    // interações implícitas
    ...interactions.map((i) => {
      let base = 1;
      if (i.type === 'FAVORITE') base = 2;
      if (i.type === 'START_ORDER') base = 2;
      return { fund: i.fund, weight: base };
    }),
  ];

  if (touchedFunds.length === 0) {
    return null; // cold start
  }

  const fundTypeCount: Record<string, number> = {};
  const sectorCount: Record<string, number> = {};
  const riskLevelCount: Record<string, number> = {};
  const durationValues: number[] = [];
  const minTicketValues: number[] = [];

  for (const { fund, weight } of touchedFunds) {
    if (fund.fundType) {
      fundTypeCount[fund.fundType] = (fundTypeCount[fund.fundType] || 0) + weight;
    }
    if (fund.sector) {
      sectorCount[fund.sector] = (sectorCount[fund.sector] || 0) + weight;
    }
    if (fund.riskLevel) {
      riskLevelCount[fund.riskLevel] = (riskLevelCount[fund.riskLevel] || 0) + weight;
    }
    if (fund.durationMonths != null) {
      // repete o valor pelo weight pra "puxar" a média
      for (let i = 0; i < weight; i++) durationValues.push(fund.durationMonths);
    }
    if (fund.minTicket != null) {
      for (let i = 0; i < weight; i++) minTicketValues.push(fund.minTicket);
    }
  }

  const topKey = (obj: Record<string, number>) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : null;

  const avgDuration = avg(durationValues);
  const avgMinTicket = avg(minTicketValues);

  // Faixas de tolerância (ex: ±50%)
  const durationRange =
    avgDuration != null
      ? { min: avgDuration * 0.5, max: avgDuration * 1.5 }
      : null;

  const minTicketRange =
    avgMinTicket != null
      ? { min: avgMinTicket * 0.5, max: avgMinTicket * 1.5 }
      : null;

  return {
    preferredFundType: topKey(fundTypeCount),
    preferredSector: topKey(sectorCount),
    preferredRiskLevel: topKey(riskLevelCount),
    durationRange,
    minTicketRange,
  };
}

/**
 * Busca fundos candidatos:
 * - ativos
 * - que o investidor ainda não investiu
 */
export async function getCandidateFunds(investorId: string) {
  // fundos em que ele já investiu - query otimizada
  const investedOrders = await prisma.order.findMany({
    where: {
      investorId,
      status: 'COMPLETED',
    },
    select: { fundId: true },
    distinct: ['fundId'], // Remove duplicatas no banco
  });

  const investedFundIds = investedOrders.map((o) => o.fundId);

  // Select apenas os campos necessários para scoring
  const candidates = await prisma.fund.findMany({
    where: {
      status: 'APPROVED',
      id: { notIn: investedFundIds },
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      fundType: true,
      riskLevel: true,
      sector: true,
      durationMonths: true,
      minTicket: true,
      price: true,
      description: true,
      status: true,
    },
  });

  return candidates;
}

/**
 * Função de score simples baseada no perfil + metadados do fundo
 */
function scoreFund(fund: Fund, profile: any) {
  let score = 0;

  if (profile?.preferredFundType && fund.fundType === profile.preferredFundType) {
    score += 3;
  }

  if (profile?.preferredSector && fund.sector === profile.preferredSector) {
    score += 3;
  }

  if (
    profile?.preferredRiskLevel &&
    fund.riskLevel === profile.preferredRiskLevel
  ) {
    score += 2;
  }

  // duration (prazo médio)
  if (profile?.durationRange && fund.durationMonths != null) {
    const { min, max } = profile.durationRange;
    if (fund.durationMonths >= min && fund.durationMonths <= max) {
      score += 1;
    }
  }

  // ticket mínimo
  if (profile?.minTicketRange && fund.minTicket != null) {
    const { min, max } = profile.minTicketRange;
    if (fund.minTicket >= min && fund.minTicket <= max) {
      score += 1;
    }
  }

  // bônus se tiver alguma performance positiva (campo futuro)
  if (typeof (fund as any).return12m === 'number' && (fund as any).return12m > 0) {
    score += 1;
  }

  return score;
}

/**
 * Função principal: retorna fundos recomendados
 */
export async function getRecommendedFunds(investorId: string, limit = 10) {
  const profile = await buildInvestorProfile(investorId);
  const candidates = await getCandidateFunds(investorId);

  // Cold start → sem perfil ainda
  if (!profile) {
    return candidates
      .sort(
        (a, b) =>
          ((b as any).return12m || 0) - ((a as any).return12m || 0),
      )
      .slice(0, limit)
      .map((fund) => ({
        fund,
        score: 0,
        reason: 'Fundos com boa performance recente e ativos na plataforma.',
      }));
  }

  const scored = candidates
    .map((fund) => {
      const score = scoreFund(fund, profile);
      return {
        fund,
        score,
        reason: buildReason(fund, profile, score),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Gera um "motivo" legível pro usuário ver na UI
 */
function buildReason(fund: Fund, profile: any, score: number): string {
  const reasons: string[] = [];

  if (profile?.preferredFundType && fund.fundType === profile.preferredFundType) {
    reasons.push(`mesmo tipo de fundo que você costuma analisar ou investir (${fund.fundType})`);
  }

  if (profile?.preferredSector && fund.sector === profile.preferredSector) {
    reasons.push(`foco no mesmo setor (${fund.sector}) dos fundos que você prefere`);
  }

  if (
    profile?.preferredRiskLevel &&
    fund.riskLevel === profile.preferredRiskLevel
  ) {
    reasons.push(`nível de risco alinhado ao seu histórico (${fund.riskLevel})`);
  }

  if (reasons.length === 0) {
    return 'Selecionado com base em similaridade aos fundos que você já analisou ou investiu.';
  }

  return 'Recomendado por: ' + reasons.join(', ') + '.';
}
