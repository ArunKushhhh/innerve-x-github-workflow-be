"use strict";
// src/routes/ai-review.ts
// AI-powered code review and analysis routes (using Gemini API)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AiReviewController_1 = require("../controllers/AiReviewController");
const LabelController_1 = require("../controllers/LabelController");
const GptController_1 = require("../controllers/GptController");
const router = (0, express_1.Router)();
// AI code review endpoint
router.post("/ai-review", AiReviewController_1.handleCodeReview);
// Comprehensive issue analysis with AI scoring
router.post("/analyze-issue", LabelController_1.handleIssueAnalysis);
// Generate AI-powered PR summary
router.post("/generate-pr-summary", GptController_1.handlePRSummary);
exports.default = router;
//# sourceMappingURL=ai-review.js.map