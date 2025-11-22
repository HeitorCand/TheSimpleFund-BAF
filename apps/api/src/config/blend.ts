import { Network } from '@blend-capital/blend-sdk';

// Configuração do Blend Protocol para testnet
export const blendConfig: Network = {
  rpc: 'https://soroban-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015',
  maxConcurrentRequests: 5,
  opts: {
    allowHttp: false,
  },
};

// Horizon API URL for testnet (different from RPC)
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

// Official Blend Protocol Testnet Contract Addresses
// Source: https://github.com/blend-capital/blend-utils/blob/main/testnet.contracts.json
//
// Note: "TestnetV2" is likely a pool contract. To find specific pools for different assets:
// 1. Visit https://testnet.blend.capital
// 2. Navigate to Markets to see active pools
// 3. Each pool has its own contract address (click pool for details)

export const BLEND_CONTRACTS = {
  // Testnet V2 Pool - This is a deployed pool contract on testnet
  // You can use this or find other pools at https://testnet.blend.capital
  USDC_POOL: 'CDDG7DLOWSHRYQ2HWGZEZ4UTR7LPTKFFHN3QUCSZEXOWOPARMONX6T65',
  
  // Asset addresses from official Blend testnet contracts
  USDC: 'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU',
  XLM: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  BLND: 'CB22KRA3YZVCNCQI64JQ5WE7UY2VAV7WFLK6A2JN3HEX56T2EDAFO7QF',
  
  // Other Blend Protocol Contracts (for reference)
  BACKSTOP_V2: 'CBHWKF4RHIKOKSURAKXSJRIIA7RJAMJH4VHRVPYGUF4AJ5L544LYZ35X',
  POOL_FACTORY_V2: 'CDSMKKCWEAYQW4DAUSH3XGRMIVIJB44TZ3UA5YCRHT6MP4LWEWR4GYV6',
};

// Configuração de pools disponíveis
export interface BlendPoolConfig {
  address: string;
  name: string;
  assetAddress: string;
  assetSymbol: string;
  description: string;
}

export const AVAILABLE_POOLS: BlendPoolConfig[] = [
  {
    address: BLEND_CONTRACTS.USDC_POOL,
    name: 'USDC Lending Pool',
    assetAddress: BLEND_CONTRACTS.USDC,
    assetSymbol: 'USDC',
    description: 'Deposit USDC and earn yield from lending activities',
  },
];
