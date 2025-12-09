import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const EVENT_OPTIONS = ["Venda", "Callback"] as const;

const schema = z.object({
  // 1. CAMPO DO RADIO BUTTON: 'event'
  event: z.enum(EVENT_OPTIONS as [string, ...string[]], { 
    required_error: "Escolha o tipo de evento" 
  }), 
  
  name: z.string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(20, { message: "O nome deve ter no máximo 20 caracteres" }),
    
  email: z.string()
    .email({ message: "Insira um email válido" })
    .optional(),
 
  apelido: z.string()
    .min(3, { message: "O apelido deve ter pelo menos 3 caracteres" })
    .max(20, { message: "O apelido deve ter no máximo 20 caracteres" }),
    
  phone: z.string()
    .min(8, { message: "Número de telefone é obrigatório" }),
    
  address: z.string()
    .min(15, { message: "A morada é obrigatória" }),
  
  genero: z.enum(["Masculino", "Feminino", "Prefiro não especificar"], { 
    required_error: "Escolha uma opção" 
  }),
  
  obs: z.string()
    .min(15, { message: "As observações devem ter pelo menos 15 caracteres" })
    .optional(),
    
  username: z.string()
    .min(3, { message: "O username é obrigatório" }),
    
  cbTimestamp: z.string()
    .optional(),
});

export type VendasFormValues = z.infer<typeof schema>;

export const useVendasForm = (onSubmit: (data: VendasFormValues) => void) => {
  const form = useForm<VendasFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      event: undefined,
      name: '',
      email: '',
      apelido: '',
      phone: '',
      address: '',
      genero: 'Prefiro não especificar',
      obs: '',
      username: '',
      cbTimestamp: new Date().toISOString().split('T')[0], // Default to today's date
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return {
    ...form,
    handleSubmit,
    EVENT_OPTIONS,
    formState: {
      ...form.formState,
      isSubmitting: form.formState.isSubmitting,
    },
  };
};

export default useVendasForm;
