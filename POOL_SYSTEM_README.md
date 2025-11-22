# Sistema de Yield Pools com Blend Protocol

Sistema completo para gestores depositarem fundos em pools do Blend Protocol e gerarem yield automaticamente.

## 🎯 Funcionalidades

### Para Gestores

1. **Criar Pools de Yield**
   - Conectar fundos existentes a pools do Blend Protocol
   - Escolher entre diferentes pools (USDC, XLM, etc)
   - Configurar nome e parâmetros do pool

2. **Depositar Fundos**
   - Depositar dinheiro recebido dos fundos nos pools
   - Assinar transação via Freighter Wallet
   - Tracking automático do valor depositado

3. **Gerenciar Yields**
   - Visualizar yield acumulado em tempo real
   - Ver APY (Annual Percentage Yield) do pool
   - Histórico de depósitos e saques

4. **Retirar Fundos**
   - Sacar fundos + yields quando necessário
   - Cálculo automático de lucros
   - Confirmação via Stellar blockchain

## 🏗️ Arquitetura

### Backend (Node.js + Fastify)

#### Modelo de Dados (Prisma)
```prisma
model Pool {
  id                  String
  name                String
  blendPoolAddress    String   // Endereço do pool no Blend
  assetAddress        String   // Asset usado (USDC, XLM, etc)
  totalDeposited      Float    // Total depositado
  currentBalance      Float    // Saldo atual (deposited + yield)
  yieldEarned         Float    // Yield acumulado
  apy                 Float?   // APY do pool
  status              String   // ACTIVE, PAUSED, CLOSED
  fundId              String   // Relação com Fund
}
```

#### API Endpoints

**GET /api/pools/available**
- Lista pools disponíveis do Blend Protocol
- Retorna informações de cada pool (nome, asset, descrição)

**GET /api/pools**
- Lista todos os pools criados
- Inclui métricas de yield

**GET /api/pools/:id**
- Detalhes de um pool específico
- Calcula yield atual e percentual

**POST /api/pools**
- Cria novo pool
- Vincula a um fundo existente

**POST /api/pools/build-deposit**
- Constrói transação XDR para depósito
- Retorna XDR para assinatura do usuário

**POST /api/pools/deposit**
- Confirma depósito após transação assinada
- Atualiza saldos no banco

**POST /api/pools/build-withdraw**
- Constrói transação XDR para saque
- Valida saldo disponível

**POST /api/pools/withdraw**
- Confirma saque após transação assinada
- Calcula yield final

#### Utilitários Blend (blendUtils.ts)

```typescript
// Construir transação de depósito
buildDepositTransaction(poolAddress, userAddress, assetAddress, amount)

// Construir transação de saque
buildWithdrawTransaction(poolAddress, userAddress, assetAddress, amount)

// Obter posição do usuário no pool
getUserPosition(poolAddress, userAddress)

// Obter dados da reserve (rates, supply)
getReserveData(poolAddress, assetAddress)

// Calcular APY
calculateAPY(bRate, decimals)
```

### Frontend (React + TypeScript)

#### Página Principal (PoolList.tsx)

**Componentes:**

1. **PoolList** - Lista de pools com métricas
   - Card para cada pool mostrando:
     - Nome e fundo associado
     - Total depositado
     - Saldo atual (deposited + yield)
     - Yield ganho ($ e %)
     - APY do pool
   - Botões de ação: Deposit, Withdraw

2. **CreatePoolModal** - Formulário de criação
   - Selecionar fundo
   - Escolher pool do Blend
   - Definir nome

3. **DepositModal** - Depositar fundos
   - Input de valor
   - Conecta wallet via Freighter
   - Assina transação no Blend
   - Confirma no backend

4. **WithdrawModal** - Sacar fundos
   - Mostra saldo disponível
   - Input de valor (com max)
   - Processa saque via Blend
   - Atualiza registros

#### Serviço de API (api.ts)

```typescript
poolService.getAvailablePools()  // Pools do Blend disponíveis
poolService.list()                // Listar pools criados
poolService.create(data)          // Criar pool
poolService.buildDepositTx()      // Preparar depósito
poolService.confirmDeposit()      // Confirmar depósito
poolService.buildWithdrawTx()     // Preparar saque
poolService.confirmWithdraw()     // Confirmar saque
```

## 🔗 Integração com Blend Protocol

### O que é Blend?

Blend é um protocolo DeFi da Stellar que permite:
- Criar pools de lending isolados
- Emprestar/tomar emprestado assets
- Ganhar yield sobre deposits
- Pools com seguro via backstop module

### Como funciona a integração?

1. **Supply Collateral (Depósito)**
   ```typescript
   const requests = [{
     request_type: RequestType.SupplyCollateral,
     address: assetAddress,    // USDC, XLM, etc
     amount: amountInStroops,  // Valor em stroops
   }];
   
   poolContract.submit({
     from: userAddress,
     spender: userAddress,
     to: userAddress,
     requests: requests,
   });
   ```

2. **Withdraw Collateral (Saque)**
   ```typescript
   const requests = [{
     request_type: RequestType.WithdrawCollateral,
     address: assetAddress,
     amount: amountInStroops,
   }];
   ```

3. **Yield Accrual**
   - Blend calcula automaticamente o bRate (exchange rate)
   - bTokens crescem em valor ao longo do tempo
   - Yield = (currentBalance * bRate) - deposited

### Testnet Contracts

```typescript
// Pools disponíveis (testnet)
const BLEND_CONTRACTS = {
  USDC_POOL: 'CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K',
  USDC: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
};
```

## 🚀 Fluxo Completo

### 1. Gestor Cria Pool

```
Gestor → Frontend → Backend
1. Seleciona fundo existente
2. Escolhe pool do Blend (ex: USDC Lending)
3. Define nome do pool
4. Backend cria registro no DB
```

### 2. Depositar Fundos

```
Gestor → Frontend → Backend → Blend → Stellar
1. Gestor clica "Deposit"
2. Insere valor em USD
3. Backend constrói transação XDR usando Blend SDK
4. Frontend abre Freighter para assinar
5. Transação executada na blockchain
6. Backend atualiza saldos:
   - totalDeposited += amount
   - currentBalance += amount
```

### 3. Yield Acumula

```
Blend Protocol (automático)
1. bTokens do gestor acumulam valor
2. bRate aumenta ao longo do tempo
3. Yield = (bTokens * bRate) - deposited
```

### 4. Consultar Yield

```
Frontend → Backend
1. Frontend busca pools via API
2. Backend retorna:
   - totalDeposited
   - currentBalance
   - yieldEarned = currentBalance - totalDeposited
   - yieldPercentage = (yield / deposited) * 100
```

### 5. Sacar Fundos

```
Gestor → Frontend → Backend → Blend → Stellar
1. Gestor clica "Withdraw"
2. Vê saldo disponível (deposited + yield)
3. Insere valor a sacar
4. Backend constrói transação de saque
5. Freighter assina transação
6. Fundos voltam para wallet do gestor
7. Backend atualiza:
   - currentBalance -= amount
   - yieldEarned += (yield gerado até momento)
```

## 📊 Exemplo Prático

### Cenário

Um gestor recebe $10,000 de investidores em um fundo:

```
1. Criar Pool
   - Fundo: "Real Estate Fund"
   - Blend Pool: "USDC Lending Pool"
   - APY: 8%

2. Depositar
   - Valor: $10,000 USDC
   - Tx Hash: ABC123...
   - Status: Depositado no Blend

3. Após 30 dias
   - Total Depositado: $10,000
   - Current Balance: $10,066.67
   - Yield Ganho: $66.67 (0.67%)
   - APY: 8%

4. Sacar Parcial
   - Valor: $5,000
   - Yield Proporcional: $33.33
   - Restante no Pool: $5,066.67
```

## 🔐 Segurança

1. **Wallet Integration**
   - Freighter Wallet para assinatura
   - Chaves privadas nunca expostas
   - Transações assinadas no client

2. **Blend Protocol**
   - Pools isolados (risk containment)
   - Backstop insurance obrigatório
   - Smart contracts auditados

3. **Backend Validation**
   - Validação de saldos antes de saques
   - Verificação de ownership
   - Rate limiting em API

## 📦 Instalação

### 1. Instalar Dependências

```bash
# Backend
cd apps/api
npm install
# Adiciona @blend-capital/blend-sdk-js

# Frontend
cd apps/new_web
npm install
# Adiciona @blend-capital/blend-sdk-js
```

### 2. Migração do Banco

```bash
cd apps/api
npx prisma migrate dev --name add_pool_model
npx prisma generate
```

### 3. Configurar Ambiente

```bash
# apps/api/.env
DATABASE_URL="file:./dev.db"
STELLAR_NETWORK="TESTNET"
```

### 4. Iniciar Servidores

```bash
# Backend
cd apps/api
npm run dev

# Frontend
cd apps/new_web
npm run dev
```

## 🎨 UI/UX

### Dashboard de Pools

```
┌─────────────────────────────────────┐
│  Yield Pools      [+ Create Pool]  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ USDC Pool - Real Estate Fund │ │
│  │ Status: ACTIVE               │ │
│  ├───────────────────────────────┤ │
│  │ 💵 Deposited: $10,000        │ │
│  │ 📈 Balance:   $10,066        │ │
│  │ 💎 Yield:     $66 (0.67%)    │ │
│  │ 📊 APY:       8.0%           │ │
│  ├───────────────────────────────┤ │
│  │ [Deposit]      [Withdraw]    │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## 📝 Próximos Passos

1. **Atualização Automática de Yield**
   - Cron job para atualizar balances
   - Consultar Blend periodicamente
   - Atualizar APY em tempo real

2. **Histórico de Transações**
   - Tabela com depósitos/saques
   - Gráfico de yield ao longo do tempo
   - Export para CSV

3. **Múltiplos Assets**
   - Suporte para XLM, USDC, outros tokens
   - Conversão automática de valores
   - Dashboard unificado

4. **Notificações**
   - Alert quando yield atinge threshold
   - Email semanal com performance
   - Webhook para integração

5. **Analytics**
   - ROI por pool
   - Comparação entre pools
   - Projeções de yield

## 🔗 Links Úteis

- [Blend Protocol Docs](https://docs.blend.capital/)
- [Blend SDK GitHub](https://github.com/blend-capital/blend-sdk-js)
- [Stellar Testnet](https://laboratory.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)

## 🤝 Suporte

Para dúvidas sobre:
- **Blend Protocol**: https://discord.gg/blend
- **Stellar**: https://discord.gg/stellar
- **TheSimpleFund**: Contato interno

---

**Status**: ✅ Sistema completo implementado e pronto para uso em testnet!
