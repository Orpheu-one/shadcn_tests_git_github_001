"use client"

import { useUser } from "@clerk/nextjs"
import { Home, Calendar, Search, Settings, Smile, UsersRound, UsersIcon, UserRoundCheck, UserStar, PhoneForwarded, BadgeEuro, Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

// Define all menu items with role restrictions
const items = [
  {
    title: "Home",
    icon: Home,
    href: "/",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All
  },
  {
    title: "Pesquisa",
    icon: Search,
    href: "/pesquisa",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All
  },
  {
    title: "Vendas",
    icon: BadgeEuro,
    href: "/lists/vendas",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All (filtered in page)
  },
  {
    title: "Operadores",
    icon: UsersIcon,
    href: "/lists/operadores",
    allowedRoles: ["admin", "super-admin", "supervisor"], // Management only
  },
  {
    title: "Vendedores (D2D)",
    icon: UsersRound,
    href: "/lists/d2d",
    allowedRoles: ["admin", "super-admin", "supervisor"], // Management only
  },
  {
    title: "Supervisores",
    icon: UserRoundCheck,
    href: "/lists/supervisores",
    allowedRoles: ["admin", "super-admin", "supervisor"], // Management only
  },
  {
    title: "Administradores",
    icon: UserStar,
    href: "/lists/adminadores",
    allowedRoles: ["admin", "super-admin"], // Top level only
  },
  {
    title: "Callbacks",
    icon: PhoneForwarded,
    href: "/callbacks",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador"], // NOT vendedor
  },
  {
    title: "Dinamicas",
    icon: Smile,
    href: "/dinamicas",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All
  },
  {
    title: "Social",
    icon: Heart,
    href: "/social",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    allowedRoles: ["admin", "super-admin", "supervisor", "operador", "vendedor"], // All
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
          <a href={item.href} className="flex gap-2 py-4 text-sm text-white font-light">
            <Tooltip>
              <TooltipTrigger asChild>
                <item.icon />
              </TooltipTrigger>
              <TooltipContent>{item.title}</TooltipContent>
            </Tooltip>                                   
            <span className="mr-2 hidden lg:block cursor-pointer">{item.title}</span>
          </a>
        </div>
      ))}
    </div>
  )
}

export default SideBar