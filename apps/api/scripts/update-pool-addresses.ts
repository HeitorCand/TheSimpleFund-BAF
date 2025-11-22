import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Novos endereços oficiais do Blend testnet
const NEW_ADDRESSES = {
  USDC: 'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU',
  USDC_POOL: 'CDDG7DLOWSHRYQ2HWGZEZ4UTR7LPTKFFHN3QUCSZEXOWOPARMONX6T65',
  OLD_USDC: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
  OLD_POOL: 'CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K',
};

async function updatePoolAddresses() {
  console.log('🔄 Atualizando endereços dos pools no banco de dados...\n');

  try {
    // Atualizar pools com endereço antigo do USDC
    const updatedAssets = await prisma.pool.updateMany({
      where: {
        assetAddress: NEW_ADDRESSES.OLD_USDC,
      },
      data: {
        assetAddress: NEW_ADDRESSES.USDC,
      },
    });

    console.log(`✅ ${updatedAssets.count} pool(s) atualizado(s) com novo endereço USDC`);
    console.log(`   Antigo: ${NEW_ADDRESSES.OLD_USDC}`);
    console.log(`   Novo:   ${NEW_ADDRESSES.USDC}\n`);

    // Atualizar pools com endereço antigo do pool
    const updatedPools = await prisma.pool.updateMany({
      where: {
        blendPoolAddress: NEW_ADDRESSES.OLD_POOL,
      },
      data: {
        blendPoolAddress: NEW_ADDRESSES.USDC_POOL,
      },
    });

    console.log(`✅ ${updatedPools.count} pool(s) atualizado(s) com novo endereço do Blend Pool`);
    console.log(`   Antigo: ${NEW_ADDRESSES.OLD_POOL}`);
    console.log(`   Novo:   ${NEW_ADDRESSES.USDC_POOL}\n`);

    // Mostrar todos os pools atualizados
    const allPools = await prisma.pool.findMany({
      select: {
        id: true,
        name: true,
        assetAddress: true,
        blendPoolAddress: true,
        status: true,
      },
    });

    console.log('📋 Pools no banco de dados:');
    console.log(JSON.stringify(allPools, null, 2));

  } catch (error) {
    console.error('❌ Erro ao atualizar pools:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePoolAddresses()
  .then(() => {
    console.log('\n✅ Atualização concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Falha na atualização:', error);
    process.exit(1);
  });
