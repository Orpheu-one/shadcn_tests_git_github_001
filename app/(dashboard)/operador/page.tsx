import OperadorDashboard from "@/components/OperadorDashboard"
import { getCalendarEvents } from "@/lib/actions/user.actions"
import { auth } from '@clerk/nextjs/server'

const OperadorPage = async () => {
  // ✅ CORRIGIDO: Usa SÓ auth()
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return <div>Não autenticado</div>
  }
  
  // ✅ Pega role do sessionClaims
  const userRole = (sessionClaims?.metadata as any)?.userRole?.toLowerCase() || 
                   (sessionClaims?.publicMetadata as any)?.role?.toLowerCase() || 
                   'operator'
  
  // ✅ Busca eventos filtrados
  const initialEvents = await getCalendarEvents(userId, userRole)

  console.log(`📊 [OperadorPage] User ID: ${userId} | Role: ${userRole} | Events: ${initialEvents.length}`)

  return <OperadorDashboard initialEvents={initialEvents} />
}

export default OperadorPage