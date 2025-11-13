// prisma/seed.ts

import { PrismaClient, UserRole, EventType, EventChannel, EventStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import 'dotenv/config'; // Garante que o .env é carregado

const prisma = new PrismaClient();

// --- CONFIGURAÇÃO ---
const NUM_USERS = 15;
const NUM_EVENTS = 10;

// Distribuição de Utilizadores conforme pedido (total 15)
const userRoles: UserRole[] = [
  ...Array(8).fill(UserRole.OPERATOR),  // 8 Operadores
  UserRole.ADMIN,                       // 1 Administrador
  UserRole.SUPERVISOR,                  // 1 Supervisor
  ...Array(5).fill(UserRole.D2D),       // 5 D2D
];

/**
 * Gera uma data aleatória na próxima semana (próximos 7 dias)
 * para garantir que os eventos são visíveis no calendário.
 */
function getNextWeekScheduledDate(): Date {
  // Cria uma data de início que é hoje
  const today = new Date();
  
  // Cria um número de dias aleatório entre 0 e 6
  const randomDays = faker.number.int({ min: 0, max: 6 }); 
  
  const scheduledDate = new Date(today);
  scheduledDate.setDate(today.getDate() + randomDays);
  
  // Adiciona horas aleatórias (entre 9h e 17h)
  scheduledDate.setHours(faker.number.int({ min: 9, max: 17 }));
  scheduledDate.setMinutes(faker.number.int({ min: 0, max: 59 }));
  scheduledDate.setSeconds(0);
  
  return scheduledDate;
}

// Função placeholder para simular o hash da password
async function hashPassword(password: string): Promise<string> {
    return `hashed_${password}`; 
}


async function main() {
  console.log('A começar o processo de Seed...');

  // 1. LIMPEZA DOS DADOS (Necessário devido à relação 1:1 e Foreign Keys)
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();
  console.log('Dados antigos removidos.');


  // 2. CRIAR UTILIZADORES (USERS)
  const createdUsers = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const role = userRoles[i];
    const frst_name = faker.person.firstName();
    const lst_name = faker.person.lastName();
    
    const user = await prisma.user.create({
      data: {
        userId: faker.string.uuid(),
        email: faker.internet.email({ firstName: frst_name, lastName: lst_name }).toLowerCase(),
        pwd: await hashPassword('password123'), 
        frst_name: frst_name,
        lst_name: lst_name,
        // CORREÇÃO: Usar replaceSymbols para formato específico (9 seguido de 8 dígitos)
        phone: faker.helpers.replaceSymbols('9########'), 
        role: role,
        is_active: true,
        avatar: faker.image.avatar(),
        desc: faker.person.bio(),
        created_at: faker.date.recent({ days: 30 }),
      },
    });
    createdUsers.push(user);
  }
  console.log(`Criados ${createdUsers.length} Utilizadores.`);


  // 3. CRIAR CLIENTES E EVENTOS (10 Clientes, 10 Eventos)
  const eventChannels: EventChannel[] = [
    ...Array(5).fill(EventChannel.F2F),   // 5 F2F
    ...Array(5).fill(EventChannel.REMOTE), // 5 Remote
  ];

  for (let i = 0; i < NUM_EVENTS; i++) {
    // Roda os utilizadores para que diferentes operadores tenham eventos
    const user = createdUsers[i % createdUsers.length]; 
    const channel = eventChannels[i];

    // Cria o Cliente (O Cliente tem de ser criado primeiro)
    const clientFrstName = faker.person.firstName();
    const clientLstName = faker.person.lastName();
    const client = await prisma.client.create({
      data: {
        clientId: faker.string.uuid(),
        frst_name: clientFrstName,
        lst_name: clientLstName,
        // CORREÇÃO: Usar replaceSymbols
        phone: faker.helpers.replaceSymbols('9########'),
        email: faker.internet.email({ firstName: clientFrstName, lastName: clientLstName }),
        address: faker.location.streetAddress(true),
        lat: faker.location.latitude(), 
        long: faker.location.longitude(),
      },
    });

    // Cria o Evento
    await prisma.event.create({
      data: {
        event_id: faker.string.uuid(),
        // Relações
        userId: user.id,
        clientId: client.id, // Liga o evento ao cliente (único)
        
        // Detalhes do Evento
        type: EventType.SALE, 
        channel: channel,
        status: EventStatus.PROJECT, // STATUS PENDENTE
        obs: faker.lorem.paragraph(1),
        
        // DATAS: AGORA AGENDADO PARA ESTA SEMANA
        Scheduled: getNextWeekScheduledDate(),
        created_at: faker.date.recent({ days: 30 }),
      },
    });
  }
  console.log(`Criados ${NUM_EVENTS} Clientes e ${NUM_EVENTS} Eventos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });