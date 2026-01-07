"use client";

import React, { useEffect } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { MegaphoneIcon, MessageCircleMoreIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"



const Navbar = () => {
  const { user, isLoaded } = useUser()
const userRole = user?.publicMetadata?.role as string | undefined


  useEffect(() => {
    console.log('[Navbar] useUser()', { isLoaded, user })
  }, [isLoaded, user])

  return (
    <nav className='flex justify-between items-center px-4 py-2 bg-gray-200  dark:bg-transparent dark:text-slate-100'>
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
          <span className="text-md leading-5 font-medium text-right">{user?.firstName} {user?.lastName}</span>
          <span className="text-sm text-muted-foreground text-right">{userRole}</span>
        </div>
        
        <UserButton />
      </div>
    </nav>
  )
}

export default Navbar