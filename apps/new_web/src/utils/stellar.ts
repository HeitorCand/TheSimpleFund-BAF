import * as StellarSdk from 'stellar-sdk';

const STELLAR_NETWORK = StellarSdk.Networks.TESTNET;
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export const stellarConfig = {
  network: STELLAR_NETWORK,
  horizonUrl: HORIZON_URL,
  baseFee: StellarSdk.BASE_FEE,
  timeout: 180,
};

/**
 * Creates a Stellar server instance
 */
export const createServer = () => new StellarSdk.Horizon.Server(stellarConfig.horizonUrl);

/**
 * Builds a payment transaction
 */
export interface PaymentTransactionParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  memo: string;
  asset?: StellarSdk.Asset;
}

export const buildPaymentTransaction = async (
  params: PaymentTransactionParams
): Promise<StellarSdk.Transaction> => {
  const server = createServer();
  const account = await server.loadAccount(params.sourcePublicKey);

  return new StellarSdk.TransactionBuilder(account, {
    fee: stellarConfig.baseFee,
    networkPassphrase: stellarConfig.network,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: params.destination,
        asset: params.asset || StellarSdk.Asset.native(),
        amount: params.amount,
      })
    )
    .addMemo(StellarSdk.Memo.text(params.memo))
    .setTimeout(stellarConfig.timeout)
    .build();
};

/**
 * Builds a custom token payment transaction
 * Creates and sends a Stellar custom asset (token) representing the fund
 */
export interface TokenMintTransactionParams {
  issuerPublicKey: string; // Fund's issuer account (gestor wallet)
  destination: string; // Investor's wallet
  amount: number;
  fundSymbol: string; // Token code (max 12 characters)
}

export const buildTokenMintTransaction = async (
  params: TokenMintTransactionParams
): Promise<StellarSdk.Transaction> => {
  const server = createServer();
  const account = await server.loadAccount(params.issuerPublicKey);

  // Create the custom asset (token)
  const fundAsset = new StellarSdk.Asset(
    params.fundSymbol.substring(0, 12).toUpperCase(), // Max 12 chars for asset code
    params.issuerPublicKey
  );

  // Build transaction to send the custom token
  return new StellarSdk.TransactionBuilder(account, {
    fee: stellarConfig.baseFee,
    networkPassphrase: stellarConfig.network,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: params.destination,
        asset: fundAsset,
        amount: params.amount.toString(),
      })
    )
    .addMemo(StellarSdk.Memo.text(`Fund Token: ${params.fundSymbol}`))
    .setTimeout(stellarConfig.timeout)
    .build();
};

/**
 * Builds a trustline transaction for investor to accept fund tokens
 * Investor must create trustline before receiving custom tokens
 */
export interface TrustlineTransactionParams {
  investorPublicKey: string;
  issuerPublicKey: string;
  fundSymbol: string;
  limit?: string; // Optional limit, defaults to max
}

export const buildTrustlineTransaction = async (
  params: TrustlineTransactionParams
): Promise<StellarSdk.Transaction> => {
  const server = createServer();
  const account = await server.loadAccount(params.investorPublicKey);

  const fundAsset = new StellarSdk.Asset(
    params.fundSymbol.substring(0, 12).toUpperCase(),
    params.issuerPublicKey
  );

  return new StellarSdk.TransactionBuilder(account, {
    fee: stellarConfig.baseFee,
    networkPassphrase: stellarConfig.network,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: fundAsset,
        limit: params.limit,
      })
    )
    .addMemo(StellarSdk.Memo.text(`Trust: ${params.fundSymbol}`))
    .setTimeout(stellarConfig.timeout)
    .build();
};

/**
 * Gets transaction explorer URL
 */
export const getTransactionUrl = (txHash: string): string => {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
};

/**
 * Truncates memo to Stellar's 28-byte limit
 */
export const truncateMemo = (memo: string, maxLength: number = 28): string => {
  return memo.substring(0, maxLength);
};
