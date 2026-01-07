"use client"

import Link from "next/link" // Importação essencial para navegação no Next.js
import { useUser } from "@clerk/nextjs"
import { Home, Calendar, Search, Settings, Smile, UsersRound, UsersIcon, UserRoundCheck, UserStar, PhoneForwarded, BadgeEuro, Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

// Define all menu items with role restrictions
const items = [
  {
    title: "Home",
    icon: Home,
    href: "/",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
  {
    title: "Pesquisa",
    icon: Search,
    href: "/pesquisa",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
  {
    title: "Vendas",
    icon: BadgeEuro,
    href: "/lists/vendas",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
  {
    title: "Operadores",
    icon: UsersIcon,
    href: "/lists/operadores",
    allowedRoles: ["admin", "super-admin", "supervisor"],
  },
  {
    title: "Vendedores (D2D)",
    icon: UsersRound,
    href: "/lists/d2d",
    allowedRoles: ["admin", "super-admin", "supervisor"],
  },
  {
    title: "Supervisores",
    icon: UserRoundCheck,
    href: "/lists/supervisores",
    allowedRoles: ["admin", "super-admin", "supervisor"],
  },
  {
    title: "Administradores",
    icon: UserStar,
    href: "/lists/administradores",
    allowedRoles: ["admin", "super-admin"],
  },
  {
    title: "Callbacks",
    icon: PhoneForwarded,
    href: "/lists/callbacks",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador"],
  },
  {
    title: "Dinamicas",
    icon: Smile,
    href: "/lists/dinamicas",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
  {
    title: "Social",
    icon: Heart,
    href: "/social",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"],
  },
]

const SideBar = () => {
  const { user, isLoaded } = useUser()
  // Get user role from publicMetadata
  const userRole = user?.publicMetadata?.role as string | undefined

  // Loading state
  if (!isLoaded) {
    return (
      <div className="dark:bg-transparent p-4">
        <p className="text-white text-sm">A carregar menu...</p>
      </div>
    )
  }

  // Filter items based on user role
  const visibleItems = items.filter(item => 
    userRole && item.allowedRoles.includes(userRole)
  )

  return (
    <div className="dark:bg-transparent">
      {visibleItems.map((item) => (
        <div key={item.title} className="flex items-end-safe font-light text-sm">
          {/* Alterado de <a> para <Link> mantendo as classes exatas */}
          <Link 
            href={item.href} 
            className="flex gap-2 py-4 text-sm text-white font-light"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <item.icon />
              </TooltipTrigger>
              <TooltipContent>{item.title}</TooltipContent>
            </Tooltip> 
            <span className="mr-2 hidden lg:block cursor-pointer">{item.title}</span>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default SideBar