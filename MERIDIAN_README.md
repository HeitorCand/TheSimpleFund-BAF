# The Simple Fund (TSF)

![TSF Logo](/docs/static/img/TSF.svg)

To access the entire documentation, [Click Here](https://miguelclaret.github.io/TheSimpleFund/)

## 📋 Table of Contents
- [Overview](#overview)
- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Demo](#demo)
- [Installation & Setup](#installation--setup)
- [Roadmap](#roadmap)
- [Team](#team)
- [Impact & Value](#impact--value)

## Overview

**The Simple Fund** is a blockchain-powered platform that transforms traditional receivables funds into transparent, liquid, and globally accessible investments. Built on the Stellar blockchain, it addresses significant inefficiencies in the receivables financing market by tokenizing fund shares, automating distributions, and providing immediate liquidity.

Every year, trillions of dollars in receivables get trapped in slow, manual processes—capital that could fuel growth but instead disappears into back-office inefficiencies. Our solution migrates the entire fund cycle onto the Stellar blockchain, turning fund shares into digital tokens that can be traded instantly on the Stellar Decentralized Exchange (DEX).

![Solution Understanding Diagram](/docs/static/img/img2.png)

## Problem & Solution

### The Problem

* **$0.32 lost per $1,000** of revenue due to outdated data and manual errors
* **$13** to process a single invoice
* **3 weeks** average settlement time per operation
* **$7.2 million/year** in costs for large funds
* **Minimal liquidity** for investors with long lock-ups

### The Solution

**The Simple Fund** addresses these inefficiencies through:

1. **Tokenization** — Converting fund shares into fungible Stellar tokens
2. **On-Chain Registry** — Transparent registration of assignors and debtors
3. **Automated Distribution** — Smart contracts for seamless proportional returns
4. **Global Liquidity** — Instant trading capabilities on the Stellar DEX

The result is a fast, auditable, and scalable B2B SaaS model for fund managers.

## Key Features

- **For Fund Managers**:
  - Real-time dashboards replace manual reconciliation
  - "Hard freeze" functionality for one-click issuance and transfer control
  - On-chain compliance and audit trails

- **For Investors**:
  - Tokenized shares stored in personal wallets
  - Public issuance history and transparent fund performance
  - Immediate secondary liquidity through the Stellar DEX

- **For Consultants**:
  - 100% digital onboarding with auditable approval trails
  - Streamlined assignor and debtor registration
  - Transparent fund creation process

## Architecture

The Simple Fund connects key players in the receivables market through blockchain:

- **Assignor (Originator)** — Generates receivables and sells them to the fund for immediate capital
- **Debtor (Payer)** — Responsible for paying the receivable at maturity
- **Fund Manager (DTVM)** — Creates and manages funds, approves registrations
- **Consultant** — Introduces new assignors and debtors to the fund
- **Investor** — Purchases tokenized fund shares and receives proportional returns

![User Flow](/docs/static/img/img1.png)

With Stellar's capacity to process transactions in ~5 seconds at a cost of $0.00001, The Simple Fund enables micro-operations on a global scale.

## Demo

### Live Demo

👉 [Access the deployed demo](https://the-simple-fund-7kbnhjy0v-miguelclarets-projects.vercel.app)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Consultant | consultor@vero.com | 123456 |
| Fund Manager | gestor@vero.com | 123456 |
| Investor | investidor@vero.com | 123456 |

## Installation & Setup

### Prerequisites

Before running the application, make sure you have:
- Node.js (v16 or later)
- npm (v7 or later)
- Git

### Backend (API)

```bash
# Clone the repository
git clone https://github.com/MiguelClaret/Teambalaie.git
cd Teambalaie

# Navigate to the backend folder
cd apps/api

# Install dependencies
npm install

# Set up the database
npx prisma migrate deploy
npx prisma generate

# Seed the database (optional but recommended)
node scripts/seed-test-data.js

# Start the backend server
npm run dev
```

The API will be available at `http://localhost:3000`.

### Frontend (Web)

```bash
# Navigate to the frontend folder
cd apps/web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The web application will be available at `http://localhost:5173`.

## Roadmap

Our development roadmap spans from Q3 2025 to Q3 2026:

### Q3 2025: Project Kickoff
- Establish basic platform architecture
- Tokenize receivables funds on Stellar
- Develop initial smart contracts
- Implement interfaces for all user types

### Q4 2025: Expansion
- Refine UX based on user feedback
- Enable share trading on Stellar DEX
- Develop on-chain debtor payments using Lumens (XLM)
- Adapt for global regulations

### Q1 2026: Global Compliance
- Complete integration of global regulations
- Full implementation of on-chain payments
- Expand international user base

### Q2-Q3 2026: Global Adoption
- Support multiple currencies and tokens
- Integrate with DeFi solutions
- Scale to manage billions in transactions

## Team

**Team Balaiê** consists of five technology students from Inteli – Institute of Technology and Leadership in Brazil:

- **Mariana de Paula** — Lead / PM + Blockchain Developer
- **Miguel Claret** — Frontend Developer
- **Cecília Galvão** — Blockchain Developer
- **Heitor Candido** — Backend Developer
- **Pablo Azevedo** — Frontend Developer + Videomaker

## Impact & Value

The Simple Fund is positioned to transform the receivables financing market (expected to grow from USD 400 billion to USD 700 billion by 2032) by:

- **Reducing operational costs** through automation and blockchain efficiency
- **Providing immediate liquidity** for traditionally locked investments
- **Creating transparency** with immutable on-chain records
- **Enabling global access** to previously restricted investment opportunities

By combining tokenization, smart contracts, and the Stellar blockchain, The Simple Fund sets a new standard for transparency, efficiency, and accessibility in the receivables fund market.

---

© 2025 Team Balaiê. All Rights Reserved.
