import { Home, Inbox, Calendar, Search, Settings, Smile, UsersRound, UsersIcon, UserRoundCheck, UserStar, PhoneForwarded, BadgeEuro, Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
    href: "/"
  },

  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
    href: "/calendar"
  },
  {
    title: "Pesquisa",
    url: "#",
    icon: Search,
    href: "/pesquisa"
  },

  {
    title: "Vendas",
    url: "#",
    icon: BadgeEuro,
    href: "/vendas"
  },
  {
    title: "Operadores",
    url: "#",
    icon: UsersIcon ,
    href: "/lists/operadores"
  },
  {
    title: "Vendedores (D2D)",
    url: "#",
    icon: UsersRound ,
    href: "/lists/d2d"
  },
  {
    title: "Supervisores",
    url: "#",
    icon:UserRoundCheck ,
    href: "/lists/supervisores"
  },
  {
    title: "Administradores",
    url: "#",
    icon: UserStar,
    href: "/lists/administradores"
  },
  {
    title: "Callbacks",
    url: "#",
    icon: PhoneForwarded,
    href: "/callbacks"
  },

  {
    title: "Dinamicas",
    url: "#",
    icon: Smile,
    href: "/dinamicas"
  },

  {
    title: "Social",
    url: "#",
    icon: Heart,
    href: "/dinamicas"
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    href: "/settings"
  },
   
]



const AppSideBar = () => {
  return (
    <div className=' dark:bg-gray-900'>
        
        {items.map((item) => (
            <div key={item.title} className="flex items-end-safe font-light text-sm ">
                

                
                <a href={item.href} className="flex gap-2 py-4 text-sm text-white font-light">
                <Tooltip>
                <TooltipTrigger asChild>
                <item.icon />
                </TooltipTrigger>
                <TooltipContent>{item.title}</TooltipContent>
                </Tooltip>                                   
                <span className="mr-2 hidden lg:block cursor-pointer">{item.title }</span>
                </a>
                
                </div>
                ))}
            
       
            
             
    </div>
  )
}

export default AppSideBar