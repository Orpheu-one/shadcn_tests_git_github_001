import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/actions/user.actions';
import EventSinglePage from '@/components/EventsSinglePage';

interface CallbackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CallbackDetailPage({ params }: CallbackDetailPageProps) {
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id, 10);

  // Validação do ID
  if (isNaN(eventId)) {
    console.error('❌ Callback ID inválido:', resolvedParams.id);
    notFound();
  }

  // Busca o evento
  const event = await getEventById(eventId);

  // Verificações
  if (!event) {
    console.error('❌ Callback não encontrado com ID:', eventId);
    notFound();
  }

  if (event.type !== 'CALLBACK') {
    console.error('❌ Tipo incorreto. Esperado CALLBACK, recebido:', event.type);
    notFound();
  }

  console.log('✅ Callback carregado com sucesso:', event.event_id);

  return (
    <div className="container mx-auto px-4 py-8">
      <EventSinglePage 
        data={event} 
        title="Detalhes do Callback" 
      />
    </div>
  );
}