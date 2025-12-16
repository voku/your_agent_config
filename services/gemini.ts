import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const refineText = async (input: string, context: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key missing");
    return input + " (AI refinement unavailable - missing API Key)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert software architect. Refine the following ${context} to be professional, clear, and concise for an AGENTS.md file (system context for LLMs). 
      
      Input: "${input}"
      
      Output only the refined text, no quotes or explanations.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return input;
  }
};

export const generateDocsSuggestions = async (techStack: string): Promise<string[]> => {
    if (!apiKey) return [];
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on this tech stack: "${techStack}", suggest 3 key file paths that an AI agent should read to understand the architecture. Return ONLY a JSON array of strings. Example: ["src/types.ts", "prisma/schema.prisma"].`,
            config: {
                responseMimeType: "application/json"
            }
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return [];
    }
}
