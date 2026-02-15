
import { GoogleGenAI, Type } from "@google/genai";

const TIMEOUT_MS = 15_000;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/** Rejects after `ms` with an AbortError-like message. */
const timeout = (ms: number): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), ms)
  );

export const decomposeTask = async (task: string): Promise<string[]> => {
  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Break down the following complex task into 3 to 5 clear, actionable, and small subtasks. Task: "${task}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["subtasks"]
          },
        }
      }),
      timeout(TIMEOUT_MS),
    ]);

    const raw = response.text;
    if (!raw) {
      console.warn("Gemini returned empty response");
      return ["Could not decompose — try rephrasing your task"];
    }

    const data = JSON.parse(raw);
    if (!Array.isArray(data.subtasks) || data.subtasks.length === 0) {
      return ["Could not decompose — try rephrasing your task"];
    }

    return data.subtasks;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      console.error("Gemini request timed out");
      return ["Request timed out — check your connection and try again"];
    }
    console.error("Gemini decomposition error:", error);
    return ["Something went wrong — try again in a moment"];
  }
};
