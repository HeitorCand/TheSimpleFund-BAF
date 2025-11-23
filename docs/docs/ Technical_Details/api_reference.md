---
title: "API Reference"
sidebar_position: 3
---

# API Reference

Complete reference for The Simple Fund REST API.

**Base URL (Development):** `http://localhost:3001/api`  
**Base URL (Production):** `https://api.thesimplefund.com/api` (when deployed)


## Authentication

### POST /auth/register
Register a new user (Investor, Consultant, or Manager).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "INVESTIDOR"  // INVESTIDOR, CONSULTOR, GESTOR
}
```

**Response (201):**
```json
{
  "id": "clxyz123",
  "email": "user@example.com",
  "role": "INVESTIDOR",
  "status": "PENDING",
  "publicKey": "GXXXXXXX...",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### POST /auth/login
Authenticate and receive user details.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clxyz123",
    "email": "user@example.com",
    "role": "INVESTIDOR",
    "status": "APPROVED",
    "publicKey": "GXXXXXXX...",
    "totalInvested": 50000,
    "investorBadge": "SILVER"
  }
}
```

## Users

### GET /users/:id
Get user details by ID.

**Response (200):**
```json
{
  "id": "clxyz123",
  "email": "user@example.com",
  "role": "INVESTIDOR",
  "status": "APPROVED",
  "totalInvested": 50000,
  "investorBadge": "SILVER",
  "badgeProofHash": "0x...",
  "lastBadgeUpdate": "2025-11-20T12:00:00Z"
}
```

### GET /users
Get all users (with optional role filter).

**Query Parameters:**
- `role` (optional) - Filter by role: `INVESTIDOR`, `CONSULTOR`, `GESTOR`

**Response (200):**
```json
[
  {
    "id": "clxyz123",
    "email": "user@example.com",
    "role": "INVESTIDOR",
    "status": "APPROVED"
  }
]
```

## Funds

### POST /funds
Create a new fund (Managers only).

**Request Body:**
```json
{
  "name": "Agro Export FIDC",
  "symbol": "AGRO-EXP",
  "maxSupply": 10000,
  "targetAmount": 1000000,
  "description": "Fund focused on agricultural receivables",
  "fundType": "FIDC",
  "riskLevel": "MEDIO",
  "sector": "AGRO",
  "durationMonths": 12,
  "minTicket": 10000,
  "price": 1.0
}
```

**Response (201):**
```json
{
  "id": "fund-001",
  "name": "Agro Export FIDC",
  "symbol": "AGRO-EXP",
  "status": "PENDING",
  "tokenContractId": "CXXXXXXX...",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### GET /funds
List all funds with optional filters.

**Query Parameters:**
- `status` (optional) - `PENDING`, `APPROVED`, `ACTIVE`, `CLOSED`
- `fundType` (optional) - `FIDC`, `FII`, `AGRO`, `VAREJO`, `OUTROS`
- `sector` (optional) - `AGRO`, `VAREJO`, `TECH`, etc.
- `riskLevel` (optional) - `BAIXO`, `MEDIO`, `ALTO`

**Response (200):**
```json
[
  {
    "id": "fund-001",
    "name": "Agro Export FIDC",
    "symbol": "AGRO-EXP",
    "fundType": "FIDC",
    "riskLevel": "MEDIO",
    "sector": "AGRO",
    "status": "ACTIVE",
    "price": 1.05,
    "totalIssued": 5000,
    "maxSupply": 10000,
    "navPerShare": 1.08,
    "aum": 540000
  }
]
```

### GET /funds/:id
Get detailed fund information.

**Response (200):**
```json
{
  "id": "fund-001",
  "name": "Agro Export FIDC",
  "symbol": "AGRO-EXP",
  "cnpj": "12.345.678/0001-90",
  "cvmCode": "CVM1234",
  "fundType": "FIDC",
  "riskLevel": "MEDIO",
  "sector": "AGRO",
  "durationMonths": 12,
  "minTicket": 10000,
  "price": 1.05,
  "navPerShare": 1.08,
  "aum": 540000,
  "return12m": 8.5,
  "tokenContractId": "CXXXXXXX...",
  "vaultContractId": "CXXXXXXX...",
  "pools": [
    {
      "id": "pool-001",
      "blendPoolAddress": "CXXXXXXX...",
      "apy": 12.5,
      "totalDeposited": 500000,
      "yieldEarned": 15000
    }
  ]
}
```

## Orders

### POST /orders
Create a new investment order.

**Request Body:**
```json
{
  "fundId": "fund-001",
  "investorId": "clxyz123",
  "quantity": 100,
  "price": 1.05
}
```

**Response (201):**
```json
{
  "id": "order-001",
  "fundId": "fund-001",
  "investorId": "clxyz123",
  "quantity": 100,
  "price": 1.05,
  "total": 105,
  "status": "PENDING",
  "approvalStatus": "PENDING_APPROVAL",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### GET /orders
List orders (filtered by user).

**Query Parameters:**
- `investorId` (optional) - Filter by investor
- `fundId` (optional) - Filter by fund
- `status` (optional) - `PENDING`, `COMPLETED`, `FAILED`

**Response (200):**
```json
[
  {
    "id": "order-001",
    "fundId": "fund-001",
    "quantity": 100,
    "total": 105,
    "status": "COMPLETED",
    "approvalStatus": "APPROVED",
    "txHash": "0x...",
    "createdAt": "2025-11-22T10:00:00Z"
  }
]
```

## Recommendations

### GET /recommended-funds
Get personalized fund recommendations for an investor.

**Query Parameters:**
- `investorId` (required) - User ID of the investor

**Response (200):**
```json
[
  {
    "id": "fund-001",
    "name": "Agro Export FIDC",
    "symbol": "AGRO-EXP",
    "fundType": "FIDC",
    "sector": "AGRO",
    "riskLevel": "MEDIO",
    "score": 8,
    "reason": "Matches: fundType (FIDC), sector (AGRO), riskLevel (MEDIO)"
  }
]
```

**See:** [Recommendation System Documentation](./recommendation_system.md) for details.


### GET /investor-profile
Get investor preference profile.

**Query Parameters:**
- `investorId` (required)

**Response (200):**
```json
{
  "profile": {
    "preferredFundType": "FIDC",
    "preferredSector": "AGRO",
    "preferredRiskLevel": "MEDIO",
    "avgDuration": 12,
    "avgTicket": 15000
  }
}
```

## Fund Interactions

### POST /funds/:fundId/interactions
Track user interaction with a fund.

**Path Parameters:**
- `fundId` - Fund ID

**Request Body:**
```json
{
  "investorId": "clxyz123",
  "type": "FAVORITE"  // VIEW, CLICK, FAVORITE, START_ORDER
}
```

**Response (201):**
```json
{
  "ok": true,
  "interaction": {
    "id": "int-001",
    "type": "FAVORITE",
    "createdAt": "2025-11-22T10:30:00Z"
  }
}
```

### GET /funds/:fundId/interactions
Get all interactions for a fund (analytics).

**Response (200):**
```json
{
  "interactions": [...],
  "stats": {
    "total": 150,
    "byType": {
      "VIEW": 80,
      "CLICK": 40,
      "FAVORITE": 20,
      "START_ORDER": 10
    },
    "uniqueInvestors": 45
  }
}
```

## Pools (Blend Integration)

### POST /pools
Create a new Blend lending pool for a fund.

**Request Body:**
```json
{
  "fundId": "fund-001",
  "name": "FIDC Agro Pool",
  "blendPoolAddress": "CXXXXXXX...",
  "assetAddress": "CXXXXXXX..."
}
```

**Response (201):**
```json
{
  "id": "pool-001",
  "fundId": "fund-001",
  "blendPoolAddress": "CXXXXXXX...",
  "status": "ACTIVE",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### POST /pools/:id/deposit
Deposit funds into a Blend pool.

**Request Body:**
```json
{
  "amount": 100000
}
```

**Response (200):**
```json
{
  "ok": true,
  "pool": {
    "id": "pool-001",
    "totalDeposited": 100000,
    "depositTxHash": "0x..."
  }
}
```

### POST /pools/:id/withdraw
Withdraw funds from a Blend pool.

**Request Body:**
```json
{
  "amount": 50000
}
```

**Response (200):**
```json
{
  "ok": true,
  "pool": {
    "id": "pool-001",
    "currentBalance": 50000,
    "withdrawTxHash": "0x..."
  }
}
```

### GET /pools/:id
Get pool status and metrics.

**Response (200):**
```json
{
  "id": "pool-001",
  "fundId": "fund-001",
  "blendPoolAddress": "CXXXXXXX...",
  "totalDeposited": 100000,
  "currentBalance": 115000,
  "yieldEarned": 15000,
  "apy": 12.5,
  "status": "ACTIVE",
  "lastYieldUpdate": "2025-11-22T09:00:00Z"
}
```

## Badges (ZK Investor Tiers)

### POST /badges/update
Update investor badge based on total invested.

**Request Body:**
```json
{
  "userId": "clxyz123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": "clxyz123",
    "totalInvested": 75000,
    "investorBadge": "GOLD",
    "badgeProofHash": "0x...",
    "lastBadgeUpdate": "2025-11-22T10:00:00Z"
  }
}
```

**Badge Thresholds:**
- `NONE` - $0
- `BRONZE` - $10,000+
- `SILVER` - $50,000+
- `GOLD` - $100,000+
- `DIAMOND` - $500,000+

### GET /badges/:userId
Get investor badge information.

**Response (200):**
```json
{
  "userId": "clxyz123",
  "totalInvested": 75000,
  "investorBadge": "GOLD",
  "badgeProofHash": "0x...",
  "lastBadgeUpdate": "2025-11-22T10:00:00Z"
}
```

## Cedentes (Originators)

### POST /cedentes
Create a new cedente (Consultants only).

**Request Body:**
```json
{
  "name": "Agro Corp Ltda",
  "document": "12.345.678/0001-90",
  "fundId": "fund-001",
  "consultorId": "clcons123"
}
```

**Response (201):**
```json
{
  "id": "ced-001",
  "name": "Agro Corp Ltda",
  "status": "PENDING",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### GET /cedentes
List cedentes (filtered by fund or consultant).

**Query Parameters:**
- `fundId` (optional)
- `consultorId` (optional)
- `status` (optional) - `PENDING`, `APPROVED`, `REJECTED`

## Sacados (Debtors)

### POST /sacados
Create a new sacado (Consultants only).

**Request Body:**
```json
{
  "name": "Retail Chain S.A.",
  "document": "98.765.432/0001-10",
  "fundId": "fund-001",
  "consultorId": "clcons123"
}
```

**Response (201):**
```json
{
  "id": "sac-001",
  "name": "Retail Chain S.A.",
  "status": "PENDING",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### GET /sacados
List sacados (filtered by fund or consultant).

## Receivables

### POST /receivables
Register a new receivable.

**Request Body:**
```json
{
  "fundId": "fund-001",
  "sacadoId": "sac-001",
  "faceValue": 50000,
  "dueDate": "2026-01-15"
}
```

**Response (201):**
```json
{
  "id": "rec-001",
  "faceValue": 50000,
  "dueDate": "2026-01-15",
  "status": "PENDING",
  "createdAt": "2025-11-22T10:00:00Z"
}
```

### GET /receivables
List receivables with filters.

**Query Parameters:**
- `fundId` (optional)
- `sacadoId` (optional)
- `status` (optional) - `PENDING`, `PAID`, `DISTRIBUTED`


## Stellar Integration

### POST /stellar/build-transaction
Build a Stellar transaction for signing.

**Request Body:**
```json
{
  "sourceAccount": "GXXXXXXX...",
  "operations": [...]
}
```

### POST /stellar/submit-transaction
Submit a signed transaction to Stellar.

**Request Body:**
```json
{
  "signedXdr": "AAAAAA..."
}
```

## External Integrations

### CoinGecko (Price Feeds)

**What is CoinGecko?** CoinGecko is a leading cryptocurrency data aggregator providing real-time price feeds, market data, and historical charts for thousands of digital assets.

**Why we use it:** Since our platform operates on Stellar blockchain with XLM as the native asset, we need reliable USD price conversion for investor dashboards and reporting. CoinGecko provides accurate, real-time XLM/USD rates that allow investors to view fund performance in familiar fiat currency while all on-chain operations remain in XLM.

The platform integrates with CoinGecko API to fetch real-time XLM to USD conversion rates.

**Use Cases:**
- Convert fund prices from XLM to USD for display
- Calculate NAV and AUM in fiat currency
- Track portfolio value in multiple currencies
- Historical price data for performance metrics

**Integration Details:**
- **Endpoint:** CoinGecko Public API v3
- **Asset:** Stellar (XLM)
- **Update Frequency:** Configurable (default: every 5 minutes)
- **Caching:** Redis/in-memory cache to reduce API calls

**Example Response (Internal):**
```json
{
  "xlm_usd_price": 0.12,
  "last_updated": "2025-11-22T10:00:00Z",
  "source": "coingecko"
}
```

**Backend Implementation:**
- Background job fetches price periodically
- Cached value used for all conversions
- Fallback to last known price if API fails
- Logged for audit trail

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Conclusion

This API reference provides comprehensive documentation for all endpoints available in The Simple Fund platform, covering authentication, fund management, investment orders, personalized recommendations, Blend DeFi pool integration, and ZK investor badges. The API is designed with RESTful principles, offering clear request/response patterns and consistent error handling across all operations. Integration with external services like CoinGecko for price feeds and Stellar blockchain for on-chain operations ensures real-time, transparent, and secure fund management. Developers can leverage these endpoints to build robust applications that deliver institutional-grade receivables tokenization with intelligent investor experiences and DeFi-powered yield generation.

