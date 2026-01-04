import React, { useState, useEffect, useCallback } from 'react';
import ToggleSwitch from './ToggleSwitch';

// Tipo expandido para incluir 'Perdida'
export type VendaStatus = {
  tipo: 'Venda' | 'Callback';
  modalidade: 'F2F' | 'Remoto';
  status: 'Projecto' | 'Fechada' | 'Perdida';
}

interface VendasSwitchesProps {
  onValuesChange: (values: VendaStatus) => void;
  initialValues?: VendaStatus;
  userRole?: string;
}

const VendasSwitches: React.FC<VendasSwitchesProps> = ({ 
  onValuesChange, 
  initialValues,
  userRole = 'operator' 
}) => {

  const [isCallback, setIsCallback] = useState(initialValues?.tipo === 'Callback');
  const [isRemoto, setIsRemoto] = useState(initialValues?.modalidade === 'Remoto');
  
  // Estado: 0=Projecto, 1=Fechada, 2=Perdida
  const [statusIndex, setStatusIndex] = useState(() => {
    if (initialValues?.status === 'Fechada') return 1;
    if (initialValues?.status === 'Perdida') return 2;
    return 0;
  });

  const isModalidadeActive = true;
  const isStatusActive = !isCallback;
  const isAdminOrSupervisor = userRole === 'admin' || userRole === 'supervisor';

  // Reset quando mudar para Callback
  useEffect(() => {
    if (isCallback) {
      setStatusIndex(0);
    }
  }, [isCallback]);

  // Calcula e envia valores finais
  useEffect(() => {
    const tipo: 'Venda' | 'Callback' = isCallback ? 'Callback' : 'Venda';
    const modalidade: 'F2F' | 'Remoto' = isRemoto ? 'Remoto' : 'F2F';
    
    let status: 'Projecto' | 'Fechada' | 'Perdida' = 'Projecto';
    
    if (isStatusActive) {
      if (isAdminOrSupervisor) {
        // Admin/Supervisor: pode escolher qualquer status
        status = statusIndex === 0 ? 'Projecto' : statusIndex === 1 ? 'Fechada' : 'Perdida';
      } else {
        // Operador
        if (isRemoto) {
          // Remote: só Projecto ou Fechada
          status = statusIndex >= 1 ? 'Fechada' : 'Projecto';
        } else {
          // F2F: só Projecto
          status = 'Projecto';
        }
      }
    }

    onValuesChange({ tipo, modalidade, status });
  }, [isCallback, isRemoto, statusIndex, isStatusActive, isAdminOrSupervisor, onValuesChange]);

  // Handler para ciclar entre estados
  const handleStatusChange = () => {
    if (!isStatusActive) return;
    
    if (isAdminOrSupervisor) {
      // Ciclo: Projecto -> Fechada -> Perdida -> Projecto
      setStatusIndex((prev) => (prev + 1) % 3);
    } else {
      if (isRemoto) {
        // Remote: toggle entre Projecto/Fechada
        setStatusIndex((prev) => prev === 0 ? 1 : 0);
      } else {
        // F2F: mantém sempre em Projecto
        setStatusIndex(0);
      }
    }
  };

  // Label dinâmico
  const getStatusLabel = () => {
    if (!isStatusActive) return 'Projecto';
    
    if (isAdminOrSupervisor) {
      return statusIndex === 0 ? 'Projecto' : statusIndex === 1 ? 'Fechada' : 'Perdida';
    } else {
      if (isRemoto) {
        return statusIndex === 0 ? 'Projecto' : 'Fechada';
      }
      return 'Projecto';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1º Switch: Tipo */}
      <div className="col-span-1">
        <ToggleSwitch 
          label="1. Tipo de Evento"
          offLabel="Venda"
          onLabel="Callback"
          isChecked={isCallback}
          onChange={setIsCallback}
          disabled={false}
        />
      </div>

      {/* 2º Switch: Modalidade */}
      <div className="col-span-1">
        <ToggleSwitch 
          label="2. Modalidade"
          offLabel="F2F" 
          onLabel="Remoto"
          isChecked={isRemoto} 
          onChange={setIsRemoto}
          disabled={!isModalidadeActive}
        />
      </div>

      {/* 3º Switch: Status com 3 estados */}
      <div className="col-span-1">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">3. Status</span>
          <button
            type="button"
            onClick={handleStatusChange}
            disabled={!isStatusActive || (!isAdminOrSupervisor && !isRemoto)}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm transition-all
              ${!isStatusActive || (!isAdminOrSupervisor && !isRemoto)
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : statusIndex === 0
                  ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                  : statusIndex === 1
                    ? 'bg-green-200 text-green-800 hover:bg-green-300'
                    : 'bg-red-200 text-red-800 hover:bg-red-300'
              }
            `}
          >
            {getStatusLabel()}
          </button>
          {isAdminOrSupervisor && isStatusActive && (
            <span className="text-xs text-gray-500 text-center">
              Clique para alternar
            </span>
          )}
          {!isAdminOrSupervisor && isRemoto && isStatusActive && (
            <span className="text-xs text-gray-500 text-center">
              Clique para alternar
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendasSwitches;