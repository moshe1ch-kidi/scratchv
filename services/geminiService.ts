import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-3-flash-preview';

export const explainCode = async (code: string): Promise<string> => {
  if (!code || code.trim() === '') {
    return "No code has been written yet. Please drag blocks into the workspace so I can explain them.";
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
        You are a friendly coding tutor for a student learning Blockly.
        The language is JavaScript generated from blocks.
        Explain what the following code does in English.
        Keep it simple, encouraging, and concise (max 3 sentences).
        
        Code:
        \`\`\`javascript
        ${code}
        \`\`\`
      `,
    });
    return response.text || "I couldn't analyze the code right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "There was an error connecting to Gemini. Please try again later.";
  }
};

export const getChallenge = async (difficulty: string): Promise<{title: string, description: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
        Create a coding challenge for a Blockly student.
        Difficulty: ${difficulty} (Beginner/Intermediate/Advanced).
        Language: English.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short title for the coding challenge in English.",
            },
            description: {
              type: Type.STRING,
              description: "Clear instructions in English on what to build using blocks.",
            },
          },
          required: ["title", "description"],
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Default Challenge",
      description: "Create a loop that prints the numbers from 1 to 10."
    };
  }
};

export const checkSolution = async (code: string, challengeDescription: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
        You are a coding tutor.
        The student is trying to solve this challenge: "${challengeDescription}".
        Here is their code:
        \`\`\`javascript
        ${code}
        \`\`\`
        Analyze if the code solves the challenge correctly.
        Respond in English.
        If it's correct, congratulate them.
        If it's incorrect, give a subtle hint (don't give the answer).
      `,
    });
    return response.text || "I couldn't check the solution.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error checking solution.";
  }
}