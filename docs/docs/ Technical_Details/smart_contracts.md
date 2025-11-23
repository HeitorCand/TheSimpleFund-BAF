---
title: "Smart Contracts Details"
sidebar_position: 2
---

# Smart Contracts Details

Our platform leverages two main Soroban smart contracts to enable secure, auditable, and role-based management of tokenized receivables funds on Stellar:

## FundToken Contract

The `FundToken` contract is a custom fungible token implementation designed for representing fund shares with advanced governance and compliance features.

**Key Features:**
- **Initialization:**
  - Sets admin, name, symbol, decimals, and max supply.
  - Ensures only one-time setup and valid parameters.
- **Whitelist (KYC/AML):**
  - Only whitelisted addresses can receive tokens.
  - Admin can add or remove addresses from the whitelist.
  - Emits events for whitelist changes.
- **Minting:**
  - Only admin can mint new tokens, up to the max supply.
  - Minting is only allowed for whitelisted addresses.
  - Emits events for mint operations.
- **Transfers:**
  - Only allowed if the contract is not paused.
  - Only to whitelisted addresses.
  - Checks for sufficient balance and emits transfer events.
- **Pause/Unpause:**
  - Admin can pause or unpause all token operations for security.
- **Views:**
  - Query balance, total supply, max supply, decimals, name, symbol, admin, and paused status.
- **Security:**
  - All admin actions require authentication.
  - Arithmetic is checked for overflow/underflow.

## ReceivableVault Contract

The `ReceivableVault` contract manages the registration, approval, and distribution of receivables linked to specific funds and their token contracts.

**Key Features:**
- **Initialization & Roles:**
  - Sets admin and links to a specific FundToken contract.
  - Admin can whitelist consultants who can propose new entities and funds.
- **Entity Management:**
  - Consultants can submit new Cedentes (originators), Sacados (debtors), and Funds for approval.
  - Admin approves or rejects each entity, updating their status.
- **Receivable Registration:**
  - Admin can register new receivables, linking them to approved funds, cedentes, and sacados.
  - Validates all references and statuses before registration.
- **Receivable Payment:**
  - Admin can mark a receivable as paid, recording the amount and timestamp.
  - Tracks total paid amounts.
- **Pro-rata Distribution:**
  - After payment, admin can trigger distribution to a list of holders.
  - Uses cross-contract call to FundToken to get each holder's balance.
  - Distributes paid amount proportionally to holders' shares, handling rounding residue.
  - Emits events for each distribution and residue.
- **Views:**
  - Query receivables, counts, total paid, fund token address, and admin.
- **Security:**
  - All admin and consultant actions require authentication.
  - Checks for duplicate IDs, valid statuses, and safe math.

## Stellar Integration

Our platform leverages the Stellar blockchain as the foundation for all on-chain operations:

- **Tokenization:** Fund shares are represented as custom tokens on Stellar, managed by the FundToken contract.
- **Smart Contracts:** All business logic for fund governance, whitelisting, receivable registration, and pro-rata distribution is implemented as Soroban smart contracts deployed on Stellar Testnet (compatible with Mainnet).
- **Wallets:** Each user (manager, consultant, investor) has a Stellar wallet generated during onboarding. All balances, transfers, and distributions are visible and auditable on-chain.
- **Transactions:** Minting, transfers, and distributions are executed as Stellar transactions, with events emitted for full traceability.
- **Compliance:** Whitelisting and role-based access are enforced at the contract level, ensuring only authorized and KYC'd users can interact with fund tokens.
- **Integration:** The backend communicates with Stellar via Horizon API and Soroban RPC for contract deployment and invocation, while the frontend displays real-time on-chain data to users.

### Blend Protocol Integration

**What is Blend?** Blend is a DeFi lending protocol on Stellar that enables isolated lending pools with competitive yields. Unlike traditional finance where fund capital sits idle, Blend allows funds to earn passive income by lending assets on-chain while maintaining full liquidity and transparency.

**Why we use it:** Integrating Blend solves a critical problem in receivables funds—capital efficiency. Between receivable purchases, fund capital can generate additional yield through Blend pools, increasing overall returns for investors without additional risk exposure. Each fund has its own isolated pool, ensuring risk segregation.

Each fund can have one or more **isolated Blend lending pools** to generate on-chain yield:

**Pool Architecture:**
- Each pool is linked to a specific fund via `fundId`
- Pools hold deposited capital in Stellar assets (USDC, XLM, etc.)
- Yield is earned through Blend's lending protocol
- NAV (Net Asset Value) is calculated as: `totalDeposited + yieldEarned`

**Pool Operations:**
1. **Deposit** - Fund manager deposits capital into Blend pool
   - Transaction recorded in `depositTxHash`
   - `totalDeposited` and `currentBalance` updated
   
2. **Yield Accrual** - Background job syncs pool balance
   - Fetches current balance from Blend
   - Calculates `yieldEarned = currentBalance - totalDeposited`
   - Updates `apy` based on time-weighted returns
   
3. **Withdraw** - Fund manager withdraws capital for redemptions
   - Transaction recorded in `withdrawTxHash`
   - `currentBalance` updated

**NAV Impact:**
- Fund's `navPerShare` reflects pool yield performance
- Investors benefit from on-chain DeFi returns
- All yield calculations are transparent and verifiable

**Database Model:**
```prisma
model Pool {
  id                  String
  fundId              String
  blendPoolAddress    String   // Blend pool contract address
  assetAddress        String   // Underlying asset (USDC, XLM)
  totalDeposited      Float
  currentBalance      Float    // deposits + yield
  yieldEarned         Float
  apy                 Float?
  status              String   // ACTIVE, PAUSED, CLOSED
  depositTxHash       String?
  withdrawTxHash      String?
  lastYieldUpdate     DateTime?
}
```

**API Endpoints:**
- `POST /api/pools` - Create new pool
- `POST /api/pools/:id/deposit` - Deposit into pool
- `POST /api/pools/:id/withdraw` - Withdraw from pool
- `GET /api/pools/:id` - Get pool status and metrics

**Isolation Benefits:**
- Each fund has independent risk exposure
- Pool failures don't affect other funds
- Transparent per-fund yield tracking

### Zero-Knowledge Badge System

**What are ZK Proofs?** Zero-Knowledge proofs allow investors to prove they belong to a specific investment tier (e.g., "I invested over $50k") without revealing their exact investment amount. This cryptographic technique ensures privacy while maintaining verifiable credentials.

**Why we use it:** Traditional platforms expose investor wealth publicly, creating privacy and security risks. Our ZK badge system enables social proof and tier-based benefits (early access, reduced fees) while protecting sensitive financial information. Investors can showcase their commitment level without revealing exact portfolio values.

Investors earn **privacy-preserving tier badges** based on total investment amount:

**Badge Tiers:**
- **NONE** - No investments yet
- **BRONZE** - $10,000+ invested
- **SILVER** - $50,000+ invested
- **GOLD** - $100,000+ invested
- **DIAMOND** - $500,000+ invested

**Privacy Mechanism:**
- Each badge tier has a **ZK proof hash** stored on-chain
- Investors can prove their tier without revealing exact investment amount
- Proof is generated off-chain and verified on-chain

**Database Fields (User model):**
```prisma
model User {
  totalInvested   Float    @default(0)
  investorBadge   String   @default("NONE")
  badgeProofHash  String?  // ZK proof for tier verification
  lastBadgeUpdate DateTime?
}
```

**Badge Update Flow:**
1. Investor completes order → `totalInvested` increases
2. Background job checks if tier threshold crossed
3. If tier upgraded:
   - Generate ZK proof hash
   - Update `investorBadge` and `badgeProofHash`
   - Set `lastBadgeUpdate` timestamp

**Benefits:**
- **Social Proof** - Higher tiers signal commitment and reputation
- **Privacy** - Exact amounts remain confidential
- **Gamification** - Encourages larger investments
- **Exclusive Access** - Future features can be tier-gated (early access, lower fees, etc.)

**API Endpoints:**
- `POST /api/badges/update` - Recalculate and update badge
- `GET /api/badges/:userId` - Get current badge info

**Future Enhancements:**
- On-chain verification via Soroban smart contract
- NFT badges minted on Stellar
- Tier-based benefits (reduced fees, priority access)
- Public leaderboard with anonymized rankings

This approach ensures transparency, security, and interoperability for all fund operations, leveraging Stellar's speed and low transaction costs, Blend's DeFi yield generation, and privacy-preserving badge verification.

