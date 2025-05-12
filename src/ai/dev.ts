import { config } from 'dotenv';
config();

import '@/ai/flows/covenant-summarization.ts';
import '@/ai/flows/covenant-search.ts';
import '@/ai/flows/markdown-qa.ts'; // Added import for the new flow
