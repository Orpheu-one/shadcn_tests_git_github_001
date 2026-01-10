// app/(dashboard)/lists/vendas/[id]/page.tsx
import { getEventById } from "@/lib/actions/user.actions"; // Ajusta o caminho
import EventSinglePage from "@/components/EventsSinglePage";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendaDetalhePage({ params }: PageProps) {
  // Em Next.js 15, params é uma Promise
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  // Verificação de segurança caso o ID não seja um número
  if (isNaN(id)) {
    return <div>ID de venda inválido.</div>;
  }

  // Buscar os dados
  const vendaData = await getEventById(id);

  // Se não encontrar, mostra página 404
  if (!vendaData) {
    notFound();
  }

  // Renderiza o componente reutilizável
  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Ficha de Venda</h1>
        {/* Aqui poderias colocar um botão de 'Voltar' se quisesses */}
      </div>
      
      <EventSinglePage 
        data={vendaData} 
        title={`Venda #${vendaData.internalId || vendaData.id}`} 
      />
    </div>
  );
}