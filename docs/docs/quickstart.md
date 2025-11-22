---
title: "Quick Start Guide"
sidebar_position: 7
---

# Quick Start Guide

## Project Overview

**The Simple Fund** is a blockchain-powered platform built on Stellar that transforms traditional receivables funds into transparent, liquid, and globally accessible investments. The platform connects investors, fund managers, and consultants with innovative features:

### Key Features

- **For Investors**: 
  - Browse and invest in tokenized funds with **AI-powered recommendations** based on your profile
  - Track portfolio with **real-time NAV/APY from Blend DeFi pools**
  - Earn **privacy-preserving ZK investor badges** (Bronze, Silver, Gold, Diamond)
  - Non-custodial wallet integration (Freighter)

- **For Fund Managers**: 
  - Approve funds, users, and monitor platform activities
  - Manage **Blend lending pools** for on-chain yield generation
  - Real-time pricing with **CoinGecko XLM/USD feeds**

- **For Consultants**: 
  - Create funds and manage client relationships
  - Register assignors (cedentes) and debtors (sacados)

## How to Run Locally

### Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v16 or later)
- npm (v7 or later)
- Git

### Backend (API)

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/HeitorCand/TheSimpleFund-BAF.git
   cd TheSimpleFund-BAF
   ```

2. Navigate to the backend folder:
   ```bash
   cd apps/api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up the database:
   ```bash
   # Create the database structure
   npx prisma migrate deploy
   
   # Generate Prisma client
   npx prisma generate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`. You can test it by accessing `http://localhost:3001/health` in your browser, which should return a status indicating the API is running.

**Note:** The API includes:
- RESTful endpoints for funds, orders, users, recommendations
- Stellar blockchain integration (Soroban smart contracts)
- Blend Protocol pool management
- CoinGecko price feed integration

### Frontend (Web)

1. Open a new terminal window and navigate to the frontend folder from the project root:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

**The frontend features:**
- React + Vite + Tailwind CSS
- Freighter wallet integration (non-custodial)
- AI-powered fund recommendation engine
- Real-time portfolio tracking with Blend APY
- ZK investor badge display

### Demo Accounts

The application comes with pre-configured demo accounts you can use:

| Role | Email | Password |
|------|-------|----------|
| Consultant | consultor@vero.com | 123456 |
| Fund Manager | gestor@vero.com | 123456 |
| Investor | investidor@vero.com | 123456 |

## Deployed Demo

You can also access the deployed version without setting up locally:

👉 [https://the-simple-fund-baf.vercel.app/](https://the-simple-fund-baf.vercel.app/)

The deployed version contains the same features and demo accounts as the local setup. It's ideal for quickly exploring the platform without installation.


## What to Explore

### 1. **AI Recommendations** (Investors)
- Login as investor and browse funds
- System analyzes your interaction history (views, clicks, favorites)
- Personalized fund suggestions based on risk level, sector, and fund type

### 2. **Blend DeFi Integration** (Fund Managers)
- View fund pools with real-time APY and yield data
- See how idle capital generates returns through Stellar DeFi

### 3. **ZK Investor Badges** (All Users)
- Check your investor tier (None → Bronze → Silver → Gold → Diamond)
- Privacy-preserving proof of investment level
- Future: tier-based benefits and exclusive access

### 4. **Real-Time Pricing** (All Users)
- XLM to USD conversion via CoinGecko
- Live NAV and AUM calculations
- Portfolio value in familiar fiat currency


## Next Steps

After exploring the demo:

1. **Read the Technical Documentation**:
   - [Architecture Overview](./%20Technical_Details/Architecture.md) - System design and AWS infrastructure
   - [Smart Contracts](./%20Technical_Details/smart_contracts.md) - FundToken, ReceivableVault, Blend integration
   - [Recommendation System](./%20Technical_Details/recommendation_system.md) - AI algorithm details
   - [API Reference](./%20Technical_Details/api_reference.md) - Complete endpoint documentation

2. **Understand the Technology Stack**:
   - Stellar blockchain with Soroban smart contracts
   - Blend Protocol for DeFi yield
   - CoinGecko for price feeds
   - PostgreSQL (production) / SQLite (development)

3. **Try Advanced Features**:
   - Create new funds with different risk profiles
   - Interact with funds to build your investor profile
   - Monitor real-time pool performance

## Need Help?

- **Technical Issues**: Check the [Architecture documentation](./%20Technical_Details/Architecture.md)
- **API Questions**: See the [API Reference](./%20Technical_Details/api_reference.md)
- **General Questions**: Review the [Project Overview](./intro.md)

