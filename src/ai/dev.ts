import { config } from 'dotenv';
config();

import '@/ai/flows/draft-generation.ts';
import '@/ai/flows/ai-signature-analyzer.ts';
import '@/ai/flows/ai-assisted-refinement.ts';
import '@/ai/flows/source-text-distiller.ts';