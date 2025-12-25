import { PrismaClient, UserRole, EventType, EventChannel, EventStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const prisma = new PrismaClient();

const NUM_USERS = 15;
const NUM_EVENTS = 10;

const userRoles: UserRole[] = [
  ...Array(8).fill(UserRole.OPERATOR),
  UserRole.ADMIN,
  UserRole.SUPERVISOR,
  ...Array(5).fill(UserRole.D2D),
];

function generateInternalId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

async function main() {
  console.log('🚀 A começar o processo de Seed...');

  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();
  console.log('✨ Dados antigos removidos.');

  const createdUsers = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const role = userRoles[i];
    const frst_name = faker.person.firstName();
    const lst_name = faker.person.lastName();
    
    const user = await prisma.user.create({
      data: {
        userId: `user_${faker.string.alphanumeric(15)}`, // ID do Clerk
        internalId: generateInternalId(),
        email: faker.internet.email({ firstName: frst_name, lastName: lst_name }).toLowerCase(),
        frst_name: frst_name,
        lst_name: lst_name,
        phone: faker.helpers.replaceSymbols('9########'), 
        role: role,
        is_active: true,
        avatar: faker.image.avatar(),
        desc: faker.person.bio(),
      },
    });
    createdUsers.push(user);
  }

  for (let i = 0; i < NUM_EVENTS; i++) {
    const user = createdUsers[i % createdUsers.length]; 
    const client = await prisma.client.create({
      data: {
        frst_name: faker.person.firstName(),
        lst_name: faker.person.lastName(),
        phone: faker.helpers.replaceSymbols('9########'),
        email: faker.internet.email(),
        address: faker.location.streetAddress(true),
      },
    });

    await prisma.event.create({
      data: {
        event_id: `EV-${faker.string.alphanumeric(6).toUpperCase()}`,
        userId: user.id,
        clientId: client.id, 
        type: EventType.SALE, 
        status: EventStatus.PROJECT,
        obs: faker.lorem.paragraph(1),
        Scheduled: faker.date.soon({ days: 7 }),
      },
    });
  }
  console.log('✅ Seed concluída com sucesso!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());