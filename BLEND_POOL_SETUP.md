# Blend Pool Setup Guide

## ✅ Configuration Updated with Official Testnet Addresses

The configuration has been updated with official Blend Protocol testnet contract addresses from:
https://github.com/blend-capital/blend-utils/blob/main/testnet.contracts.json

Current pool address: `CDDG7DLOWSHRYQ2HWGZEZ4UTR7LPTKFFHN3QUCSZEXOWOPARMONX6T65` (TestnetV2 pool)

## 🔑 How to Get USDC for Testing

**The error "trustline entry is missing" means you don't have USDC in your wallet yet.**

### Steps to get USDC on Stellar Testnet:

1. **Visit Blend Testnet App**: https://testnet.blend.capital

2. **Connect your Freighter wallet** (the one you're using in the app)

3. **Look for the "Faucet" or "Get Test Tokens" button** in the Blend UI

4. **Request testnet USDC** - Blend usually provides a faucet to get test USDC

5. **Alternative**: Use the Stellar Laboratory
   - Go to: https://laboratory.stellar.org/#?network=test
   - Generate a trustline for USDC: `CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU`
   - Then request tokens from a testnet faucet

Once you have USDC in your wallet, the deposit transaction will work! ✨

## How to Get a Real Pool Address

### Option 1: Use an Existing Blend Testnet Pool (Recommended)

1. **Visit Blend Testnet UI**: Go to https://testnet.blend.capital

2. **Browse Available Pools**:
   - Click on "Markets" in the navigation
   - You'll see a list of active lending pools
   - Each pool shows assets (USDC, XLM, etc.) and current APY

3. **Get the Pool Contract Address**:
   - Click on any pool to view details
   - The URL will change to: `https://testnet.blend.capital/dashboard/?poolId=CXXXXXXXXXX...`
   - Copy the `poolId` parameter (starts with C, 56 characters)
   - This is your pool contract address

4. **Update Your Configuration**:
   ```typescript
   // In apps/api/src/config/blend.ts
   export const BLEND_CONTRACTS = {
     USDC_POOL: 'CXXXXXXXXXX...', // Paste the real pool address here
     USDC: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
     XLM: 'native',
   };
   ```

5. **Restart Your API Server**:
   ```bash
   cd apps/api
   npm run dev
   ```

### Option 2: Deploy Your Own Pool (Advanced)

If you want to create your own pool, you'll need to:

1. Use Blend's pool factory contract
2. Deploy a new pool instance
3. Configure assets and parameters
4. Fund the pool with initial liquidity

This requires understanding Soroban smart contracts and having testnet XLM for deployment costs.

## How to Verify a Pool Address

You can verify a pool exists using the Blend SDK:

```typescript
import { PoolMetadata } from '@blend-capital/blend-sdk';

const network = {
  rpc: 'https://soroban-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015',
};

const poolAddress = 'CXXXXXXXXXX...'; // Your pool address

try {
  const metadata = await PoolMetadata.load(network, poolAddress);
  console.log('Pool found:', metadata);
  
  // For testnet V2 pools, wasmHash should be:
  // '6a7c67449f6bad0d5f641cfbdf03f430ec718faa85107ecb0b97df93410d1c43'
  
} catch (error) {
  console.error('Pool not found or invalid');
}
```

## What Happens Without a Real Pool Address

If you try to use the placeholder address, you'll get this error:

```
Error(Storage, MissingValue)
HostError: Error(Storage, MissingValue)

Value: Invoking contracts function to prepare simulation: sorobanTransaction simulation failed: trying to get non-existing value for contract instance
```

This means the contract doesn't exist on the network.

## Current Status

- ✅ All code is working correctly
- ✅ Transaction building is functional  
- ✅ Wallet integration works
- ✅ API endpoints are ready
- ✅ Frontend UI is complete
- ❌ **Blocked: Need real pool address from testnet**

Once you update the pool address, deposits and withdrawals will work immediately.

## Resources

- Blend Testnet App: https://testnet.blend.capital
- Blend Documentation: https://docs.blend.capital
- Blend GitHub: https://github.com/blend-capital
- Stellar Testnet: https://horizon-testnet.stellar.org

## Need Help?

If you can't find active pools on testnet:
1. Check the Blend Discord for testnet pool addresses
2. Look in the Blend GitHub discussions
3. Contact the Blend team for testnet pool recommendations
