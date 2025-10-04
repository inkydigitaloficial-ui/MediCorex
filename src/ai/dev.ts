import { config } from 'dotenv';
config();

// Ajustado para importar o fluxo consolidado de pacientes.
import '@/ai/flows/pacientes/gerarResumoPaciente';
