
'use server';
/**
 * @fileOverview A Genkit flow to fetch hotel data using the SerpApi tool.
 *
 * - fetchHotelDataViaSerpapi - The flow function.
 * - FetchHotelDataInput - TypeScript type for the flow's input.
 * - FetchHotelDataOutput - TypeScript type for the flow's output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {searchHotelsTool, type HotelSearchInput, type HotelSearchResult} from '@/ai/tools/search-hotels-tool';

const FetchHotelDataInputSchema = z.object({
  query: z.string().describe('The search query for the hotel (e.g., "Hotel Name, City").'),
  location: z.string().optional().describe('Optional location to narrow down the search (e.g., "London, United Kingdom").'),
});
export type FetchHotelDataInput = z.infer<typeof FetchHotelDataInputSchema>;

// The output will be an array of hotel results from the tool
const FetchHotelDataOutputSchema = z.array(z.object({
    title: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    rating: z.number().optional(),
    reviews: z.number().optional(),
    gps_coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),
})).describe('A list of hotel results from SerpApi.');
export type FetchHotelDataOutput = z.infer<typeof FetchHotelDataOutputSchema>;


const fetchHotelDataFlow = ai.defineFlow(
  {
    name: 'fetchHotelDataViaSerpapiFlow',
    inputSchema: FetchHotelDataInputSchema,
    outputSchema: FetchHotelDataOutputSchema,
  },
  async (input: HotelSearchInput): Promise<HotelSearchResult> => {
    // Directly call the tool.
    // In more complex scenarios, you might use an LLM with the tool,
    // but here we are just wrapping the tool call in a flow.
    try {
      const hotelResults = await searchHotelsTool(input);
      return hotelResults;
    } catch (error) {
      console.error("Error in fetchHotelDataViaSerpapiFlow:", error);
      // Depending on requirements, you might want to return an empty array or re-throw
      return []; 
    }
  }
);

// Exported wrapper function to be called from Server Actions or other server-side code
export async function fetchHotelDataViaSerpapi(input: FetchHotelDataInput): Promise<FetchHotelDataOutput> {
  return fetchHotelDataFlow(input);
}

