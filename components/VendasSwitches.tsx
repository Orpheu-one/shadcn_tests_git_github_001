import React, { useState, useEffect, useCallback } from 'react';
// Importa o ToggleSwitch.tsx
import ToggleSwitch from './ToggleSwitch'; 

// 1. Definição do tipo para o estado de venda final
export type VendaStatus = {
    tipo: 'Venda' | 'Callback';
    modalidade: 'F2F' | 'Remoto';
    status: 'Projecto' | 'Fechada';
}

// 2. Definição da interface de props
interface VendasSwitchesProps {
    onValuesChange: (values: VendaStatus) => void;
}

/**
 * Componente que gere a lógica dos três switches de Vendas (Tipo, Modalidade, Status).
 */
const VendasSwitches: React.FC<VendasSwitchesProps> = ({ onValuesChange }) => {

    // 3. ESTADO DOS SWITCHES (booleanos internos)
    
    // S1 (TIPO): Venda(false)/Callback(true). Default: Venda (false).
    const [isCallback, setIsCallback] = useState(false); 
    
    // S2 (MODALIDADE): F2F(false)/Remoto(true). Default: F2F (false).
    const [isRemoto, setIsRemoto] = useState(false);     
    
    // S3 (STATUS): Projecto(false)/Fechada(true). Default: Projecto (false).
    const [isFechada, setIsFechada] = useState(false); 


    // 4. LÓGICA DE DEPENDÊNCIA E DESATIVAÇÃO (CORRIGIDA)
    
    // S2 (Modalidade) está sempre ativo.
    const isModalidadeActive = true; 
    
    // S3 (Status) só está ativo se o Tipo for Venda (isCallback é false).
    const isStatusActive = !isCallback; 


    // 5. EFEITOS DE COORDENAÇÃO (Garante que o Status reseta quando a lógica o exige)

    // Efeito: Se o TIPO mudar para Callback (isCallback=true),
    // o Status (S3) deve ser obrigatoriamente Projecto (isFechada=false) e desativado.
    useEffect(() => {
        if (isCallback) {
            // Força o Status para 'Projecto' quando o Tipo é 'Callback'.
            setIsFechada(false); 
        }
        // O switch Modalidade (S2) não é reajustado, pois é sempre independente.
    }, [isCallback]);


    // 6. VALORES FINAIS E CALLBACK (Calcula e envia os valores finais de texto)
    useEffect(() => {
        // Cálculo do Tipo (Venda | Callback)
        const tipo: 'Venda' | 'Callback' = isCallback ? 'Callback' : 'Venda'; 
        
        // Cálculo da Modalidade (Usa o estado de S2, que é sempre ativo)
        const modalidade: 'F2F' | 'Remoto' = isRemoto ? 'Remoto' : 'F2F';
        
        // Cálculo do Status:
        // Se o switch estiver inativo (Tipo=Callback), o status é Projecto.
        // Caso contrário (Tipo=Venda), usa o valor do switch (isFechada).
        const status: 'Projecto' | 'Fechada' = isStatusActive 
            ? (isFechada ? 'Fechada' : 'Projecto') 
            : 'Projecto';

        // Envia os valores finais para o componente pai
        onValuesChange({ tipo, modalidade, status });

    }, [isCallback, isRemoto, isFechada, isStatusActive, onValuesChange]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1º Switch: Tipo (Venda / Callback) */}
            <div className="col-span-1">
                <ToggleSwitch 
                    label="1. Tipo de Evento"
                    offLabel="Venda"
                    onLabel="Callback"
                    isChecked={isCallback}
                    onChange={setIsCallback}
                    disabled={false} // Sempre ativo
                />
            </div>

            {/* 2º Switch: Modalidade (F2F / Remoto) */}
            <div className="col-span-1">
                <ToggleSwitch 
                    label="2. Modalidade"
                    offLabel="F2F" 
                    onLabel="Remoto"
                    isChecked={isRemoto} 
                    onChange={setIsRemoto}
                    disabled={!isModalidadeActive} // Sempre False (ou seja, ativo)
                />
            </div>

            {/* 3º Switch: Status (Projeto / Fechada) */}
            <div className="col-span-1">
                <ToggleSwitch 
                    label="3. Status"
                    offLabel="Projeto"
                    onLabel="Fechada"
                    isChecked={isFechada}
                    onChange={setIsFechada}
                    // Desativa se isStatusActive for False (ou seja, se Tipo for Callback)
                    disabled={!isStatusActive} 
                />
            </div>
        </div>
    );
};

export default VendasSwitches;