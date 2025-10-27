import { LogOut, MegaphoneIcon, MessageCircleMoreIcon, Settings, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Image from "next/image"



const Navbar = () => {
  return (


    <nav className='flex justify-between items-center p-4 bg-gray-200  dark:bg-black dark:text-slate-50'>
      {/*LEFT SIDE*/}
      <div className="flex items-center justify-between flex-row gap-2">
        <Link href="/" className="flex items-center">
        <Image src="/connectados_logo_002.png" alt="Logo" width={60} height={60} />
          <h1 className="hidden lg:block  items-center mx-2 text-2xl ">connectados</h1>
        </Link>
      </div>
      {/*MIDDLE SIDE*/}
      <div className="hidden md:flex items-center justify-left px-12 ring-[1px] ring-white rounded-full">
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent focus:outline-none py-2"
        />
      </div>

      {/*RIGHT SIDE*/}
      <div className="flex items-center gap-6">
        <div className="flex px-2 relative">
          <div className="absolute rounded-full w-5 h-5 -top-3 -right-1 bg-purple-600 flex items-center justify-center cursor-pointer text-sm font-semibold">2</div>
          <Link className="" href="/">
        <MessageCircleMoreIcon className=""/>
        </Link>
        </div>

        <div className="flex px-2  relative">
          <div className="absolute rounded-full w-5 h-5 -top-3 -right-1 bg-purple-600 flex items-center justify-center cursor-pointer text-sm font-semibold">1</div>
          <Link className="" href="/">
        <MegaphoneIcon />
        </Link>
        </div>
        <div className="flex flex-col pb-2">
          
          <span className="text-sm leading-5 font-medium text-right">User Jonh Doe</span>
           <span className="text-xs text-muted-foreground text-right">admin</span>
        </div>
        

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
          <AvatarImage src="/avatar.png "  width={60} height={60}/>

          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
          </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-[1.2rem] h-[1,2rem] mr-2"/>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-[1.2rem] h-[1,2rem] mr-2"/>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <LogOut className="w-[1.2rem] h-[1,2rem] mr-2"/>
                Logout
              </DropdownMenuItem>
             
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

export default Navbar