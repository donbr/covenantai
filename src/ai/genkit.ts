
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for the Gemini API key before initializing the plugin.
// This provides a more user-friendly error message if the key is missing.
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error(`
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
ERROR: GEMINI_API_KEY or GOOGLE_API_KEY is not set in your environment.
Genkit requires this API key to use Google AI models (e.g., Gemini).

To fix this:
1. Obtain an API key from Google AI Studio (https://aistudio.google.com/).
2. Add it to your .env file like this:
   GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
3. Restart your Genkit development server (e.g., npm run genkit:dev).

For more details, see https://firebase.google.com/docs/genkit/plugins/google-genai
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  `);
  // Optionally, you could throw an error here to prevent Genkit from starting
  // if the key is absolutely required for any operation.
  // For now, we'll let the googleAI() plugin throw its own specific error
  // if it's actually used without a key, but this console warning serves as an early alert.
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

