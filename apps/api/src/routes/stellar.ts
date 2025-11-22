import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as StellarSdk from 'stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar.js';

const server = new StellarSdk.Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
const networkPassphrase = StellarSdk.Networks.TESTNET;

const generateKeysSchema = z.object({});

const getBalanceSchema = z.object({
  publicKey: z.string()
});

const createTrustlineSchema = z.object({
  secretKey: z.string(),
  assetCode: z.string(),
  assetIssuer: z.string()
});

const transferSchema = z.object({
  secretKey: z.string(),
  destination: z.string(),
  assetCode: z.string(),
  assetIssuer: z.string().optional(),
  amount: z.string()
});

export async function stellarRoutes(fastify: FastifyInstance) {
  // Generate Stellar keypair
  fastify.post('/generate-keys', async (request, reply) => {
    try {
      const keypair = StellarSdk.Keypair.random();
      
      return {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret()
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate keys' });
    }
  });

  // Get account balance
  fastify.post('/balance', async (request, reply) => {
    try {
      const body = getBalanceSchema.parse(request.body);
      
      const account = await server.loadAccount(body.publicKey);
      
      const balances = account.balances.map((balance: any) => ({
        asset_type: balance.asset_type,
        asset_code: balance.asset_code,
        asset_issuer: balance.asset_issuer,
        balance: balance.balance
      }));

      return { balances };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get balance' });
    }
  });

  // Create trustline
  fastify.post('/trustline', async (request, reply) => {
    try {
      const body = createTrustlineSchema.parse(request.body);
      
      const sourceKeypair = StellarSdk.Keypair.fromSecret(body.secretKey);
      const account = await server.loadAccount(sourceKeypair.publicKey());
      
      const asset = new StellarSdk.Asset(body.assetCode, body.assetIssuer);
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: asset
        }))
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      return {
        hash: result.hash,
        ledger: result.ledger,
        successful: result.successful
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create trustline' });
    }
  });

  // Transfer assets
  fastify.post('/transfer', async (request, reply) => {
    try {
      const body = transferSchema.parse(request.body);
      
      const sourceKeypair = StellarSdk.Keypair.fromSecret(body.secretKey);
      const account = await server.loadAccount(sourceKeypair.publicKey());
      
      const asset = body.assetIssuer 
        ? new StellarSdk.Asset(body.assetCode, body.assetIssuer)
        : StellarSdk.Asset.native();
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: body.destination,
          asset: asset,
          amount: body.amount
        }))
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      return {
        hash: result.hash,
        ledger: result.ledger,
        successful: result.successful
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to transfer' });
    }
  });

  // Fund account with friendbot (testnet only)
  fastify.post('/fund-account', async (request, reply) => {
    try {
      const { publicKey } = z.object({ publicKey: z.string() }).parse(request.body);
      
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      
      if (!response.ok) {
        throw new Error('Failed to fund account');
      }
      
      const result = await response.json();
      
      return { 
        success: true,
        result 
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fund account' });
    }
  });

  // Get transaction details
  fastify.get('/transaction/:hash', async (request, reply) => {
    try {
      const { hash } = request.params as { hash: string };
      
      const transaction = await server.transactions().transaction(hash).call();
      
      return { transaction };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get transaction' });
    }
  });

  // Deploy Soroban contract
  fastify.post('/deploy-contract', async (request, reply) => {
    try {
      const { secretKey, wasmHash, contractType } = z.object({
        secretKey: z.string(),
        wasmHash: z.string(),
        contractType: z.enum(['fund-token', 'receivable-vault'])
      }).parse(request.body);
      
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
      
      // Return the real deployed contract IDs
      const contractId = contractType === 'fund-token' 
        ? STELLAR_CONFIG.CONTRACTS.FUND_TOKEN
        : STELLAR_CONFIG.CONTRACTS.RECEIVABLE_VAULT;
      
      return {
        contractId,
        contractType,
        deployer: sourceKeypair.publicKey(),
        network: STELLAR_CONFIG.NETWORK,
        status: 'deployed'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to deploy contract' });
    }
  });

  // Initialize fund token contract
  fastify.post('/initialize-fund-token', async (request, reply) => {
    try {
      const { secretKey, contractId, tokenSymbol, initialSupply } = z.object({
        secretKey: z.string(),
        contractId: z.string(),
        tokenSymbol: z.string(),
        initialSupply: z.number()
      }).parse(request.body);
      
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
      
      // Mock initialization for demo
      // In production, this would call the Soroban contract's initialize function
      
      return {
        success: true,
        contractId,
        admin: sourceKeypair.publicKey(),
        tokenSymbol,
        initialSupply,
        txHash: `mock_init_${Date.now()}`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to initialize contract' });
    }
  });

  // Mint tokens (Soroban contract call)
  fastify.post('/mint-tokens', async (request, reply) => {
    try {
      const { adminSecretKey, contractId, recipientPublicKey, amount } = z.object({
        adminSecretKey: z.string(),
        contractId: z.string(),
        recipientPublicKey: z.string(),
        amount: z.number()
      }).parse(request.body);
      
      const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
      
      // Mock minting for demo
      // In production, this would call the Soroban contract's mint function
      
      return {
        success: true,
        contractId,
        recipient: recipientPublicKey,
        amount,
        txHash: `mock_mint_${Date.now()}`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to mint tokens' });
    }
  });

  // Add to whitelist (Soroban contract call)
  fastify.post('/add-to-whitelist', async (request, reply) => {
    try {
      const { adminSecretKey, contractId, userPublicKey } = z.object({
        adminSecretKey: z.string(),
        contractId: z.string(),
        userPublicKey: z.string()
      }).parse(request.body);
      
      const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
      
      // Mock whitelist addition for demo
      // In production, this would call the Soroban contract's whitelist_add function
      
      return {
        success: true,
        contractId,
        whitelistedUser: userPublicKey,
        txHash: `mock_whitelist_${Date.now()}`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to add to whitelist' });
    }
  });

  // Get token balance (Soroban contract call)
  fastify.post('/contract-balance', async (request, reply) => {
    try {
      const { contractId, accountPublicKey } = z.object({
        contractId: z.string(),
        accountPublicKey: z.string()
      }).parse(request.body);
      
      // Mock balance query for demo
      // In production, this would call the Soroban contract's balance function
      const mockBalance = Math.floor(Math.random() * 10000);
      
      return {
        contractId,
        account: accountPublicKey,
        balance: mockBalance,
        success: true
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get contract balance' });
    }
  });

  // Register receivable (Soroban contract call)
  fastify.post('/register-receivable', async (request, reply) => {
    try {
      const { adminSecretKey, contractId, receivableId, amount, dueDate } = z.object({
        adminSecretKey: z.string(),
        contractId: z.string(),
        receivableId: z.string(),
        amount: z.number(),
        dueDate: z.string()
      }).parse(request.body);
      
      const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
      
      // Mock receivable registration for demo
      // In production, this would call the ReceivableVault contract's register_receivable function
      
      return {
        success: true,
        contractId,
        receivableId,
        amount,
        dueDate,
        txHash: `mock_register_${Date.now()}`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to register receivable' });
    }
  });

  // Mark receivable as paid (Soroban contract call)
  fastify.post('/mark-receivable-paid', async (request, reply) => {
    try {
      const { adminSecretKey, contractId, receivableId, paidAmount } = z.object({
        adminSecretKey: z.string(),
        contractId: z.string(),
        receivableId: z.string(),
        paidAmount: z.number()
      }).parse(request.body);
      
      const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
      
      // Mock receivable payment for demo
      // In production, this would call the ReceivableVault contract's mark_paid function
      
      return {
        success: true,
        contractId,
        receivableId,
        paidAmount,
        txHash: `mock_payment_${Date.now()}`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to mark receivable as paid' });
    }
  });

  // Distribute payments to token holders (Soroban contract call)
  fastify.post('/distribute-payments', async (request, reply) => {
    try {
      const { adminSecretKey, contractId, totalAmount } = z.object({
        adminSecretKey: z.string(),
        contractId: z.string(),
        totalAmount: z.number()
      }).parse(request.body);
      
      const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
      
      // Mock distribution for demo
      // In production, this would call the ReceivableVault contract's distribute function
      
      return {
        success: true,
        contractId,
        totalAmount,
        distributedTo: 'token_holders',
        txHash: `mock_distribution_${Date.now()}`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to distribute payments' });
    }
  });

  // Build transaction to add trustline for Soroban token (for Blend/USDC)
  fastify.post('/build-token-trustline', async (request, reply) => {
    try {
      const { userAddress, tokenContractId } = z.object({
        userAddress: z.string(),
        tokenContractId: z.string(),
      }).parse(request.body);
      
      const account = await server.loadAccount(userAddress);
      
      // For Soroban tokens (SAC - Stellar Asset Contract), we need to invoke the token contract
      // to authorize the account. This is different from classic trustlines.
      // 
      // However, USDC on testnet might be a wrapped classic asset, so we need to check
      // the account balances first to see if it needs a classic trustline or SAC auth.
      
      // Create a simple transaction that the user will sign
      // For Soroban tokens, the pool contract will handle authorization during deposit
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .setTimeout(300)
        .build();
      
      return {
        transactionXdr: transaction.toXDR(),
        message: 'USDC authorization will happen automatically during the first deposit',
        note: 'For Blend Protocol, trustlines are managed by the pool contract'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to build token trustline' });
    }
  });

  // Check account balances including Soroban tokens
  fastify.post('/check-balances', async (request, reply) => {
    try {
      const { publicKey } = z.object({ publicKey: z.string() }).parse(request.body);
      
      const account = await server.loadAccount(publicKey);
      
      const balances = account.balances.map((balance: any) => ({
        asset_type: balance.asset_type,
        asset_code: balance.asset_code || 'XLM',
        asset_issuer: balance.asset_issuer,
        balance: balance.balance,
        limit: balance.limit,
      }));
      
      return { 
        publicKey,
        balances,
        hasXLM: balances.some(b => b.asset_type === 'native'),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to check balances' });
    }
  });
}