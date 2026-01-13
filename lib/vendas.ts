// lib/vendas.ts
// Dados de vendas fictícios para Janeiro 2026

export interface VendaHora {
  hora: string; // Formato: "10:00", "11:00", etc.
  elite: number;
  winner: number;
}

export interface VendaDia {
  data: string; // Formato: "2026-01-01"
  elite: number;
  winner: number;
}

// Função auxiliar para gerar vendas aleatórias
const randomVendas = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ✅ Gera vendas por hora APENAS entre 10h-20h (horário de funcionamento)
export const generateVendasPorHora = (date: Date): VendaHora[] => {
  console.log('📊 [VENDAS] Gerando dados por hora (10h-20h) para:', date.toLocaleDateString('pt-PT'));
  
  const vendas: VendaHora[] = [];
  
  // ✅ APENAS 10h até 20h (11 horas de funcionamento)
  for (let hora = 10; hora <= 20; hora++) {
    const horaStr = hora.toString().padStart(2, '0') + ':00';
    
    // Simulação: Mais vendas durante almoço (12h-14h) e fim de tarde (18h-20h)
    const isHorarioPico = (hora >= 12 && hora <= 14) || (hora >= 18 && hora <= 20);
    const multiplicador = isHorarioPico ? 1.5 : 1;
    
    vendas.push({
      hora: horaStr,
      elite: Math.round(randomVendas(80, 400) * multiplicador),
      winner: Math.round(randomVendas(60, 350) * multiplicador),
    });
  }
  
  console.log('✅ [VENDAS] Total de registos gerados (10h-20h):', vendas.length);
  return vendas;
};

// ✅ Verifica se é dia útil (segunda a sexta)
const isDiaUtil = (date: Date): boolean => {
  const diaSemana = date.getDay();
  return diaSemana >= 1 && diaSemana <= 5; // 1=Segunda, 5=Sexta
};

// ✅ Gera vendas APENAS para dias úteis de Janeiro 2026
export const generateVendasJaneiro2026 = (): VendaDia[] => {
  console.log('📊 [VENDAS] Gerando dados para Janeiro 2026 (apenas dias úteis)');
  
  const vendas: VendaDia[] = [];
  const ano = 2026;
  const mes = 0; // Janeiro (0-indexed)
  
  // Janeiro tem 31 dias
  for (let dia = 1; dia <= 31; dia++) {
    const date = new Date(ano, mes, dia);
    
    // ✅ SKIP sábados e domingos
    if (!isDiaUtil(date)) {
      console.log('⏭️  [VENDAS] Pulando fim de semana:', date.toLocaleDateString('pt-PT'));
      continue;
    }
    
    const dataStr = date.toISOString().split('T')[0];
    
    vendas.push({
      data: dataStr,
      elite: randomVendas(2500, 5500),
      winner: randomVendas(2000, 5000),
    });
  }
  
  console.log('✅ [VENDAS] Total de dias úteis gerados:', vendas.length);
  return vendas;
};

// Cache dos dados de Janeiro 2026 (evita recalcular)
let cachedJaneiroData: VendaDia[] | null = null;

export const getVendasJaneiro2026 = (): VendaDia[] => {
  if (!cachedJaneiroData) {
    cachedJaneiroData = generateVendasJaneiro2026();
  }
  return cachedJaneiroData;
};

// Filtra vendas por range de datas (já remove fins de semana automaticamente)
export const getVendasPorRange = (startDate: Date, endDate: Date): VendaDia[] => {
  console.log('🔍 [VENDAS] Filtrando vendas entre:', {
    inicio: startDate.toLocaleDateString('pt-PT'),
    fim: endDate.toLocaleDateString('pt-PT')
  });
  
  const todasVendas = getVendasJaneiro2026();
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const filtered = todasVendas.filter(venda => {
    return venda.data >= startStr && venda.data <= endStr;
  });
  
  console.log('✅ [VENDAS] Registos filtrados (dias úteis):', filtered.length);
  return filtered;
};

// Verifica se uma data está dentro de Janeiro 2026
export const isDataValida = (date: Date): boolean => {
  const ano = date.getFullYear();
  const mes = date.getMonth();
  return ano === 2026 && mes === 0;
};