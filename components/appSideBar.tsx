import { Home, Inbox, Calendar, Search, Settings, } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
    href: "/"
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
    href: "/inbox"
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
    href: "/calendar"
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
    href: "/search"
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    href: "/settings"
  },
   {
    title: "item 0",
    url: "#",
    icon: Home,
    href: "/"
  },
  {
    title: "item 1",
    url: "#",
    icon: Inbox,
    href: "/inbox"
  },
  {
    title: "item 2",
    url: "#",
    icon: Calendar,
    href: "/calendar"
  },
  {
    title: "item 3",
    url: "#",
    icon: Search,
    href: "/search"
  },
  {
    title: "item 4",
    url: "#",
    icon: Settings,
    href: "/settings"
  },
]



const AppSideBar = () => {
  return (
    <div className=''>
        
        {items.map((item) => (
            <div key={item.title} className="flex items-end-safe font-light text-sm">
                

                
                <a href={item.href} className="flex gap-2 py-4 text-sm text-white font-light">
                <Tooltip>
                <TooltipTrigger asChild>
                <item.icon />
                </TooltipTrigger>
                <TooltipContent>{item.title}</TooltipContent>
                </Tooltip>                                   
                <span className="mr-2 hidden lg:block ">{item.title }</span>
                </a>
                
                </div>
                ))}
            
       
            
             
    </div>
  )
}

export default AppSideBar