// src/utils/gemini.ts
import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
} from "@google/generative-ai";

/**
 * Initialize Gemini AI client
 * Uses GEMINI_API_KEY from environment
 */
export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get a Gemini model configured for code review tasks
 * @param systemInstruction - Optional system instruction for the model
 */
export function getCodeReviewModel(
  systemInstruction?: string,
): GenerativeModel {
  const client = getGeminiClient();

  const generationConfig: GenerationConfig = {
    temperature: 0.2,
    maxOutputTokens: 2000,
    topP: 0.9,
  };

  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
    generationConfig,
  });
}

/**
 * Get a Gemini model configured for analysis tasks
 * Lower temperature for more consistent scoring
 */
export function getAnalysisModel(systemInstruction?: string): GenerativeModel {
  const client = getGeminiClient();

  const generationConfig: GenerationConfig = {
    temperature: 0.1,
    maxOutputTokens: 1500,
  };

  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
    generationConfig,
  });
}

/**
 * Clean AI response by removing markdown code blocks
 */
export function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();

  // Remove ```json at the start and ``` at the end
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "");
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  return cleaned.trim();
}
