
/**
 * @fileOverview Initializes and exports the Genkit AI instance.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Default plugin, can be configured

// Initialize Genkit.
// You can configure plugins, logging, and other settings here.
// For example, to use Google AI:
// const ai = genkit({ plugins: [googleAI()] });
// Or for a minimal setup without specific model plugins if you're only using tools:
// const ai = genkit();

export const ai = genkit({
  plugins: [
    googleAI(), // Including a default plugin like GoogleAI is common
  ],
  //   logLevel: 'debug', // Optional: for more detailed logging
  //   enableTracing: true, // Optional: for tracing flows
});
