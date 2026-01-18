"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Home, Calendar, Search, Settings, Smile, UsersRound, UsersIcon, UserRoundCheck, UserStar, PhoneForwarded, BadgeEuro, Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

// Define all menu items with role restrictions
const items = [
  {
    title: "Home",
    icon: Home,
    href: "/",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
  {
    title: "Pesquisa",
    icon: Search,
    href: "/pesquisa",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
  {
    title: "Vendas",
    icon: BadgeEuro,
    href: "/lists/vendas",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
  {
    title: "Operadores",
    icon: UsersIcon,
    href: "/lists/operadores",
    allowedRoles: ["admin", "super_admin", "supervisor"],
  },
  {
    title: "Vendedores (D2D)",
    icon: UsersRound,
    href: "/lists/d2d",
    allowedRoles: ["admin", "super_admin", "supervisor"],
  },
  {
    title: "Supervisores",
    icon: UserRoundCheck,
    href: "/lists/supervisores",
    allowedRoles: ["admin", "super_admin", "supervisor"],
  },
  {
    title: "Administradores",
    icon: UserStar,
    href: "/lists/administradores",
    allowedRoles: ["admin", "super_admin"],
  },
  {
    title: "Callbacks",
    icon: PhoneForwarded,
    href: "/lists/callbacks",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator"],
  },
  {
    title: "Dinamicas",
    icon: Smile,
    href: "/lists/dinamicas",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
  {
    title: "Social",
    icon: Heart,
    href: "/social",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    allowedRoles: ["admin", "super_admin", "supervisor", "operator", "d2d"],
  },
]

const SideBar = () => {
  const { user, isLoaded } = useUser()
  
  // Get user role from publicMetadata and normalize it
  const rawRole = user?.publicMetadata?.role as string | undefined
  
  // Normalize role to lowercase and handle variations
  const normalizeRole = (role: string | undefined): string | undefined => {
    if (!role) return undefined
    
    const normalized = role.toLowerCase()
    
    // Map variations to standard roles
    const roleMap: Record<string, string> = {
      'operador': 'operator',
      'vendedor': 'd2d',
      'super-admin': 'super_admin',
      'super_admin': 'super_admin',
    }
    
    return roleMap[normalized] || normalized
  }
  
  const userRole = normalizeRole(rawRole)

  // Debug log (remove after fixing)
  console.log('🔍 [SideBar] Raw role:', rawRole, '| Normalized:', userRole)

  // Loading state
  if (!isLoaded) {
    return (
      <div className="dark:bg-transparent p-4">
        <p className="text-white text-sm">A carregar menu...</p>
      </div>
    )
  }

  // No role assigned
  if (!userRole) {
    return (
      <div className="dark:bg-transparent p-4">
        <p className="text-white text-sm">Sem permissões</p>
      </div>
    )
  }

  // Filter items based on user role
  const visibleItems = items.filter(item => 
    item.allowedRoles.includes(userRole)
  )

  return (
    <div className="dark:bg-transparent">
      {visibleItems.map((item) => (
        <div key={item.title} className="flex items-end-safe font-light text-sm">
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