// components/RadioButton.tsx
import React from 'react';
import { FieldValues, UseFormRegister, FieldError, Path } from 'react-hook-form';

export const EVENT_OPTIONS = ["Venda", "Callback"]; 
const HIGHLIGHT_COLOR = 'rgb(245 158 11)'; // Yellow-500 para Selected

interface RadioButtonProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  options: string[];
  register: UseFormRegister<TFieldValues>;
  error?: FieldError;
}

const RadioButton = <TFieldValues extends FieldValues>({ 
  name, 
  options, 
  register, 
  error 
}: RadioButtonProps<TFieldValues>) => {
  
  // 1. CLASSE BASE: REMOVEMOS A BORDA PRETA INDIVIDUAL
  const baseSpanClasses = `block cursor-pointer bg-white py-1.5 px-3 relative 
                           tracking-wider text-[#3e4963] text-center duration-200 transition-colors
                           hover:bg-purple-500 hover:text-white`; 
  
  // 2. CLASES DE SELEÇÃO: Mantidas
  const checkedSpanClasses = `group-has-checked:shadow-[0_0_0_0.0625em] group-has-checked:shadow-[${HIGHLIGHT_COLOR}]
                              group-has-checked:bg-yellow-500 group-has-checked:z-10 group-has-checked:text-white`;
                              
  // 3. CLASES DE FOCO: Removidas (sem ring)
  const focusRingClasses = ``;

  const inputHiddenClasses = "sr-only"; 

  return (
    <div className="lg:col-span-3">
        {/* 4. A BORDA PRETA DE 1PX AGORA ESTÁ AQUI (border border-black) */}
        <div className="mydict flex flex-wrap justify-center mt-2 border border-black rounded-md overflow-hidden"> 
            
            {options.map((option, index) => (
            
            <label key={option} className="group flex-1">
                <input 
                type="radio" 
                value={option}
                className={inputHiddenClasses}
                {...register(name)}
                defaultChecked={option === "Venda"} 
                />
                
                <span className={`
                  ${baseSpanClasses} 
                  ${checkedSpanClasses} 
                  ${focusRingClasses}
                  
                  // 5. SEPARADOR INTERNO: Apenas uma linha vertical cinza no segundo item
                  ${index === 1 ? 'border-l border-gray-300' : ''}
                  
                  // O flex-1 no label garante que ocupam o mesmo espaço
                  // O overflow-hidden no pai e a ausência de arredondamento individual resolvem os cantos
                  rounded-none
                `}>
                  {option}
                </span>
            </label>
            ))}
        </div>
        
        {error && (
            <p className="mt-1 text-sm text-red-600">{error.message}</p>
        )}
    </div>
  );
};

export default RadioButton;