
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { adminFirestore } from '@/lib/firebase/admin'; 
import { baseConverter } from '@/lib/firestore/converters';
import { PacientesClientView } from './_components/pacientes-client-view';
import { Paciente } from '@/types/paciente';


export default async function PacientesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  
  async function getPacientes(tenantId: string): Promise<Paciente[]> {
    if (!tenantId) return [];
  
    try {
      const pacientesRef = collection(adminFirestore, `tenants/${tenantId}/pacientes`)
                              .withConverter(baseConverter<Paciente>());
  
      const q = query(pacientesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        return [];
      }
  
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Erro ao buscar pacientes no servidor:", error);
      return []; 
    }
  }

  const pacientes = await getPacientes(tenantId);

  return <PacientesClientView pacientes={pacientes} tenantId={tenantId} />;
}
