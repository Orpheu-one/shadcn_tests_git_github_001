"use client";

import React, { useEffect } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { LogOut, MegaphoneIcon, MessageCircleMoreIcon, Settings, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Image from "next/image"

const Navbar = () => {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    console.log('[Navbar] useUser()', { isLoaded, user })
  }, [isLoaded, user])

  return (
    <nav className='flex justify-between items-center px-4 py-2 bg-gray-200  dark:bg-gray-900 dark:text-slate-50'>
      {/*LEFT SIDE*/}
      <div className="flex items-center justify-between flex-row gap-2">
        <Link href="/" className="flex">
          <Image src="/connectados_logo_white.png" alt="Logo" width={40} height={40} />
          <div className="flex flex-col items-center">
            <h1 className="hidden lg:block  items-top mx-2 mt-2 text-2xl text-white">connectados</h1>
          </div>
        </Link>
      </div>

      {/*MIDDLE SIDE*/}
      {/* Fixed logic block below: wrapped in {} and used valid JSX comments */}
      {(() => {
        try {
          const { useUser: useUserInternal } = require('@clerk/nextjs')
          const { user: userInt, isLoaded: isLoadedInt } = useUserInternal()
          if (typeof window !== 'undefined') {
            setTimeout(() => console.log('[Navbar Internal Debug]', { isLoadedInt, userInt }), 0)
          }
        } catch (e) {
          // ignore
        }
        return null; // JSX requires a return value (even if null)
      })()}

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
        
        <UserButton />
      </div>
    </nav>
  )
}

export default Navbar