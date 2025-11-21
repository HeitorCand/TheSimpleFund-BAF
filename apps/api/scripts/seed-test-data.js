import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🗃️  Limpando dados existentes...');
    
    // Limpar dados existentes na ordem correta devido às foreign keys
    await prisma.order.deleteMany();
    await prisma.receivable.deleteMany();
    await prisma.cedente.deleteMany();
    await prisma.sacado.deleteMany();
    await prisma.fund.deleteMany();
    await prisma.user.deleteMany();

    console.log('👥 Criando usuários de teste...');

    // Senha padrão para todos os usuários de teste
    const defaultPassword = await bcrypt.hash('123456', 10);

    // 1. Criar GESTOR
    const gestor = await prisma.user.create({
      data: {
        email: 'gestor@vero.com',
        password: defaultPassword,
        role: 'GESTOR',
        status: 'APPROVED'
      }
    });
    console.log('✅ Gestor criado:', gestor.email);

    // 2. Criar CONSULTOR
    const consultor = await prisma.user.create({
      data: {
        email: 'consultor@vero.com',
        password: defaultPassword,
        role: 'CONSULTOR',
        status: 'APPROVED'
      }
    });
    console.log('✅ Consultor criado:', consultor.email);

    // 3. Criar INVESTIDOR
    const investidor = await prisma.user.create({
      data: {
        email: 'investidor@vero.com',
        password: defaultPassword,
        role: 'INVESTIDOR',
        status: 'APPROVED'
      }
    });
    console.log('✅ Investidor criado:', investidor.email);

    // 4. Criar usuários adicionais pendentes para demonstrar aprovação
    const consultorPendente = await prisma.user.create({
      data: {
        email: 'consultor.pendente@vero.com',
        password: defaultPassword,
        role: 'CONSULTOR',
        status: 'PENDING'
      }
    });
    console.log('⏳ Consultor pendente criado:', consultorPendente.email);

    const investidorPendente = await prisma.user.create({
      data: {
        email: 'investidor.pendente@vero.com',
        password: defaultPassword,
        role: 'INVESTIDOR',
        status: 'PENDING'
      }
    });
    console.log('⏳ Investidor pendente criado:', investidorPendente.email);

    console.log('\n🎉 Dados de teste criados com sucesso!\n');
    
    console.log('📋 CREDENCIAIS DE TESTE:');
    console.log('═══════════════════════════════════════');
    console.log('👨‍💼 GESTOR:');
    console.log('   Email: gestor@vero.com');
    console.log('   Senha: 123456');
    console.log('   Status: APROVADO');
    console.log('');
    console.log('👨‍💻 CONSULTOR:');
    console.log('   Email: consultor@vero.com');
    console.log('   Senha: 123456');
    console.log('   Status: APROVADO');
    console.log('');
    console.log('💰 INVESTIDOR:');
    console.log('   Email: investidor@vero.com');
    console.log('   Senha: 123456');
    console.log('   Status: APROVADO');
    console.log('');
    console.log('⏳ USUÁRIOS PENDENTES (para testar aprovação):');
    console.log('   consultor.pendente@vero.com - 123456');
    console.log('   investidor.pendente@vero.com - 123456');
    console.log('');
    console.log('💡 BANCO LIMPO - Apenas usuários criados');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();