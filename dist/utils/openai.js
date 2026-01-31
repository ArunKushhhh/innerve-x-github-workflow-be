"use strict";
// src/utils/openai.ts
// ============================================
// Migrated to Gemini API
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCodeWithAI = reviewCodeWithAI;
const gemini_1 = require("./gemini");
async function reviewCodeWithAI(params) {
    const model = (0, gemini_1.getCodeReviewModel)("You are an AI coding assistant. When given a coding question, respond with ONLY the complete, working code solution. Do not include explanations or comments unless specifically asked.");
    const prompt = `I'm currently in a live coding assessment/interview. Problem:\n\n${params.code}`;
    try {
        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();
        console.log("🤖 Gemini code review completed");
        return { reply };
    }
    catch (error) {
        console.error("❌ Gemini code review failed:", error.message);
        return {
            reply: "AI analysis failed. Please try again.",
        };
    }
}
//# sourceMappingURL=openai.js.map