"use client"

import Image from "next/image"
import { useMemo, useEffect, useState } from "react"
import { 
  ResponsiveContainer, 
  Legend, 
  ComposedChart, 
  Bar, 
  Line,
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid 
} from 'recharts'
import { useDateRange } from "@/components/contexts/DateRangeContext"
import { 
  generateVendasPorHora, 
  getVendasPorRange, 
  isDataValida,
  type VendaHora,
  type VendaDia 
} from "@/lib/vendas"

// Interfaces para dados transformados do chart
interface ChartDataItem {
  name: string;
  winner: number;
  elite: number;
  total: number;
}

// 🎯 Detecta granularidade do range (hora, dia ou mês)
type Granularidade = 'hora' | 'dia' | 'mes';

const detectarGranularidade = (start: Date, end: Date): Granularidade => {
  const isDiaUnico = start.getTime() === end.getTime();
  if (isDiaUnico) return 'hora';
  const diasDiferenca = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  // Se > 31 dias, agrupa por mês
  if (diasDiferenca > 31) return 'mes';
  return 'dia';
};

// 🗓️ Agrupa vendas por mês
const agruparPorMes = (vendas: VendaDia[]): ChartDataItem[] => {
  const vendasPorMes = new Map<string, { elite: number; winner: number }>();
  vendas.forEach(venda => {
    const date = new Date(venda.data);
    const mesAno = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
    const atual = vendasPorMes.get(mesAno) || { elite: 0, winner: 0 };
    vendasPorMes.set(mesAno, {
      elite: atual.elite + venda.elite,
      winner: atual.winner + venda.winner
    });
  });
  return Array.from(vendasPorMes.entries()).map(([mesAno, totais]) => ({
    name: mesAno,
    elite: totais.elite,
    winner: totais.winner,
    total: totais.elite + totais.winner
  }));
};

const VendasComposed = () => {
  const { startDate, endDate, dateRange } = useDateRange()
  const [isMounted, setIsMounted] = useState(false)

  // ✅ Garante que só renderiza números formatados no cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 📊 Log do estado do Context
  useEffect(() => {
    console.log('📈 [VENDAS_COMPOSED] Context atualizado:', {
      temRange: !!dateRange,
      startDate: startDate?.toLocaleDateString('pt-PT'),
      endDate: endDate?.toLocaleDateString('pt-PT'),
      granularidade: startDate && endDate ? detectarGranularidade(startDate, endDate) : 'N/A'
    })
  }, [startDate, endDate, dateRange])

  // 🎯 Processamento inteligente dos dados COM ACUMULADO
  const { chartData, granularidade } = useMemo<{ chartData: ChartDataItem[], granularidade: Granularidade }>(() => {
    console.log('🔄 [VENDAS_COMPOSED] Recalculando dados do chart...')

    // CASO 1: Nenhuma data selecionada - Mostrar última semana
    if (!startDate || !endDate) {
      console.log('⚠️ [VENDAS_COMPOSED] Sem datas selecionadas - Mostrando última semana')
      const hoje = new Date(2026, 0, 12) // 12 Janeiro 2026
      const seteDiasAtras = new Date(hoje)
      seteDiasAtras.setDate(hoje.getDate() - 6)
      try {
        const vendas = getVendasPorRange(seteDiasAtras, hoje)
        let acumulado = 0;
        return {
          chartData: vendas.map(venda => {
            const date = new Date(venda.data)
            const diaSemana = date.toLocaleDateString('pt-PT', { weekday: 'short' })
            acumulado += venda.elite + venda.winner;
            return {
              name: diaSemana,
              elite: venda.elite,
              winner: venda.winner,
              total: acumulado  // ✅ ACUMULADO progressivo
            }
          }),
          granularidade: 'dia'
        }
      } catch (error) {
        console.error('❌ [VENDAS_COMPOSED] Erro ao carregar última semana:', error)
        return { chartData: [], granularidade: 'dia' }
      }
    }

    // Detecta granularidade
    const gran = detectarGranularidade(startDate, endDate);
    console.log('🎯 [VENDAS_COMPOSED] Granularidade detectada:', gran);

    // CASO 2: Dia único (vendas por hora)
    if (gran === 'hora') {
      console.log('📅 [VENDAS_COMPOSED] MODO: Dia único -', startDate.toLocaleDateString('pt-PT'))
      if (!isDataValida(startDate)) {
        console.warn('⚠️ [VENDAS_COMPOSED] Data fora do intervalo (Janeiro 2026)')
        return { chartData: [], granularidade: 'hora' }
      }
      try {
        const vendasHora = generateVendasPorHora(startDate)
        console.log('✅ [VENDAS_COMPOSED] Dados por hora carregados:', vendasHora.length)
        let acumulado = 0;
        return {
          chartData: vendasHora.map(venda => {
            acumulado += venda.elite + venda.winner;
            return {
              name: venda.hora,
              elite: venda.elite,
              winner: venda.winner,
              total: acumulado  // ✅ ACUMULADO progressivo por hora
            }
          }),
          granularidade: 'hora'
        }
      } catch (error) {
        console.error('❌ [VENDAS_COMPOSED] Erro ao gerar vendas por hora:', error)
        return { chartData: [], granularidade: 'hora' }
      }
    }

    // CASO 3: Range de dias
    if (gran === 'dia') {
      console.log('📊 [VENDAS_COMPOSED] MODO: Range de dias')
      try {
        const vendasRange = getVendasPorRange(startDate, endDate)
        if (vendasRange.length === 0) {
          console.warn('⚠️ [VENDAS_COMPOSED] Nenhuma venda encontrada no range')
          return { chartData: [], granularidade: 'dia' }
        }
        console.log('✅ [VENDAS_COMPOSED] Vendas no range:', vendasRange.length)
        let acumulado = 0;
        return {
          chartData: vendasRange.map(venda => {
            const date = new Date(venda.data)
            const diaFormatado = date.toLocaleDateString('pt-PT', { 
              day: '2-digit', 
              month: 'short' 
            })
            acumulado += venda.elite + venda.winner;
            return {
              name: diaFormatado,
              elite: venda.elite,
              winner: venda.winner,
              total: acumulado  // ✅ ACUMULADO progressivo por dia
            }
          }),
          granularidade: 'dia'
        }
      } catch (error) {
        console.error('❌ [VENDAS_COMPOSED] Erro ao carregar vendas do range:', error)
        return { chartData: [], granularidade: 'dia' }
      }
    }

    // CASO 4: Range de meses (> 31 dias)
    if (gran === 'mes') {
      console.log('📆 [VENDAS_COMPOSED] MODO: Range de meses (trimestre/ano)')
      try {
        const vendasRange = getVendasPorRange(startDate, endDate)
        if (vendasRange.length === 0) {
          console.warn('⚠️ [VENDAS_COMPOSED] Nenhuma venda encontrada no range')
          return { chartData: [], granularidade: 'mes' }
        }
        const vendasAgrupadas = agruparPorMes(vendasRange);
        console.log('✅ [VENDAS_COMPOSED] Vendas agrupadas por mês:', vendasAgrupadas.length)
        let acumulado = 0;
        return {
          chartData: vendasAgrupadas.map(venda => {
            acumulado += venda.elite + venda.winner;
            return {
              name: venda.name,
              elite: venda.elite,
              winner: venda.winner,
              total: acumulado  // ✅ ACUMULADO progressivo por mês
            }
          }),
          granularidade: 'mes'
        }
      } catch (error) {
        console.error('❌ [VENDAS_COMPOSED] Erro ao carregar vendas do range:', error)
        return { chartData: [], granularidade: 'mes' }
      }
    }

    return { chartData: [], granularidade: 'dia' }
  }, [startDate, endDate])

  // 📊 Cálculo dinâmico do Y-axis máximo (+20% da maior venda total)
  const yAxisMax = useMemo(() => {
    if (chartData.length === 0) return 10000
    const maxTotal = Math.max(...chartData.map(item => item.total))
    const maxComMargem = Math.ceil(maxTotal * 1.2)
    console.log('📏 [VENDAS_COMPOSED] Y-axis configurado:', {
      maxTotal,
      maxComMargem,
      margem: '20%'
    })
    return maxComMargem
  }, [chartData])

  // 📊 Cálculo de métricas para o footer
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const totais = chartData.map(item => item.total);
    const soma = totais.reduce((acc, val) => acc + val, 0);
    const media = soma / totais.length;
    const max = Math.max(...totais);
    const min = Math.min(...totais);
    
    return {
      total: soma,
      media: Math.round(media),
      max,
      min,
      dias: chartData.length
    };
  }, [chartData]);

  // 🎨 Título dinâmico baseado no modo
  const chartTitle = useMemo(() => {
    if (!startDate || !endDate) return "Vendas Equipas - Última Semana"
    const isDiaUnico = startDate.getTime() === endDate.getTime()
    if (isDiaUnico) {
      return `Vendas por Hora - ${startDate.toLocaleDateString('pt-PT')}`
    }
    const diasDif = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (diasDif > 31) {
      return `Vendas por Mês - ${startDate.toLocaleDateString('pt-PT')} a ${endDate.toLocaleDateString('pt-PT')}`
    }
    return `Vendas por Dia - ${startDate.toLocaleDateString('pt-PT')} a ${endDate.toLocaleDateString('pt-PT')}`
  }, [startDate, endDate])

  return (
    <div className='w-full bg-white p-4 rounded-lg flex flex-col h-full'>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold text-gray-500">{chartTitle}</h1>
        <Image src="/moreDark.png" alt="more" width={20} height={20} />
      </div>

      {/* Chart Area - Ajustado para ocupar mais espaço vertical */}
      <div className="w-full flex-1 min-h-0">
        {chartData.length === 0 ? (
          // 🚫 Estado vazio - Sem dados
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🔭</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Sem Dados Disponíveis</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              {!startDate || !endDate 
                ? 'Selecione uma data ou período no calendário para visualizar as vendas'
                : 'Não existem registos de vendas para o período selecionado'
              }
            </p>
          </div>
        ) : (
          // ✅ Composed Chart - Barras + Linha
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 5,  // ✅ REDUZIDO: Menos espaço na base
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={chartData.length > 15 ? -45 : 0}
                textAnchor={chartData.length > 15 ? "end" : "middle"}
                height={chartData.length > 15 ? 60 : 40}  // ✅ REDUZIDO: Menos altura
              />
              <YAxis 
                domain={[0, yAxisMax]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius:"10px", 
                  border:"1px solid #e5e7eb", 
                  backgroundColor: 'white',
                  padding:"10px",
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                align="right" 
                verticalAlign="top" 
                wrapperStyle={{paddingBottom:"10px"}}
              />
              
              {/* Barras LADO A LADO - Elite */}
              <Bar 
                dataKey="elite" 
                fill="oklch(62.7% 0.265 303.9)" 
                name="Elite" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              
              {/* Barras LADO A LADO - Winner */}
              <Bar 
                dataKey="winner" 
                fill="oklch(68.1% 0.162 75.834)" 
                name="Winner" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              
              {/* Linha de ACUMULADO no topo */}
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="oklch(0.7 0.1142 38.41)" 
                strokeWidth={3}
                name="Acumulado" 
                dot={{ fill: 'oklch(0.7 0.1142 38.41)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer com métricas - Mais próximo do chart */}
      {metrics && (
        <div className="mt-2 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
              <p className="text-sm font-bold text-gray-700">{metrics.total.toLocaleString('pt-PT')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Média</p>
              <p className="text-sm font-bold text-gray-700">{metrics.media.toLocaleString('pt-PT')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Máximo</p>
              <p className="text-sm font-bold text-green-600">{metrics.max.toLocaleString('pt-PT')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Mínimo</p>
              <p className="text-sm font-bold text-orange-600">{metrics.min.toLocaleString('pt-PT')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Período</p>
              <p className="text-sm font-bold text-gray-700">{metrics.dias} {granularidade === 'hora' ? 'horas' : granularidade === 'mes' ? 'meses' : 'dias'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendasComposed