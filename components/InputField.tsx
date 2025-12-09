// components/InputField.tsx
// Componente de input genérico que suporta <input> ou <textarea>.

import { UseFormRegister, FieldError, FieldValues } from "react-hook-form";
import React from 'react';

// Define a interface para o componente InputField, agora genérica
type InputFieldProps<TFieldValues extends FieldValues> = {
  label: string;
  type?: string;
  register: UseFormRegister<TFieldValues>;
  username?: string; 
  name: string;
  defaultValue?: string;
  error?: FieldError;
  // Suporta props de <input> OU <textarea>
  inputProps: React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  
  // NOVAS PROPS: Para o campo de observações (textarea)
  isTextArea?: boolean;
  rows?: number; 
};

// O componente usa tipagem genérica para ser compatível com React Hook Form
const InputField = <TFieldValues extends FieldValues>({
  label,
  type = "text",
  register,
  username, 
  name,
  defaultValue,
  error,
  inputProps,
  isTextArea = false, 
  rows = 3,           
}: InputFieldProps<TFieldValues>) => {
    
  // Classes Tailwind CSS partilhadas
  const commonClasses = "w-full grid border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-transparent";

  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor={name} className="text-xs text-gray-700">{label}</label>

      {/* RENDERIZAÇÃO CONDICIONAL */}
      {isTextArea ? (
        // Se isTextArea for true, renderiza <textarea>
        <textarea
          id={name}
          rows={rows}
          placeholder={label} 
          className={commonClasses}
          {...register(name)}
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          defaultValue={defaultValue}
        />
      ) : (
        // Senão, renderiza o campo <input> normal
        <input
          id={name}
          type={type}
          placeholder={label} 
          className={commonClasses}
          {...register(name)}
          {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          defaultValue={defaultValue}
        />
      )}

      {error?.message && (
        <span className="text-red-600 text-sm">{error.message.toString()}</span>
      )}
    </div>
  );
};

export default InputField;