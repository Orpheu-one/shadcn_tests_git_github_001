import React from 'react';

// 1. Definição da interface de props
interface ToggleSwitchProps {
    label: string;
    onLabel: string;
    offLabel: string;
    isChecked: boolean;
    // Função chamada quando o switch é clicado, devolvendo o novo estado
    onChange: (checked: boolean) => void; 
    disabled?: boolean;
}

/**
 * Componente de Switch genérico e acessível.
 * A interação é capturada por um elemento wrapper que chama o onChange.
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
    label, 
    onLabel, 
    offLabel, 
    isChecked, 
    onChange, 
    disabled = false 
}) => {

  // Classes Tailwind CSS
  const baseClass = `flex items-center space-x-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  const bgColorClass = isChecked ? 'bg-purple-600' : 'bg-gray-300'; // Corrigido para uma cor mais escura para melhor contraste
  const handleTranslate = isChecked ? 'translate-x-[30px]' : 'translate-x-0.5'; // Ajustado o valor para melhor centralização e movimento
  
  // FUNÇÃO DE TOGGLE: Essencial para atualizar o estado no componente pai
  const handleToggle = () => {
    if (!disabled) {
      // Chama a função passada pelo pai (e.g., setIsCallback) com o novo estado
      onChange(!isChecked); 
    }
  };

  return (
    <div className="flex flex-col gap-1 items-start w-full">
      {/* Rótulo Principal (Label) */}
      <span className="text-sm font-semibold text-gray-700">{label}</span>

      <div className={baseClass}>
        
        {/* Rótulo da Opção Desligada (Esquerda) */}
        <span className={`text-sm select-none ${isChecked ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
          {offLabel}
        </span>
        
        {/*
          CORREÇÃO CRÍTICA: O onClick está num elemento DIV que envolve
          apenas o visual do switch, garantindo que o clique em qualquer
          parte da barra ou do círculo dispara o evento.
        */}
        <div 
            className="inline-flex relative items-center min-w-[64px]" // min-width garante tamanho
            onClick={handleToggle}
            role="button"
            tabIndex={disabled ? -1 : 0} // Torna-o acessível por teclado
            aria-checked={isChecked}
            aria-label={`${label} está ${isChecked ? onLabel : offLabel}`}
        >
          {/* Input escondido (para acessibilidade e estado controlado) */}
          <input
            type="checkbox"
            checked={isChecked}
            // Não precisa de onChange aqui, pois o clique é gerido pelo DIV pai
            onChange={() => {}} 
            disabled={disabled}
            className="sr-only peer" 
          />
          
          {/* A área do Slider (a barra) */}
          <div 
            className={`
              w-[60px] h-[30px] rounded-full 
              ${bgColorClass}
              transition-colors duration-300 ease-in-out
              shadow-inner shadow-gray-400
              flex items-center 
              p-0.5
            `}
          >
            {/* O Handle (O círculo móvel) */}
            <div 
              className={`
                h-[24px] w-[24px] rounded-full 
                bg-white
                transform 
                ${handleTranslate} 
                transition-transform duration-300 ease-in-out
                shadow-md 
              `}
            />
          </div>
        </div>
        
        {/* Rótulo da Opção Ligada (Direita) */}
        <span className={`text-sm select-none ${isChecked ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
          {onLabel}
        </span>
      </div>
    </div>
  );
};

export default ToggleSwitch;