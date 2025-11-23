# Plataforma de Fundos Tokenizados em Stellar - Demo MVP

## 🎯 Resumo do Projeto
Plataforma completa para tokenização de fundos de investimento usando blockchain Stellar/Soroban, desenvolvida em 24 horas para hackathon.

## 🏗️ Arquitetura Implementada

### Frontend (React + Vite + TypeScript)
- **URL**: http://localhost:5173
- **Dashboards por perfil**:
  - Consultor: Cadastro e análise de recebíveis
  - Gestor: Aprovação, emissão e gestão de fundos
  - Investidor: Compra de tokens e acompanhamento

### Backend (Node.js + Fastify + TypeScript)
- **URL**: http://localhost:3001
- **Database**: SQLite com Prisma ORM
- **APIs implementadas**: Auth, Funds, Orders, Receivables, Stellar

### Blockchain (Stellar/Soroban)
- **Rede**: Stellar Testnet
- **Contratos deployados**:
  - FundToken: `CCLU7JCLZ7A4ZNUM46GLOBERIQ4QN36SCFTPXQH6KZCE4NBSUTFVLYXY`
  - ReceivableVault: `CCFMTLYIEQLQ44NQM4XBXVOACEC66WTDL5LLV57O2FUYTFQYURWLRBLN`

## 🔑 Credenciais de Teste
- **Consultor**: consultor@vero.com.br / 123456
- **Gestor**: gestor@vero.com.br / 123456  
- **Investidor**: investidor@vero.com.br / 123456

## 🚀 Fluxo Completo Demonstrado

### 1. Cadastro de Recebível (Consultor)
```bash
curl -X POST http://localhost:3001/api/receivables \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CONSULTOR" \
  -d '{
    "faceValue": 100000,
    "dueDate": "2025-12-31",
    "debtorId": "cedente_id",
    "description": "Recebível de prestação de serviços"
  }'
```

### 2. Criação de Fundo (Gestor)
```bash
curl -X POST http://localhost:3001/api/funds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_GESTOR" \
  -d '{
    "name": "FIDC Teste Blockchain 2025",
    "symbol": "TEST25",
    "description": "Fundo para teste do fluxo completo",
    "targetAmount": 1000000,
    "unitPrice": 100,
    "maxSupply": 10000
  }'
```

### 3. Deploy de Contrato Soroban
```bash
curl -X POST http://localhost:3001/api/stellar/deploy-contract \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "CHAVE_GESTOR",
    "wasmHash": "hash_do_contrato",
    "contractType": "fund-token"
  }'
```

### 4. Inicialização do Token
```bash
curl -X POST http://localhost:3001/api/stellar/initialize-fund-token \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "CHAVE_ADMIN",
    "contractId": "CCLU7JCLZ7A4ZNUM46GLOBERIQ4QN36SCFTPXQH6KZCE4NBSUTFVLYXY",
    "tokenName": "FIDC Teste Blockchain 2025",
    "tokenSymbol": "TEST25",
    "initialSupply": 0,
    "maxSupply": 10000
  }'
```

### 5. Whitelist de Investidor
```bash
curl -X POST http://localhost:3001/api/stellar/add-to-whitelist \
  -H "Content-Type: application/json" \
  -d '{
    "adminSecretKey": "CHAVE_ADMIN",
    "contractId": "CCLU7JCLZ7A4ZNUM46GLOBERIQ4QN36SCFTPXQH6KZCE4NBSUTFVLYXY",
    "userPublicKey": "CHAVE_PUBLICA_INVESTIDOR"
  }'
```

### 6. Mint de Tokens
```bash
curl -X POST http://localhost:3001/api/stellar/mint-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "adminSecretKey": "CHAVE_ADMIN",
    "contractId": "CCLU7JCLZ7A4ZNUM46GLOBERIQ4QN36SCFTPXQH6KZCE4NBSUTFVLYXY",
    "recipientPublicKey": "CHAVE_PUBLICA_INVESTIDOR",
    "amount": 1000
  }'
```

## 📋 Funcionalidades Implementadas

### ✅ Stellar Integration
- [x] Geração de chaves Stellar
- [x] Funding de contas testnet
- [x] Deploy de contratos Soroban
- [x] Inicialização de tokens
- [x] Sistema de whitelist
- [x] Mint de tokens
- [x] Registro de recebíveis
- [x] Processamento de pagamentos
- [x] Distribuição de rendimentos

### ✅ Backend APIs
- [x] Autenticação JWT
- [x] CRUD completo de fundos
- [x] Gestão de recebíveis
- [x] Sistema de ordens
- [x] Integração Soroban completa

### ✅ Frontend Dashboards
- [x] Dashboard do Consultor
- [x] Dashboard do Gestor
- [x] Dashboard do Investidor
- [x] Sistema de autenticação
- [x] Interfaces para blockchain

## 🔧 Como Executar

### 1. Backend
```bash
cd apps/api
npm install
npm run db:seed
npm run dev
```

### 2. Frontend
```bash
cd apps/new_web
npm install
npm run dev
```

### 3. Acessar
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎯 Próximos Passos
1. Integração com Soroban RPC real
2. Implementação de testes automatizados
3. Deploy em produção
4. Integração com Freighter wallet
5. Interface de admin para contratos

## 📊 Métricas do MVP
- **Tempo de desenvolvimento**: 24 horas
- **Contratos deployados**: 2 (testnet)
- **Endpoints API**: 15+
- **Telas frontend**: 6
- **Funcionalidades blockchain**: 9

---

**Status**: ✅ MVP Completo e Funcional
**Última atualização**: 15/09/2025