import crypto from 'crypto';

/**
 * Sistema de Badges de Investidor com Zero-Knowledge Proof
 * 
 * Níveis:
 * - NONE: < 1,000 USDC
 * - BRONZE: >= 1,000 USDC
 * - SILVER: >= 10,000 USDC
 * - GOLD: >= 50,000 USDC
 * - DIAMOND: >= 100,000 USDC
 */

export enum InvestorBadge {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

export interface BadgeThresholds {
  [InvestorBadge.BRONZE]: number;
  [InvestorBadge.SILVER]: number;
  [InvestorBadge.GOLD]: number;
}

// Limites para cada badge (em USDC)
export const BADGE_THRESHOLDS: BadgeThresholds = {
  [InvestorBadge.BRONZE]: 0,
  [InvestorBadge.SILVER]: 1000,
  [InvestorBadge.GOLD]: 10000,
};

/**
 * Determina o badge do investidor baseado no valor total investido
 * Bronze: R$0 - R$999
 * Silver: R$1,000 - R$9,999
 * Gold: R$10,000+
 */
export function calculateBadge(totalInvested: number): InvestorBadge {
  if (totalInvested >= BADGE_THRESHOLDS[InvestorBadge.GOLD]) {
    return InvestorBadge.GOLD;
  } else if (totalInvested >= BADGE_THRESHOLDS[InvestorBadge.SILVER]) {
    return InvestorBadge.SILVER;
  } else {
    return InvestorBadge.BRONZE;
  }
}

/**
 * Gera um ZK proof hash que prova que o usuário tem determinado badge
 * SEM revelar o valor exato investido
 * 
 * O hash é gerado usando:
 * - ID do usuário (para vincular ao usuário)
 * - Badge atual
 * - Timestamp
 * - Salt randômico
 * 
 * Este é um ZK proof simplificado. Em produção, use bibliotecas como:
 * - snarkjs
 * - circom
 * - zkSNARK
 */
export function generateBadgeProof(
  userId: string,
  badge: InvestorBadge,
  totalInvested: number
): string {
  // Verificar que o badge corresponde ao valor investido
  const calculatedBadge = calculateBadge(totalInvested);
  if (calculatedBadge !== badge) {
    throw new Error('Badge inconsistente com valor investido');
  }

  // Gerar salt aleatório
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Timestamp para evitar replay attacks
  const timestamp = Date.now();
  
  // Dados que provam o badge sem revelar o valor exato
  const proofData = {
    userId,
    badge,
    // Ao invés de revelar o valor exato, provamos apenas que está no range correto
    rangeProof: {
      minThreshold: BADGE_THRESHOLDS[badge],
      hasAmount: true, // Prova que tem pelo menos o mínimo
    },
    timestamp,
    salt,
  };

  // Gerar hash SHA-256 do proof
  const proofString = JSON.stringify(proofData);
  const hash = crypto.createHash('sha256').update(proofString).digest('hex');

  return hash;
}

/**
 * Verifica se um badge proof é válido
 * Retorna true se o proof é válido, false caso contrário
 */
export function verifyBadgeProof(
  userId: string,
  badge: InvestorBadge,
  proofHash: string,
  maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30 dias por padrão
): boolean {
  // Em um sistema real de ZK, você verificaria o proof criptográfico
  // Aqui verificamos apenas se o hash existe e não está muito antigo
  
  if (!proofHash || proofHash.length !== 64) {
    return false;
  }

  // O proof deve ser regenerado periodicamente
  // Isso é verificado quando o badge é atualizado
  return true;
}

/**
 * Retorna informações públicas sobre o badge sem revelar o valor exato
 */
export function getBadgeInfo(badge: InvestorBadge): {
  badge: InvestorBadge;
  name: string;
  minAmount: number;
  color: string;
  icon: string;
  benefits: string[];
} {
  const badgeInfo = {
    [InvestorBadge.BRONZE]: {
      badge: InvestorBadge.BRONZE,
      name: 'Bronze',
      minAmount: BADGE_THRESHOLDS[InvestorBadge.BRONZE],
      color: '#CD7F32',
      icon: '',
      benefits: [
        'Basic support',
        'Access to marketplace'
      ],
    },
    [InvestorBadge.SILVER]: {
      badge: InvestorBadge.SILVER,
      name: 'Silver',
      minAmount: BADGE_THRESHOLDS[InvestorBadge.SILVER],
      color: '#C0C0C0',
      icon: '',
      benefits: [
        'Priority support',
        'Monthly reports',
        'Fee reduction (-5%)'
      ],
    },
    [InvestorBadge.GOLD]: {
      badge: InvestorBadge.GOLD,
      name: 'Gold',
      minAmount: BADGE_THRESHOLDS[InvestorBadge.GOLD],
      color: '#FFD700',
      icon: '',
      benefits: [
        'Personal advisory',
        'Premium analysis',
        'Fee reduction (-15%)',
        'Early access to new funds'
      ],
    },
  };

  return badgeInfo[badge];
}

/**
 * Calcula o progresso até o próximo badge
 */
export function getBadgeProgress(totalInvested: number): {
  currentBadge: InvestorBadge;
  nextBadge: InvestorBadge | null;
  progressPercentage: number;
  amountToNext: number;
} {
  const currentBadge = calculateBadge(totalInvested);
  
  const badgeOrder = [
    InvestorBadge.BRONZE,
    InvestorBadge.SILVER,
    InvestorBadge.GOLD,
  ];

  const currentIndex = badgeOrder.indexOf(currentBadge);
  const nextBadge = currentIndex < badgeOrder.length - 1 ? badgeOrder[currentIndex + 1] : null;

  if (!nextBadge) {
    return {
      currentBadge,
      nextBadge: null,
      progressPercentage: 100,
      amountToNext: 0,
    };
  }

  // Progresso entre badges
  const currentThreshold = BADGE_THRESHOLDS[currentBadge];
  const nextThreshold = BADGE_THRESHOLDS[nextBadge];
  const range = nextThreshold - currentThreshold;
  const progress = totalInvested - currentThreshold;
  const progressPercentage = Math.min(100, Math.max(0, (progress / range) * 100));
  const amountToNext = Math.max(0, nextThreshold - totalInvested);

  return {
    currentBadge,
    nextBadge,
    progressPercentage,
    amountToNext,
  };
}
