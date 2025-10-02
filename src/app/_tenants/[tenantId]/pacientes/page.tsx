// src/app/_tenants/[tenantId]/pacientes/page.tsx

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { adminFirestore } from '@/lib/firebase/admin'; // Usando o adminFirestore no servidor
import { baseConverter, BaseModel } from '@/lib/firestore/converters';
import { PacientesClientView } from './_components/pacientes-client-view';
import { Paciente } from '@/types/paciente';

// A tipagem para os dados do paciente, compatível com o nosso conversor
interface PacienteModel extends Paciente, BaseModel {}

// A função para buscar os dados é executada no servidor
async function getPacientes(tenantId: string): Promise<PacienteModel[]> {
  if (!tenantId) return [];

  try {
    const pacientesRef = collection(adminFirestore, `tenants/${tenantId}/pacientes`)
                            .withConverter(baseConverter<PacienteModel>());

    // Você pode adicionar ordenação ou filtros aqui
    const q = query(pacientesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    // Os dados são serializados (convertidos de Timestamps para Dates pelo conversor)
    // e enviados para o componente de cliente.
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    // Em um ambiente de produção, você pode querer logar este erro em um serviço de monitoramento
    console.error("Erro ao buscar pacientes no servidor:", error);
    // É importante retornar um array vazio para que a página não quebre.
    return []; 
  }
}

// A página agora é um Server Component assíncrono, como você sugeriu.
export default async function PacientesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  
  // A busca de dados acontece aqui, no servidor, antes da página ser enviada ao cliente.
  const pacientes = await getPacientes(tenantId);

  // O componente de cliente recebe os dados já prontos para renderização.
  // Toda a lógica interativa foi movida para PacientesClientView.
  return <PacientesClientView pacientes={pacientes} tenantId={tenantId} />;
}
