import { PrismaClient, BadgeType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ==========================================
  // 1. CRIAR BADGES INICIAIS
  // ==========================================
  
  const badges = [
    // DAILY BADGES
    {
      name: 'first_sale_day',
      displayName: 'Primeira Venda do Dia',
      description: 'Fez a primeira venda do dia!',
      icon: '🌅',
      type: 'DAILY' as BadgeType,
      minSales: 1
    },
    {
      name: 'top_seller_day',
      displayName: 'Top Seller do Dia',
      description: 'Mais vendas no dia!',
      icon: '👑',
      type: 'DAILY' as BadgeType,
    },
    {
      name: 'five_sales_day',
      displayName: '5 Vendas em Um Dia',
      description: 'Fechou 5 vendas num único dia!',
      icon: '🔥',
      type: 'DAILY' as BadgeType,
      minSales: 5
    },
    
    // WEEKLY BADGES
    {
      name: 'top_seller_week',
      displayName: 'Top Seller da Semana',
      description: 'Mais vendas na semana!',
      icon: '🏆',
      type: 'WEEKLY' as BadgeType,
    },
    {
      name: 'consistent_performer',
      displayName: 'Performance Consistente',
      description: 'Vendeu todos os dias da semana!',
      icon: '⚡',
      type: 'WEEKLY' as BadgeType,
    },
    
    // MONTHLY BADGES
    {
      name: 'top_seller_month',
      displayName: 'Top Seller do Mês',
      description: 'Mais vendas no mês!',
      icon: '🥇',
      type: 'MONTHLY' as BadgeType,
    },
    {
      name: 'fifty_sales_month',
      displayName: '50 Vendas no Mês',
      description: 'Fechou 50 vendas num mês!',
      icon: '💯',
      type: 'MONTHLY' as BadgeType,
      minSales: 50
    },
    
    // MILESTONE BADGES
    {
      name: 'first_sale_ever',
      displayName: 'Primeira Venda',
      description: 'Fez a primeira venda!',
      icon: '🎉',
      type: 'MILESTONE' as BadgeType,
      minSales: 1
    },
    {
      name: 'hundred_sales',
      displayName: 'Centenário',
      description: '100 vendas totais!',
      icon: '💎',
      type: 'MILESTONE' as BadgeType,
      minSales: 100
    },
    {
      name: 'five_hundred_sales',
      displayName: 'Lenda',
      description: '500 vendas totais!',
      icon: '🌟',
      type: 'MILESTONE' as BadgeType,
      minSales: 500
    },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    })
  }

  console.log(`✅ Created ${badges.length} badges`)

  // ==========================================
  // 2. ATUALIZAR USERS EXISTENTES (opcional)
  // ==========================================
  
  // Distribuir users existentes entre teams
  const operatorsWithoutTeam = await prisma.user.findMany({
    where: { 
      role: 'OPERATOR',
      team: null 
    }
  })

  for (let i = 0; i < operatorsWithoutTeam.length; i++) {
    await prisma.user.update({
      where: { id: operatorsWithoutTeam[i].id },
      data: {
        team: i % 2 === 0 ? 'WINNER_TEAM' : 'ELITE_TEAM',
        hireDate: new Date() // Data atual como placeholder
      }
    })
  }

  console.log(`✅ Updated ${operatorsWithoutTeam.length} operators with teams`)

  console.log('🌱 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })