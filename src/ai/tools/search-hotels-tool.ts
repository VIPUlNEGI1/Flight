
'use server';
/**
 * @fileOverview Genkit tool for searching hotel information using SerpApi.
 *
 * - searchHotelsTool - The Genkit tool definition.
 * - HotelSearchInputSchema - Zod schema for the tool's input.
 * - HotelSearchResultSchema - Zod schema for the tool's output.
 * - HotelSearchResult - TypeScript type for the tool's output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getJson} from 'google-search-results-nodejs'; // Use getJson for Google Hotels

const HotelSearchInputSchema = z.object({
  query: z.string().describe('The search query for the hotel (e.g., "Hotel Name, City").'),
  location: z.string().optional().describe('Optional location to narrow down the search (e.g., "London, United Kingdom").'),
});
export type HotelSearchInput = z.infer<typeof HotelSearchInputSchema>;

const HotelBasicInfoSchema = z.object({
  title: z.string().optional().describe('Name of the hotel.'),
  address: z.string().optional().describe('Full address of the hotel.'),
  phone: z.string().optional().describe('Phone number of the hotel.'),
  website: z.string().optional().describe('Official website of the hotel.'),
  rating: z.number().optional().describe('Overall rating of the hotel.'),
  reviews: z.number().optional().describe('Total number of reviews.'),
  gps_coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional().describe('GPS coordinates.'),
});
export type HotelBasicInfo = z.infer<typeof HotelBasicInfoSchema>;

const HotelSearchResultSchema = z.array(HotelBasicInfoSchema).describe('A list of hotel results from SerpApi.');
export type HotelSearchResult = z.infer<typeof HotelSearchResultSchema>;


export const searchHotelsTool = ai.defineTool(
  {
    name: 'searchHotelsWithSerpApi',
    description: 'Searches for hotel information using SerpApi Google Hotels endpoint based on a query and optional location.',
    inputSchema: HotelSearchInputSchema,
    outputSchema: HotelSearchResultSchema,
  },
  async (input) => {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_API_KEY is not set in environment variables.');
    }

    const params: any = {
      api_key: apiKey,
      engine: 'google_hotels',
      q: input.query,
      hl: 'en', // language
      gl: 'us', // country
    };

    if (input.location) {
      // For Google Hotels, location is usually part of 'q' or implied.
      // If SerpApi has a specific location parameter for hotels, use it.
      // For now, we assume 'q' contains location info if needed or it's general.
      // params.location = input.location; // Example if SerpApi had a dedicated location param
    }

    try {
      const response = await getJson(params);
      
      // Process response to fit HotelSearchResultSchema
      // SerpApi's hotel results can be nested under 'properties' or similar keys.
      // This mapping will depend on the exact structure of SerpApi's Google Hotels response.
      // The example below is a guess and needs to be adjusted based on actual API response.
      let hotelProperties = [];
      if (response.properties && Array.isArray(response.properties)) {
        hotelProperties = response.properties;
      } else if (response.knowledge_graph && response.knowledge_graph.type === "Hotel") {
        // Sometimes details are in knowledge graph for a single specific result
         hotelProperties = [response.knowledge_graph];
      } else if (response.organic_results) { // Fallback to general organic results if no direct hotel properties
        hotelProperties = response.organic_results
            .filter((r: any) => r.type === 'hotel_result' || (r.title && r.address)) // Heuristic
            .map((r: any) => ({
                title: r.title,
                address: r.address || r.snippet, // Snippet might contain address like info
                website: r.website,
                phone: r.phone,
                rating: r.rating,
                reviews: r.reviews,
                gps_coordinates: r.gps_coordinates
            }));
      }


      const mappedResults: HotelBasicInfo[] = hotelProperties.map((hotel: any) => ({
        title: hotel.name || hotel.title,
        address: hotel.address,
        phone: hotel.phone,
        website: hotel.website,
        rating: hotel.overall_rating || hotel.rating,
        reviews: hotel.total_reviews || hotel.reviews,
        gps_coordinates: hotel.gps_coordinates ? {
            latitude: hotel.gps_coordinates.latitude,
            longitude: hotel.gps_coordinates.longitude
        } : undefined,
      })).filter(hotel => hotel.title); // Ensure title exists

      if (mappedResults.length === 0 && response.answer_box && response.answer_box.type === 'hotel_info') {
        const hotel = response.answer_box;
         mappedResults.push({
            title: hotel.title,
            address: hotel.address,
            phone: hotel.phone,
            website: hotel.website,
            rating: hotel.rating,
            reviews: hotel.reviews,
         })
      }


      return mappedResults.slice(0, 5); // Return top 5 results
    } catch (error: any) {
      console.error('SerpApi request failed:', error.message);
      // It's good to throw an error that the flow can catch or return an empty array/error object
      throw new Error(`SerpApi request failed: ${error.message}`);
    }
  }
);

