"use client"

import Image from "next/image"
import { useMemo, useEffect } from "react"
import { ResponsiveContainer, Legend, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts'
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

const TotalVendas = () => {
  const { startDate, endDate, dateRange } = useDateRange()

  // 🔍 Log do estado do Context
  useEffect(() => {
    console.log('📈 [TOTAL_VENDAS] Context atualizado:', {
      temRange: !!dateRange,
      startDate: startDate?.toLocaleDateString('pt-PT'),
      endDate: endDate?.toLocaleDateString('pt-PT'),
      granularidade: startDate && endDate ? detectarGranularidade(startDate, endDate) : 'N/A'
    })
  }, [startDate, endDate, dateRange])

  // 🎯 Processamento inteligente dos dados
  const { chartData, granularidade } = useMemo<{ chartData: ChartDataItem[], granularidade: Granularidade }>(() => {
    console.log('🔄 [TOTAL_VENDAS] Recalculando dados do chart...')

    // CASO 1: Nenhuma data selecionada - Mostrar última semana
    if (!startDate || !endDate) {
      console.log('⚠️ [TOTAL_VENDAS] Sem datas selecionadas - Mostrando última semana')
      
      const hoje = new Date(2026, 0, 12) // 12 Janeiro 2026
      const seteDiasAtras = new Date(hoje)
      seteDiasAtras.setDate(hoje.getDate() - 6)
      
      try {
        const vendas = getVendasPorRange(seteDiasAtras, hoje)
        
        return {
          chartData: vendas.map(venda => {
            const date = new Date(venda.data)
            const diaSemana = date.toLocaleDateString('pt-PT', { weekday: 'short' })
            
            return {
              name: diaSemana,
              elite: venda.elite,
              winner: venda.winner,
              total: venda.elite + venda.winner
            }
          }),
          granularidade: 'dia'
        }
      } catch (error) {
        console.error('❌ [TOTAL_VENDAS] Erro ao carregar última semana:', error)
        return { chartData: [], granularidade: 'dia' }
      }
    }

    // Detecta granularidade
    const gran = detectarGranularidade(startDate, endDate);
    console.log('🎯 [TOTAL_VENDAS] Granularidade detectada:', gran);

    // CASO 2: Dia único (vendas por hora)
    if (gran === 'hora') {
      console.log('📅 [TOTAL_VENDAS] MODO: Dia único -', startDate.toLocaleDateString('pt-PT'))
      
      if (!isDataValida(startDate)) {
        console.warn('⚠️ [TOTAL_VENDAS] Data fora do intervalo (Janeiro 2026)')
        return { chartData: [], granularidade: 'hora' }
      }
      
      try {
        const vendasHora = generateVendasPorHora(startDate)
        
        console.log('✅ [TOTAL_VENDAS] Dados por hora carregados:', vendasHora.length)
        
        return {
          chartData: vendasHora.map(venda => ({
            name: venda.hora,
            elite: venda.elite,
            winner: venda.winner,
            total: venda.elite + venda.winner
          })),
          granularidade: 'hora'
        }
      } catch (error) {
        console.error('❌ [TOTAL_VENDAS] Erro ao gerar vendas por hora:', error)
        return { chartData: [], granularidade: 'hora' }
      }
    }

    // CASO 3: Range de dias
    if (gran === 'dia') {
      console.log('📊 [TOTAL_VENDAS] MODO: Range de dias')
      
      try {
        const vendasRange = getVendasPorRange(startDate, endDate)
        
        if (vendasRange.length === 0) {
          console.warn('⚠️ [TOTAL_VENDAS] Nenhuma venda encontrada no range')
          return { chartData: [], granularidade: 'dia' }
        }
        
        console.log('✅ [TOTAL_VENDAS] Vendas no range:', vendasRange.length)
        
        return {
          chartData: vendasRange.map(venda => {
            const date = new Date(venda.data)
            const diaFormatado = date.toLocaleDateString('pt-PT', { 
              day: '2-digit', 
              month: 'short' 
            })
            
            return {
              name: diaFormatado,
              elite: venda.elite,
              winner: venda.winner,
              total: venda.elite + venda.winner
            }
          }),
          granularidade: 'dia'
        }
      } catch (error) {
        console.error('❌ [TOTAL_VENDAS] Erro ao carregar vendas do range:', error)
        return { chartData: [], granularidade: 'dia' }
      }
    }

    // CASO 4: Range de meses (> 31 dias)
    if (gran === 'mes') {
      console.log('📆 [TOTAL_VENDAS] MODO: Range de meses (trimestre/ano)')
      
      try {
        const vendasRange = getVendasPorRange(startDate, endDate)
        
        if (vendasRange.length === 0) {
          console.warn('⚠️ [TOTAL_VENDAS] Nenhuma venda encontrada no range')
          return { chartData: [], granularidade: 'mes' }
        }
        
        const vendasAgrupadas = agruparPorMes(vendasRange);
        
        console.log('✅ [TOTAL_VENDAS] Vendas agrupadas por mês:', vendasAgrupadas.length)
        
        return {
          chartData: vendasAgrupadas,
          granularidade: 'mes'
        }
      } catch (error) {
        console.error('❌ [TOTAL_VENDAS] Erro ao carregar vendas do range:', error)
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
    
    console.log('📏 [TOTAL_VENDAS] Y-axis configurado:', {
      maxTotal,
      maxComMargem,
      margem: '20%'
    })
    
    return maxComMargem
  }, [chartData])

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
    <div className='w-full bg-white p-4 rounded-lg'>
      <div className="flex justify-between items-center ">
        <h1 className="text-lg font-semibold text-gray-500 mb-4">{chartTitle}</h1>
        <Image src="/moreDark.png" alt="more" width={20} height={20} />
      </div>
      
      <div className="w-full">
        {chartData.length === 0 ? (
          // 🚫 Estado vazio - Sem dados
          <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Sem Dados Disponíveis</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              {!startDate || !endDate 
                ? 'Selecione uma data ou período no calendário para visualizar as vendas'
                : 'Não existem registos de vendas para o período selecionado'
              }
            </p>
          </div>
        ) : (
          // ✅ Chart com dados
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData} 
              style={{ 
                width: '100%', 
                maxWidth: '900px', 
                height: '350px', 
                maxHeight: '400px', 
                aspectRatio: 1 
              }}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 20,
              }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={chartData.length > 15 ? -45 : 0}
                textAnchor={chartData.length > 15 ? "end" : "middle"}
                height={chartData.length > 15 ? 80 : 60}
              />
              <YAxis 
                domain={[0, yAxisMax]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius:"10px", 
                  border:"1px solid #eee", 
                  paddingTop:"0px", 
                  margin:"5px"
                }}
              />
              <Legend 
                align="right" 
                verticalAlign="top" 
                wrapperStyle={{paddingBottom:"10px"}}
              />
              
              {/* Elite */}
              <Area 
                type="monotone" 
                dataKey="elite" 
                stackId="1" 
                stroke="oklch(62.7% 0.265 303.9)" 
                fill="oklch(62.7% 0.265 303.9)" 
                name="Elite" 
                legendType="circle"
              />
              
              {/* Winner */}
              <Area 
                type="monotone" 
                dataKey="winner" 
                stackId="1" 
                stroke="oklch(68.1% 0.162 75.834)" 
                fill="oklch(68.1% 0.162 75.834)" 
                name="Winner" 
                legendType="circle"
              />
              
              {/* Total */}
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="1" 
                stroke="oklch(0.7 0.1142 38.41)" 
                fill="oklch(0.7 0.1142 38.41)" 
                name="Total" 
                legendType="circle"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default TotalVendas