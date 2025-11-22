# AWS RDS PostgreSQL - Guia de Configuração

## ❌ Problema Atual
Erro: `Can't reach database server at thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com:5432`

## ✅ Soluções

### 1. **Configurar Security Group no AWS RDS**

O mais provável é que o Security Group esteja bloqueando a conexão.

#### Passos no AWS Console:

1. Acesse **RDS** → **Databases**
2. Clique na instância `thesimplefund`
3. Vá em **Connectivity & security**
4. Clique no **Security Group** (ex: `sg-xxxxx`)
5. Vá em **Inbound rules** → **Edit inbound rules**
6. **Adicione uma regra:**
   - Type: `PostgreSQL`
   - Protocol: `TCP`
   - Port: `5432`
   - Source: 
     - **Opção 1 (Desenvolvimento):** `0.0.0.0/0` (⚠️ Qualquer IP - apenas para teste)
     - **Opção 2 (Seguro):** Seu IP público (recomendado)
     - **Opção 3 (Produção):** IP do servidor de produção
7. Clique em **Save rules**

### 2. **Verificar Publicly Accessible**

1. No RDS Dashboard, vá em sua instância
2. Em **Connectivity & security**
3. Verifique se **Publicly accessible** está: `Yes`
4. Se estiver `No`:
   - Clique em **Modify**
   - Em **Connectivity**, marque **Publicly accessible**
   - Clique em **Continue** → **Apply immediately**

### 3. **Verificar Endpoint**

Confirme se o endpoint está correto:
```
thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com
```

Você pode verificar no RDS Dashboard:
- **Databases** → Sua instância → **Endpoint & port**

### 4. **Testar Conexão Manual**

#### Opção A: Usando psql (se instalado)
```bash
psql "postgresql://postgres:rPWUEPZMqNI99EYp3cU5@thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com:5432/postgres?sslmode=require"
```

#### Opção B: Usando Docker
```bash
docker run -it --rm postgres:15 psql "postgresql://postgres:rPWUEPZMqNI99EYp3cU5@thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com:5432/postgres?sslmode=require"
```

#### Opção C: Testar porta com telnet/nc
```bash
nc -zv thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com 5432
```

### 5. **Configurar VPC (se necessário)**

Se o RDS está em uma VPC privada:

1. **Opção A:** Tornar o RDS público (mais fácil para desenvolvimento)
2. **Opção B:** Usar VPN para acessar a VPC
3. **Opção C:** Usar EC2 Bastion Host

### 6. **Verificar SSL/TLS**

Tente sem SSL primeiro para diagnosticar:

```env
# Teste sem SSL
DATABASE_URL="postgresql://postgres:rPWUEPZMqNI99EYp3cU5@thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com:5432/postgres"
```

Se funcionar, o problema era SSL. Depois adicione de volta:
```env
DATABASE_URL="postgresql://postgres:rPWUEPZMqNI99EYp3cU5@thesimplefund.cbi2qo8w6bsm.us-east-2.rds.amazonaws.com:5432/postgres?sslmode=require"
```

## 🖥️ Configurar via AWS CLI

### Pré-requisitos
```bash
# Instalar AWS CLI (se não tiver)
# macOS
brew install awscli

# Ou via pip
pip install awscli

# Configurar credenciais
aws configure
```

### 1. Descobrir o Security Group ID
```bash
# Listar RDS instances e seus security groups
aws rds describe-db-instances \
  --db-instance-identifier thesimplefund \
  --region us-east-2 \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text
```

Salve o ID retornado (ex: `sg-0123456789abcdef0`)

### 2. Adicionar Regra de Ingresso (Inbound Rule)

#### Opção A: Liberar apenas seu IP público
```bash
# Descobrir seu IP público
MY_IP=$(curl -s https://api.ipify.org)
echo "Seu IP público: $MY_IP"

# Pegar o Security Group ID
SG_ID=$(aws rds describe-db-instances \
  --db-instance-identifier thesimplefund \
  --region us-east-2 \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text)

echo "Security Group ID: $SG_ID"

# Adicionar regra para seu IP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr $MY_IP/32 \
  --region us-east-2
```

#### Opção B: Liberar para qualquer IP (⚠️ Apenas desenvolvimento)
```bash
# Pegar o Security Group ID
SG_ID=$(aws rds describe-db-instances \
  --db-instance-identifier thesimplefund \
  --region us-east-2 \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text)

# Adicionar regra para qualquer IP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0 \
  --region us-east-2
```

### 3. Tornar RDS Publicly Accessible
```bash
aws rds modify-db-instance \
  --db-instance-identifier thesimplefund \
  --publicly-accessible \
  --apply-immediately \
  --region us-east-2
```

### 4. Verificar Status
```bash
# Verificar se modificações foram aplicadas
aws rds describe-db-instances \
  --db-instance-identifier thesimplefund \
  --region us-east-2 \
  --query 'DBInstances[0].[DBInstanceStatus,PubliclyAccessible,Endpoint.Address]' \
  --output table
```

### 5. Listar Regras do Security Group
```bash
SG_ID=$(aws rds describe-db-instances \
  --db-instance-identifier thesimplefund \
  --region us-east-2 \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text)

aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --region us-east-2 \
  --query 'SecurityGroups[0].IpPermissions'
```

### 6. Remover Regra (se necessário)
```bash
# Remover acesso de um IP específico
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr SEU_IP/32 \
  --region us-east-2

# Remover acesso de qualquer IP
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0 \
  --region us-east-2
```

### 🚀 Script Completo (One-liner para desenvolvimento)
```bash
# Este script faz tudo de uma vez
SG_ID=$(aws rds describe-db-instances --db-instance-identifier thesimplefund --region us-east-2 --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' --output text) && \
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 5432 --cidr 0.0.0.0/0 --region us-east-2 && \
aws rds modify-db-instance --db-instance-identifier thesimplefund --publicly-accessible --apply-immediately --region us-east-2 && \
echo "✅ Configuração aplicada! Aguarde 2-5 minutos e teste: npx prisma db push"
```

### ⏱️ Aguardar Modificações
```bash
# Monitorar status até ficar 'available'
aws rds wait db-instance-available \
  --db-instance-identifier thesimplefund \
  --region us-east-2

echo "✅ RDS está disponível!"
```

## 🔧 Após Configurar o Security Group

Uma vez que a conexão funcione, execute:

### 1. Aplicar Schema ao Banco
```bash
cd apps/api
npx prisma db push
```

### 2. Gerar Prisma Client
```bash
npx prisma generate
```

### 3. Aplicar Migrações com Índices
```bash
npx prisma migrate dev --name add_performance_indexes
```

### 4. (Opcional) Seed com Dados de Teste
```bash
npm run db:seed
```

### 5. Testar API
```bash
npm run dev
```

Então teste:
```bash
curl http://localhost:3001/health
```

## 📋 Checklist de Verificação

- [ ] Security Group permite conexão na porta 5432
- [ ] RDS está com "Publicly accessible" = Yes
- [ ] Endpoint está correto
- [ ] Senha está correta
- [ ] Testei conexão manual com psql/Docker
- [ ] Schema aplicado com `prisma db push`
- [ ] Prisma Client gerado
- [ ] API consegue conectar ao banco
- [ ] Migrações aplicadas com índices de performance

## 🚨 Configurações de Segurança Recomendadas

### Para Desenvolvimento:
```
Security Group Inbound:
- PostgreSQL (5432) from: Seu IP público
- Renovar quando seu IP mudar
```

### Para Produção:
```
Security Group Inbound:
- PostgreSQL (5432) from: IP do servidor de aplicação
- OU: Security Group do servidor de aplicação
- SSL obrigatório (sslmode=require)
```

## 📞 Suporte

Se ainda não funcionar, verifique:
1. AWS RDS está no status **Available**
2. Não há Network ACLs bloqueando tráfego
3. Route Tables estão configuradas corretamente
4. Internet Gateway está anexado à VPC (se público)

## ⚡ Quick Fix (Desenvolvimento)

Para desbloquear rapidamente no desenvolvimento:

1. **RDS Console** → Sua instância → **Modify**
2. **Publicly accessible:** Yes
3. **Security Group:** Editar → Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: `0.0.0.0/0` (⚠️ apenas desenvolvimento!)
4. **Apply immediately**
5. Aguardar 2-5 minutos
6. Testar: `npx prisma db push`

**⚠️ IMPORTANTE:** Para produção, restrinja o acesso apenas aos IPs necessários!
