'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SemAcessoPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">⛔ Sem Acesso</h1>
        <p className="text-gray-700 mb-6">
          Problema de autenticação. A investigar...
        </p>
        
        {/* 🚨 BOTÃO DE DEBUG - REMOVER DEPOIS */}
        <button
          onClick={() => router.push('/operador')}
          className="mb-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          🔧 DEBUG: Forçar /operador
        </button>
        
        <Link
          href="/" 
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}