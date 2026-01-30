import { Router } from "express";
import User from "../model/User";

const router = Router();

// GET /contributors - List all contributors
router.get("/contributors", async (req, res) => {
  try {
    const contributors = await User.find({ role: "contributor" });
    res.json(contributors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contributors" });
  }
});

export default router;
