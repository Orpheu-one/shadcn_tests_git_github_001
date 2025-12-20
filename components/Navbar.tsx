"use client"

import React from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { MegaphoneIcon, MessageCircleMoreIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const Navbar = () => {
  const { user, isLoaded } = useUser()

  // Get user role from publicMetadata
  const userRole = user?.publicMetadata?.role as string | undefined
  
  // Get user's full name
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'
  
  // Role display mapping
  const roleDisplay: Record<string, string> = {
    'admin': 'Administrador',
    'super-admin': 'Super Admin',
    'supervisor': 'Supervisor',
    'operador': 'Operador',
    'operator': 'Operador',
    'vendedor': 'Vendedor',
    'd2d': 'Vendedor D2D',
  }

  return (
    <nav className='flex justify-between items-center px-4 py-2 bg-gray-200 dark:bg-gray-900 dark:text-slate-50'>
      {/* LEFT SIDE */}
      <div className="flex items-center justify-between flex-row gap-2">
        <Link href="/" className="flex">
          <Image src="/connectados_logo_white.png" alt="Logo" width={40} height={40} />
          <div className="flex flex-col items-center">
            <h1 className="hidden lg:block items-top mx-2 mt-2 text-2xl text-white">connectados</h1>
          </div>
        </Link>
      </div>

      {/* MIDDLE SIDE */}
      <div className="hidden md:flex items-center justify-left px-12 ring-[1px] ring-white rounded-full">
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent focus:outline-none py-2"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        {/* Messages */}
        <div className="flex px-2 relative">
          <div className="absolute rounded-full w-5 h-5 -top-3 -right-1 bg-purple-600 flex items-center justify-center cursor-pointer text-sm font-semibold">
            2
          </div>
          <Link href="/">
            <MessageCircleMoreIcon />
          </Link>
        </div>

        {/* Announcements */}
        <div className="flex px-2 relative">
          <div className="absolute rounded-full w-5 h-5 -top-3 -right-1 bg-purple-600 flex items-center justify-center cursor-pointer text-sm font-semibold">
            1
          </div>
          <Link href="/">
            <MegaphoneIcon />
          </Link>
        </div>

        {/* User Info - NOW DYNAMIC */}
        {isLoaded && user ? (
          <div className="flex flex-col pb-2">
            <span className="text-sm leading-5 font-medium text-right text-white">
              {fullName}
            </span>
            <span className="text-xs text-muted-foreground text-right">
              {roleDisplay[userRole || ''] || userRole || 'Sem role'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col pb-2">
            <span className="text-sm leading-5 font-medium text-right text-gray-400">
              A carregar...
            </span>
          </div>
        )}
        
        {/* Clerk UserButton - Shows user avatar automatically */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-10 h-10" // Custom size
            }
          }}
        />
      </div>
    </nav>
  )
}

export default Navbar