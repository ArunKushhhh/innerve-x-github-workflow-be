// src/routes/ai-review.ts
// AI-powered code review and analysis routes (using Gemini API)

import { Router } from "express";
import { handleCodeReview } from "../controllers/AiReviewController";
import { handleIssueAnalysis } from "../controllers/LabelController";
import { handlePRSummary } from "../controllers/GptController";

const router = Router();

// AI code review endpoint
router.post("/ai-review", handleCodeReview);

// Comprehensive issue analysis with AI scoring
router.post("/analyze-issue", handleIssueAnalysis);

// Generate AI-powered PR summary
router.post("/generate-pr-summary", handlePRSummary);

export default router;
