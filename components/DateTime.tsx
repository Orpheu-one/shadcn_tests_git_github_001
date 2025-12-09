// components/DateTime.tsx (ou similar)
import React, { useState, useEffect } from 'react';

// --- 1. Função de Formatação (Mantida a lógica original) ---
// Pode ficar dentro ou fora do componente, mas por simplicidade, deixamos dentro 
// se for específica deste componente ou mantemos separada se for utilitária.
// Vamos movê-la para dentro para usar a sintaxe limpa de componente.

const formatCurrentDateTime = () => {
    const now = new Date();
    
    // Formato Data: dd/mm/yyyy
    const dateOptions: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    };
    // pt-PT para dd/mm/yyyy
    const formattedDate = now.toLocaleDateString('pt-PT', dateOptions); 

    // Formato Hora: hh:mm
    const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hourCycle: 'h23' // Garante o formato 24 horas (00 a 23)
    };
    const formattedTime = now.toLocaleTimeString('pt-PT', timeOptions);

    return {
        date: formattedDate,
        time: formattedTime
    };
}


// --- 2. Componente React com Export Padrão ---
const DateTime = () => {
    // Usar estado para armazenar e atualizar a data/hora
    const [dateTime, setDateTime] = useState(formatCurrentDateTime());

    // Usar useEffect para atualizar a data/hora apenas uma vez (no carregamento)
    // Se você quisesse que o tempo atualizasse a cada minuto, usaria setInterval.
    useEffect(() => {
        // Neste caso, queremos a data/hora de quando a venda foi iniciada/visualizada.
        // O valor é definido na montagem do componente.
    }, []); 

    return (
      
        <span className="flex jestify-between text-sm text-gray-500 font-medium">
            Data: {dateTime.date} | Hora: {dateTime.time}
        </span>
    );
}

export default DateTime; 
// export default DateTime; já está na linha de cima