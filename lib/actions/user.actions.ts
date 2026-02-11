"use server";





import { clerkClient } from "@clerk/nextjs/server";




import prisma from "@/lib/prisma";




import { revalidatePath } from "next/cache";




import { UserRole, EventType, EventChannel, EventStatus } from "@prisma/client";





// ==========================================




// HELPERS




// ==========================================





async function findUser(paramId: string | number) {




if (typeof paramId === 'string' && paramId.startsWith('user_')) {




return await prisma.user.findUnique({ where: { userId: paramId } });




}




const numericId = typeof paramId === 'number' ? paramId : parseInt(paramId as string, 10);




if (!isNaN(numericId)) {




return await prisma.user.findUnique({ where: { id: numericId } });




}




return null;




}





function revalidateUserLists() {




revalidatePath("/lists/operadores");




revalidatePath("/lists/administradores"); 




revalidatePath("/lists/supervisores");




revalidatePath("/lists/d2d");




}





function revalidateEventLists() {




revalidatePath("/lists/vendas");




revalidatePath("/lists/callbacks");




}





// ==========================================




// GETTERS (LISTAS PARA AS PÃƒÆ’Ã¯Â¿Â½GINAS)




// ==========================================





export async function getOperatorsList() {




try {




return await prisma.user.findMany({




where: { role: 'OPERATOR', is_active: true },




orderBy: { frst_name: 'asc' },




});




} catch (error) {




console.error('Erro ao buscar operadores:', error);




return [];




}




}





export async function getAdministratorsList() {




try {




return await prisma.user.findMany({




where: { 




role: { in: ['ADMIN', 'SUPER_ADMIN'] },




is_active: true 




},




orderBy: { frst_name: 'asc' },




});




} catch (error) {




console.error('Erro ao buscar administradores:', error);




return [];




}




}





export async function getOperatorById(paramId: string | number) {




try {




const user = await findUser(paramId);




if (!user) return null;




return user;




} catch (error) {




return null;




}




}





export async function getCallbacksList() {




try {




return await prisma.event.findMany({




where: { type: 'CALLBACK' },




include: { user: true, client: true },




orderBy: { created_at: 'desc' },




});




} catch (error) {




return [];




}




}





// ==========================================




// CRUD UTILIZADORES (SYNC CLERK/PRISMA)




// ==========================================





export async function createSystemUser(data: {




email: string;




name: string;




apelido: string;




internalId: string;




phone: string;




role: UserRole;




}) {




const passwordToUse = data.internalId;




if (passwordToUse.length < 4) return { error: 'ID Interno deve ter pelo menos 4 caracteres' };





const existingUser = await prisma.user.findFirst({




where: { OR: [{ internalId: data.internalId }, { email: data.email }] }




});




if (existingUser) return { error: 'Utilizador jÃƒÆ’Ã‚Â¡ existe' };





const clerk = await clerkClient();




let newClerkUser = null;





try {




newClerkUser = await clerk.users.createUser({




username: data.internalId,




emailAddress: [data.email],




password: passwordToUse,




firstName: data.name,




lastName: data.apelido,




publicMetadata: { role: data.role.toLowerCase(), internalId: data.internalId },




unsafeMetadata: {




role: data.role.toLowerCase()




},




skipPasswordChecks: true,




});





await prisma.user.create({




data: {




userId: newClerkUser.id,




email: data.email,




internalId: data.internalId,




frst_name: data.name,




lst_name: data.apelido,




phone: data.phone || null,




role: data.role,




is_active: true,




}




});





revalidateUserLists();




return { success: true, message: `Utilizador ${data.internalId} criado!` };




} catch (error: any) {




if (newClerkUser?.id) await clerk.users.deleteUser(newClerkUser.id);




return { error: error.message || 'Erro ao criar utilizador' };




}




}





export async function updateSystemUser(paramId: string | number, data: any) {




try {




const user = await findUser(paramId);




if (!user) return { error: 'Utilizador nÃƒÆ’Ã‚Â£o encontrado' };





const clerk = await clerkClient();




await clerk.users.updateUser(user.userId, { 




firstName: data.name, 




lastName: data.apelido,




password: data.password || undefined 




});





await prisma.user.update({




where: { id: user.id },




data: {




frst_name: data.name,




lst_name: data.apelido,




email: data.email,




phone: data.phone || null,




},




});





revalidateUserLists();




return { success: true, message: 'Atualizado com sucesso' };




} catch (error: any) {




return { error: error.message };




}




}





export async function deleteUserAction(userIdOrId: string | number) {




try {




const user = await findUser(userIdOrId);




if (!user) return { error: 'Utilizador nÃƒÆ’Ã‚Â£o encontrado' };





const clerk = await clerkClient();




await prisma.user.delete({ where: { id: user.id } });




try { await clerk.users.deleteUser(user.userId); } catch (e) {}





revalidateUserLists();




return { success: true, message: 'Eliminado com sucesso' };




} catch (error: any) {




return { error: error.message };




}




}





// ==========================================




// VENDAS / EVENTOS (ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã‚Â§ CORRIGIDO)




// ==========================================





export async function getEventById(id: number) {




return await prisma.event.findUnique({




where: { id },




include: { client: true, user: true }




});




}





export async function createEvent(data: any) {



try {



// ðŸ”� DEBUG: Mostrar TUDO o que foi recebido


console.log('='.repeat(60));


console.log('ðŸ”� [DEBUG createEvent] DADOS RECEBIDOS:');


console.log('='.repeat(60));


console.log('ðŸ“¦ data completo:', JSON.stringify(data, null, 2));


console.log('ðŸ†” data.clerkUserId:', data.clerkUserId);


console.log('ðŸ‘¤ data.clientData:', data.clientData);


console.log('ðŸ“‹ data.type:', data.type);


console.log('ðŸ“ž data.channel:', data.channel);


console.log('âœ… data.status:', data.status);


console.log('ðŸ“� data.obs:', data.obs);


console.log('ðŸ“… data.calledback_at:', data.calledback_at);


console.log('='.repeat(60));



// âœ… ValidaÃ§Ã£o robusta do clerkUserId


if (!data.clerkUserId) {


console.error('â�Œ [createEvent] clerkUserId estÃ¡ vazio!');


console.error('ðŸ”� data recebido:', data);


return { error: 'ID de utilizador nÃ£o fornecido' };


}



// âœ… Procura o user no Prisma usando o Clerk ID


const user = await prisma.user.findUnique({ 


where: { userId: data.clerkUserId } 


});



console.log('ðŸ‘¤ [createEvent] User encontrado:', user ? `${user.frst_name} (${user.role}, ID: ${user.id})` : 'NULL');



if (!user) {


console.error('â�Œ [createEvent] Utilizador nÃ£o encontrado no Prisma. ClerkID:', data.clerkUserId);


return { error: 'Utilizador nÃ£o encontrado na base de dados. Contacte o administrador.' };


}



// âœ… VerificaÃ§Ã£o de permissÃµes


const allowedRoles = ['OPERATOR', 'D2D', 'SUPERVISOR', 'ADMIN'];


if (!allowedRoles.includes(user.role)) {


console.error('â�Œ [createEvent] User sem permissÃ£o. Role:', user.role);


return { error: 'Sem permissÃ£o para criar eventos' };


}



const eventId = `EVT_${Date.now()}`;


console.log('ðŸ†” [createEvent] EventID gerado:', eventId);



// âœ… ValidaÃ§Ã£o dos dados do cliente


if (!data.clientData?.frst_name || !data.clientData?.phone || !data.clientData?.address) {


console.error('â�Œ [createEvent] Dados do cliente incompletos!');


console.error('ðŸ”� clientData recebido:', data.clientData);


console.error(' - frst_name:', data.clientData?.frst_name);


console.error(' - phone:', data.clientData?.phone);


console.error(' - address:', data.clientData?.address);


return { error: 'Dados do cliente incompletos' };


}



console.log('âœ… [createEvent] ValidaÃ§Ãµes passaram! Criando evento...');



await prisma.$transaction(async (tx) => {


// ðŸ†• CORREÃ‡ÃƒO: Verificar se cliente jÃ¡ existe (phone Ã© unique)


let client = await tx.client.findUnique({


where: { phone: data.clientData.phone }


});



if (client) {


// â™»ï¸� Cliente jÃ¡ existe - ATUALIZAR dados


console.log('ðŸ”„ [createEvent] Cliente jÃ¡ existe! ID:', client.id, '- Atualizando dados...');


client = await tx.client.update({


where: { id: client.id },


data: {


frst_name: data.clientData.frst_name,


lst_name: data.clientData.lst_name || null,


email: data.clientData.email || null,


address: data.clientData.address,


}


});


console.log('âœ… [createEvent] Cliente atualizado!');


} else {


// âœ¨ Cliente nÃ£o existe - CRIAR novo


console.log('ðŸ“� [createEvent] Criando novo cliente...');


client = await tx.client.create({


data: {


frst_name: data.clientData.frst_name,


lst_name: data.clientData.lst_name || null,


phone: data.clientData.phone,


email: data.clientData.email || null,


address: data.clientData.address,


}


});


console.log('âœ… [createEvent] Cliente criado! ID:', client.id);


}



console.log('ðŸ“� [createEvent] Criando evento...');


const newEvent = await tx.event.create({


data: {


event_id: eventId,


userId: user.id,


clientId: client.id,


type: data.type,


channel: data.channel,


status: data.status,


obs: data.obs || null,


calledback_at: data.calledback_at || null,


}


});


console.log('âœ… [createEvent] Evento criado! ID:', newEvent.id);


});



console.log('âœ… [createEvent] Transaction completa! Event criado com sucesso:', eventId);


revalidateEventLists();


return { success: true, eventId };



} catch (error: any) {


console.error('â�Œ [createEvent] ERRO FATAL:', error);


console.error('â�Œ [createEvent] Error message:', error.message);


console.error('â�Œ [createEvent] Stack trace:', error.stack);


return { error: error.message || 'Erro ao criar evento' };


}



}


export async function updateEvent(eventId: number, data: any) {




try {




const event = await prisma.event.findUnique({ where: { id: eventId } });




if (!event) return { error: 'NÃƒÆ’Ã‚Â£o encontrado' };





await prisma.$transaction(async (tx) => {




await tx.client.update({




where: { id: event.clientId },




data: {




frst_name: data.clientData.frst_name,




lst_name: data.clientData.lst_name || null,




phone: data.clientData.phone,




email: data.clientData.email || null,




address: data.clientData.address,




}




});




await tx.event.update({




where: { id: eventId },




data: {




type: data.type,




channel: data.channel,




status: data.status,




obs: data.obs || null,




calledback_at: data.calledback_at || null,




}




});




});





revalidateEventLists();




return { success: true };




} catch (error: any) {




return { error: error.message };




}




}





export async function deleteEventAction(eventId: number) {




try {




const event = await prisma.event.findUnique({ where: { id: eventId } });




if (!event) return { error: 'NÃƒÆ’Ã‚Â£o encontrado' };





await prisma.$transaction(async (tx) => {




await tx.event.delete({ where: { id: eventId } });




await tx.client.delete({ where: { id: event.clientId } });




});





revalidateEventLists();




return { success: true };




} catch (error: any) {




return { error: error.message };




}




}





// ==========================================




// ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã¢â‚¬Â¢ HELPERS DE PERMISSÃƒÆ’Ã¢â‚¬Â¢ES




// ==========================================





function canViewAllEvents(role: string): boolean {




const adminRoles = ['admin', 'super_admin', 'supervisor'];




return adminRoles.includes(role.toLowerCase());




}





// ==========================================




// ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã¢â‚¬Â¢ GET EVENTS FOR CALENDAR (Server Action)




// ==========================================





export async function getCalendarEvents(clerkUserId?: string, userRole?: string) {




try {




const whereClause: any = {};




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã¢â‚¬â„¢ Filtro por operador (se nÃƒÆ’Ã‚Â£o for admin/supervisor)




if (clerkUserId && userRole && !canViewAllEvents(userRole)) {




const user = await prisma.user.findUnique({ 




where: { userId: clerkUserId } 




});




if (user) {




whereClause.userId = user.id;




console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã¢â‚¬â„¢ [getCalendarEvents] Operador ${user.frst_name} - Filtrando eventos`);




}




} else {




console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Ëœ [getCalendarEvents] Admin/Supervisor - Mostrando todos os eventos`);




}





const events = await prisma.event.findMany({




where: whereClause,




include: {




client: true,




user: true




},




orderBy: {




created_at: 'desc'




}




});





// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Transforma para formato do BigCalendar




return events.map((event) => {




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã‚Â§ Para VENDAS: aparece na hora de criaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã‚Â§ Para CALLBACKS: aparece na hora agendada




const eventDate = event.type === 'CALLBACK' && event.calledback_at




? new Date(event.calledback_at)




: new Date(event.created_at);





return {




id: event.id,




eventIdString: event.event_id,




title: event.type === 'SALE' ? 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â° Venda' : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â¾ Callback',




start: eventDate.toISOString(),




end: new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(),




type: event.type,




status: event.status,




clientName: `${event.client.frst_name} ${event.client.lst_name || ''}`.trim(),




operatorName: `${event.user.frst_name} ${event.user.lst_name}`,




obs: event.obs || '',




createdAt: event.created_at.toISOString()




};




});




} catch (error) {




console.error('ÃƒÂ¢Ã¯Â¿Â½Ã…â€™ [getCalendarEvents] Erro:', error);




return [];




}




}





// ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã¢â‚¬Â¢ GET EVENTS LIST (para pÃƒÆ’Ã‚Â¡ginas /lists/vendas, /lists/callbacks)




export async function getEventsList(filters?: {




clerkUserId?: string;




userRole?: string;




type?: 'SALE' | 'CALLBACK' | 'ALL';




status?: 'PROJECT' | 'CLOSED' | 'LOST' | 'ALL';




searchQuery?: string;




}) {




try {




const whereClause: any = {};




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã¢â‚¬â„¢ Filtro por operador




if (filters?.clerkUserId && filters?.userRole && !canViewAllEvents(filters.userRole)) {




const user = await prisma.user.findUnique({ 




where: { userId: filters.clerkUserId } 




});




if (user) whereClause.userId = user.id;




}




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã¯Â¿Â½ Filtro por tipo




if (filters?.type && filters.type !== 'ALL') {




whereClause.type = filters.type;




}




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã¯Â¿Â½ Filtro por status




if (filters?.status && filters.status !== 'ALL') {




whereClause.status = filters.status;




}




// ÃƒÂ°Ã…Â¸Ã¢â‚¬ï¿½Ã¯Â¿Â½ Search query (nome do cliente ou event_id)




if (filters?.searchQuery) {




whereClause.OR = [




{ event_id: { contains: filters.searchQuery } },




{ client: { frst_name: { contains: filters.searchQuery } } },




{ client: { lst_name: { contains: filters.searchQuery } } },




{ client: { phone: { contains: filters.searchQuery } } }




];




}





const events = await prisma.event.findMany({




where: whereClause,




include: {




client: true,




user: true




},




orderBy: {




created_at: 'desc'




}




});





return events;




} catch (error) {




console.error('ÃƒÂ¢Ã¯Â¿Â½Ã…â€™ [getEventsList] Erro:', error);




return [];




}




}





// ==========================================




// ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã¢â‚¬Â¢ GET VENDAS BY USER (para ListaVendas)




// ==========================================





export async function getVendasByUser(clerkUserId: string) {




try {




console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¹ [getVendasByUser] Buscando vendas para userId:', clerkUserId);




// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Buscar o user no Prisma usando Clerk ID




const user = await prisma.user.findUnique({ 




where: { userId: clerkUserId } 




});





if (!user) {




console.error('ÃƒÂ¢Ã¯Â¿Â½Ã…â€™ [getVendasByUser] User nÃƒÆ’Ã‚Â£o encontrado:', clerkUserId);




return [];




}





console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤ [getVendasByUser] User encontrado: ${user.frst_name} (ID: ${user.id})`);





// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Buscar vendas (tipo SALE) do operador




const vendas = await prisma.event.findMany({




where: {




userId: user.id,




type: 'SALE' // Apenas vendas, nÃƒÆ’Ã‚Â£o callbacks




},




include: {




client: true




},




orderBy: {




created_at: 'desc' // Mais recente primeiro




},




take: 50 // Limitar a 50 vendas mais recentes




});





console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ [getVendasByUser] Encontradas ${vendas.length} vendas`);





// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Transformar para formato usado no componente




return vendas.map((venda) => ({




id: venda.id,




event_id: venda.event_id,




clientName: `${venda.client.frst_name} ${venda.client.lst_name || ''}`.trim(),




created_at: venda.created_at




}));





} catch (error) {




console.error('ÃƒÂ¢Ã¯Â¿Â½Ã…â€™ [getVendasByUser] Erro:', error);




return [];




}




}






// ==========================================
// 🏆 GAMIFICATION - BADGES & STATS
// ==========================================

/**
 * Busca estatísticas do utilizador para badges
 * @param clerkUserId - Clerk user ID (string: user_xxxxx)
 * @returns Estatísticas: vendas hoje, total, streak
 */
export async function getUserStats(clerkUserId: string) {
  try {
    console.log('📊 [getUserStats] Buscando stats para:', clerkUserId);

    // ✅ Buscar user no Prisma usando Clerk ID
    const user = await prisma.user.findUnique({
      where: { userId: clerkUserId }
    });

    if (!user) {
      console.error('❌ [getUserStats] User não encontrado:', clerkUserId);
      return {
        salesToday: 0,
        salesTotal: 0,
        streak: 0,
      };
    }

    console.log(`👤 [getUserStats] User encontrado: ${user.frst_name} (ID: ${user.id})`);

    // 📅 Calcular vendas de HOJE
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = await prisma.event.count({
      where: {
        userId: user.id,
        type: 'SALE',
        created_at: {
          gte: today
        }
      }
    });

    // 📊 Calcular vendas TOTAIS
    const salesTotal = await prisma.event.count({
      where: {
        userId: user.id,
        type: 'SALE'
      }
    });

    // 🔥 Calcular STREAK (dias consecutivos com vendas)
    const streak = await calculateStreak(user.id);

    console.log(`✅ [getUserStats] Stats: Hoje=${salesToday}, Total=${salesTotal}, Streak=${streak}`);

    return {
      salesToday,
      salesTotal,
      streak,
    };

  } catch (error) {
    console.error('❌ [getUserStats] Erro:', error);
    return {
      salesToday: 0,
      salesTotal: 0,
      streak: 0,
    };
  }
}


/**
 * Calcula streak de dias consecutivos com vendas
 * @param userId - Prisma user ID (number)
 * @returns Número de dias consecutivos com pelo menos 1 venda
 */
async function calculateStreak(userId: number): Promise<number> {
  try {
    // Buscar vendas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.event.findMany({
      where: {
        userId,
        type: 'SALE',
        created_at: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (sales.length === 0) return 0;

    // Agrupar vendas por dia (formato: YYYY-MM-DD)
    const daysWithSales = new Set(
      sales.map(s => s.created_at.toISOString().split('T')[0])
    );

    // Contar dias consecutivos a partir de HOJE
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (daysWithSales.has(dateStr)) {
        streak++;
      } else {
        // Para no primeiro dia SEM vendas
        break;
      }
    }

    return streak;

  } catch (error) {
    console.error('❌ [calculateStreak] Erro:', error);
    return 0;
  }
}
