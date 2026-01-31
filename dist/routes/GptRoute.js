"use strict";
// ============================================
// COMMENTED OUT: GptController is disabled (OpenAI API key not configured)
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
/*
import { Router } from "express";
import { handleCodeReview } from "../controllers/GptController";

const router = Router();

router.post("/code", handleCodeReview);

export default router;
*/
// Export empty router to prevent import errors
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.default = router;
//# sourceMappingURL=GptRoute.js.map