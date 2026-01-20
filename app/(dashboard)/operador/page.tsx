import OperadorDashboard from "@/components/OperadorDashboard"
import { getCalendarEvents } from "@/lib/actions/user.actions"
import { auth, currentUser } from '@clerk/nextjs/server'

const OperadorPage = async () => {
  // ✅ Busca user autenticado
  const { userId } = await auth()
  const user = await currentUser()
  
  if (!userId || !user) {
    return <div>Não autenticado</div>
  }
  
  // ✅ Pega role do metadata
  const userRole = (user.publicMetadata?.role as string) || 'operator'
  
  // ✅ Busca eventos filtrados
  const initialEvents = await getCalendarEvents(userId, userRole)

  console.log(`📊 [OperadorPage] User: ${user.firstName} | Role: ${userRole} | Events: ${initialEvents.length}`)

  return <OperadorDashboard initialEvents={initialEvents} />
}

export default OperadorPage