// ============================================
// COMMENTED OUT: GptController is disabled (OpenAI API key not configured)
// ============================================

/*
import { Router } from "express";
import { handleCodeReview } from "../controllers/GptController";

const router = Router();

router.post("/code", handleCodeReview);

export default router;
*/

// Export empty router to prevent import errors
import { Router } from "express";
const router = Router();
export default router;
