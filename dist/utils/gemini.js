"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeminiClient = getGeminiClient;
exports.getCodeReviewModel = getCodeReviewModel;
exports.getAnalysisModel = getAnalysisModel;
exports.cleanJsonResponse = cleanJsonResponse;
// src/utils/gemini.ts
const generative_ai_1 = require("@google/generative-ai");
/**
 * Initialize Gemini AI client
 * Uses GEMINI_API_KEY from environment
 */
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    return new generative_ai_1.GoogleGenerativeAI(apiKey);
}
/**
 * Get a Gemini model configured for code review tasks
 * @param systemInstruction - Optional system instruction for the model
 */
function getCodeReviewModel(systemInstruction) {
    const client = getGeminiClient();
    const generationConfig = {
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
function getAnalysisModel(systemInstruction) {
    const client = getGeminiClient();
    const generationConfig = {
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
function cleanJsonResponse(response) {
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
//# sourceMappingURL=gemini.js.map