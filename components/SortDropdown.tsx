"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { Calendar, ArrowUpDown, User, Target, Hash, Check } from "lucide-react"

type SortOption = {
  value: string
  label: string
  icon?: string // 'calendar' | 'user' | 'target' | 'hash'
}

type SortDropdownProps = {
  options: SortOption[]
}

const SortDropdown = ({ options }: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentSort = searchParams.get('sort') || options[0].value

  // ✅ Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    params.set('page', '1')
    
    router.replace(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  // ✅ Renderiza ícone Lucide baseado no tipo
  const getIcon = (icon?: string) => {
    const iconClass = "h-4 w-4"
    switch (icon) {
      case 'calendar':
        return <Calendar className={iconClass} />
      case 'user':
        return <User className={iconClass} />
      case 'target':
        return <Target className={iconClass} />
      case 'hash':
        return <Hash className={iconClass} />
      default:
        return <ArrowUpDown className={iconClass} />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Sort */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-purple-500 p-2 hover:bg-purple-600 transition duration-150 relative"
      >
        <Image src="/sort.png" alt="Ordenar" width={15} height={15} />
        
        {/* ✅ Indicador de sorting ativo */}
        {currentSort !== options[0].value && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Dropdown - ✅ ESTILO ATUALIZADO */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-300 rounded-lg shadow-lg border border-gray-400 z-50 overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                  currentSort === option.value
                    ? 'bg-purple-500 text-white font-semibold'
                    : 'text-gray-800 hover:bg-gray-400 hover:text-black'
                }`}
              >
                {/* ✅ Ícone Lucide */}
                <span className="flex-shrink-0">
                  {getIcon(option.icon)}
                </span>
                
                {/* Label */}
                <span className="flex-1">{option.label}</span>
                
                {/* ✅ Checkmark quando selecionado */}
                {currentSort === option.value && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SortDropdown