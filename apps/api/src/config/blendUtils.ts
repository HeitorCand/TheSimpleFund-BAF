import { PoolContractV2, RequestType, Request } from '@blend-capital/blend-sdk';
import * as StellarSdk from 'stellar-sdk';
import { blendConfig, HORIZON_URL } from '../config/blend.js';

const { Horizon, TransactionBuilder, BASE_FEE, xdr, SorobanRpc } = StellarSdk;

/**
 * Build a transaction to deposit assets into a Blend pool
 * @param poolAddress - Address of the Blend pool contract
 * @param userAddress - Address of the user depositing
 * @param assetAddress - Address of the asset to deposit
 * @param amount - Amount to deposit (in stroops for XLM, smallest unit for tokens)
 * @returns Transaction XDR ready to be signed
 */
export async function buildDepositTransaction(
  poolAddress: string,
  userAddress: string,
  assetAddress: string,
  amount: bigint
): Promise<string> {
  try {
    const server = new Horizon.Server(HORIZON_URL);
    const sorobanServer = new SorobanRpc.Server(blendConfig.rpc);
    
    // Load the user's account to get sequence number
    const account = await server.loadAccount(userAddress);
    
    // Create the pool contract instance (V2)
    const poolContract = new PoolContractV2(poolAddress);
    
    // Create a supply collateral request
    const requests: Request[] = [
      {
        request_type: RequestType.SupplyCollateral,
        address: assetAddress,
        amount: amount,
      },
    ];

    // Build the submit operation using Blend SDK
    const submitOpXdr = poolContract.submit({
      from: userAddress,
      spender: userAddress,
      to: userAddress,
      requests: requests,
    });

    // Parse the operation from XDR (as shown in Blend SDK docs)
    const operation = xdr.Operation.fromXDR(submitOpXdr, 'base64');

    // Build a complete transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: blendConfig.passphrase,
    })
      .addOperation(operation)
      .setTimeout(300) // 5 minutes
      .build();

    // Simulate the transaction to get proper resource limits
    const simulationResponse = await sorobanServer.simulateTransaction(transaction);
    
    if (SorobanRpc.Api.isSimulationError(simulationResponse)) {
      throw new Error(`Simulation failed: ${simulationResponse.error}`);
    }

    // Prepare the transaction with simulation results
    const preparedTransaction = SorobanRpc.assembleTransaction(
      transaction,
      simulationResponse
    ).build();

    return preparedTransaction.toXDR();
  } catch (error) {
    console.error('Error building deposit transaction:', error);
    throw new Error('Failed to build deposit transaction');
  }
}

/**
 * Build a transaction to withdraw assets from a Blend pool
 * @param poolAddress - Address of the Blend pool contract
 * @param userAddress - Address of the user withdrawing
 * @param assetAddress - Address of the asset to withdraw
 * @param amount - Amount to withdraw (in stroops for XLM, smallest unit for tokens)
 * @returns Transaction XDR ready to be signed
 */
export async function buildWithdrawTransaction(
  poolAddress: string,
  userAddress: string,
  assetAddress: string,
  amount: bigint
): Promise<string> {
  try {
    const server = new Horizon.Server(HORIZON_URL);
    const sorobanServer = new SorobanRpc.Server(blendConfig.rpc);
    
    // Load the user's account to get sequence number
    const account = await server.loadAccount(userAddress);
    
    // Create the pool contract instance (V2)
    const poolContract = new PoolContractV2(poolAddress);
    
    // Create a withdraw collateral request
    const requests: Request[] = [
      {
        request_type: RequestType.WithdrawCollateral,
        address: assetAddress,
        amount: amount,
      },
    ];

    // Build the submit operation using Blend SDK
    const submitOpXdr = poolContract.submit({
      from: userAddress,
      spender: userAddress,
      to: userAddress,
      requests: requests,
    });

    // Parse the operation from XDR (as shown in Blend SDK docs)
    const operation = xdr.Operation.fromXDR(submitOpXdr, 'base64');

    // Build a complete transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: blendConfig.passphrase,
    })
      .addOperation(operation)
      .setTimeout(300) // 5 minutes
      .build();

    // Simulate the transaction to get proper resource limits
    const simulationResponse = await sorobanServer.simulateTransaction(transaction);
    
    if (SorobanRpc.Api.isSimulationError(simulationResponse)) {
      throw new Error(`Simulation failed: ${simulationResponse.error}`);
    }

    // Prepare the transaction with simulation results
    const preparedTransaction = SorobanRpc.assembleTransaction(
      transaction,
      simulationResponse
    ).build();

    return preparedTransaction.toXDR();
  } catch (error) {
    console.error('Error building withdraw transaction:', error);
    throw new Error('Failed to build withdraw transaction');
  }
}

/**
 * Get user's position in a Blend pool
 * @param poolAddress - Address of the Blend pool contract
 * @param userAddress - Address of the user
 * @returns User positions (collateral, supply, liabilities)
 */
export async function getUserPosition(
  poolAddress: string,
  userAddress: string
): Promise<{
  collateral: Map<number, bigint>;
  supply: Map<number, bigint>;
  liabilities: Map<number, bigint>;
} | null> {
  try {
    const poolContract = new PoolContractV2(poolAddress);
    
    // Get positions XDR - in a real implementation, you'd need to simulate this
    // For now, return a simplified structure
    // In production, you'd use SorobanRpc to simulate the getPositions call
    
    return {
      collateral: new Map(),
      supply: new Map(),
      liabilities: new Map(),
    };
  } catch (error) {
    console.error('Error getting user position:', error);
    return null;
  }
}

/**
 * Get reserve data from a Blend pool for a specific asset
 * @param poolAddress - Address of the Blend pool contract
 * @param assetAddress - Address of the asset
 * @returns Reserve data including rates and supply
 */
export async function getReserveData(
  poolAddress: string,
  assetAddress: string
): Promise<{
  dRate: bigint;
  bRate: bigint;
  dSupply: bigint;
  bSupply: bigint;
  lastTime: number;
} | null> {
  try {
    const poolContract = new PoolContractV2(poolAddress);
    const reserveXdr = poolContract.getReserve(assetAddress);
    
    // In production, you would simulate this call to get actual data
    // For now, return null to indicate the need for simulation
    return null;
  } catch (error) {
    console.error('Error getting reserve data:', error);
    return null;
  }
}

/**
 * Calculate APY from bRate
 * @param bRate - The bToken exchange rate
 * @param decimals - Number of decimals for the rate
 * @returns APY as a percentage
 */
export function calculateAPY(bRate: bigint, decimals: number = 9): number {
  try {
    // Simplified APY calculation
    // In production, you'd track rate changes over time
    const rate = Number(bRate) / Math.pow(10, decimals);
    const apy = (rate - 1) * 100; // Convert to percentage
    return Math.max(0, apy);
  } catch (error) {
    console.error('Error calculating APY:', error);
    return 0;
  }
}

/**
 * Convert amount to smallest unit (stroops for XLM, similar for tokens)
 * @param amount - Amount in standard units
 * @param decimals - Number of decimals (7 for XLM, varies for tokens)
 * @returns Amount in smallest unit
 */
export function toSmallestUnit(amount: number, decimals: number = 7): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

/**
 * Convert amount from smallest unit to standard units
 * @param amount - Amount in smallest unit
 * @param decimals - Number of decimals
 * @returns Amount in standard units
 */
export function fromSmallestUnit(amount: bigint, decimals: number = 7): number {
  return Number(amount) / Math.pow(10, decimals);
}
