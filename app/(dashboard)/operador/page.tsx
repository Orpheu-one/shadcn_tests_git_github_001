import OperadorDashboard from "@/components/OperadorDashboard"
import { getCalendarEvents } from "@/lib/actions/user.actions"

const OperadorPage = async () => {
  // ✅ Busca eventos no servidor (MUITO mais rápido)
  const initialEvents = await getCalendarEvents()

  return <OperadorDashboard initialEvents={initialEvents} />
}

export default OperadorPage