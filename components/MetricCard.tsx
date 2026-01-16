"use client"

import Image from "next/image"
import { useMemo } from "react"
import { useDateRange } from "@/components/contexts/DateRangeContext"
import { 
  generateVendasPorHora, 
  getVendasPorRange, 
  isDataValida,
} from "@/lib/vendas"

type MetricType = 'total' | 'media' | 'minimo' | 'percentagem';

interface MetricCardProps {
  type: MetricType;
}

const MetricCard = ({ type }: MetricCardProps) => {
  const { startDate, endDate } = useDateRange()

  // 🎯 Calcula as métricas baseado no range selecionado
  const { value, period } = useMemo(() => {
    // Default: última semana
    if (!startDate || !endDate) {
      const hoje = new Date(2026, 0, 12)
      const seteDiasAtras = new Date(hoje)
      seteDiasAtras.setDate(hoje.getDate() - 6)
      
      try {
        const vendas = getVendasPorRange(seteDiasAtras, hoje)
        const totais = vendas.map(v => v.elite + v.winner)
        const soma = totais.reduce((acc, val) => acc + val, 0)
        
        return {
          value: calculateMetric(type, totais, soma),
          period: "Semana"
        }
      } catch {
        return { value: 0, period: "Semana" }
      }
    }

    // Dia único
    const isDiaUnico = startDate.getTime() === endDate.getTime()
    if (isDiaUnico) {
      if (!isDataValida(startDate)) {
        return { value: 0, period: startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) }
      }
      
      try {
        const vendasHora = generateVendasPorHora(startDate)
        const totais = vendasHora.map(v => v.elite + v.winner)
        const soma = totais.reduce((acc, val) => acc + val, 0)
        
        return {
          value: calculateMetric(type, totais, soma),
          period: startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
        }
      } catch {
        return { value: 0, period: startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) }
      }
    }

    // Range de dias
    try {
      const vendas = getVendasPorRange(startDate, endDate)
      const totais = vendas.map(v => v.elite + v.winner)
      const soma = totais.reduce((acc, val) => acc + val, 0)
      
      const start = startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
      const end = endDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
      
      return {
        value: calculateMetric(type, totais, soma),
        period: `${start} - ${end}`
      }
    } catch {
      return { value: 0, period: "N/A" }
    }
  }, [startDate, endDate, type])

  // 🎨 Config de cada tipo de métrica
  const metricConfig = {
    total: { label: "Total", color: "text-gray-700" },
    media: { label: "Média", color: "text-blue-600" },
    minimo: { label: "Mínimo", color: "text-orange-600" },
    percentagem: { label: "Taxa Conversão", color: "text-green-600" }
  }

  const config = metricConfig[type]

  return (
    <div className='rounded-xl odd:dark:bg-gray-300 even:dark:bg-yellow-400 p-4 flex-1 min-w-[200px]'>
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-gray-600 bg-white rounded-full px-2 py-1 font-semibold">
          {period}
        </span>
        <Image src="/more.png" alt="more" width={20} height={20} />
      </div>
      <h1 className={`text-2xl font-semibold mt-2 ${config.color}`}>
        {type === 'percentagem' ? `${value}%` : value.toLocaleString('pt-PT')}
      </h1>
      <h2 className="capitalize text-sm font-medium text-gray-600">{config.label}</h2>
    </div>
  )
}

// 🧮 Função helper para calcular cada métrica
function calculateMetric(type: MetricType, totais: number[], soma: number): number {
  if (totais.length === 0) return 0

  switch (type) {
    case 'total':
      return soma
    case 'media':
      return Math.round(soma / totais.length)
    case 'minimo':
      return Math.min(...totais)
    case 'percentagem':
      // TODO: Implementar cálculo real quando tiveres os dados de conversão
      // Por agora retorna um valor mock entre 70-95%
      return Math.round(75 + Math.random() * 20)
    default:
      return 0
  }
}

export default MetricCard