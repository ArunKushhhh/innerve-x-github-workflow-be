"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../model/User"));
const router = (0, express_1.Router)();
// GET /contributors - List all contributors
router.get("/contributors", async (req, res) => {
    try {
        const contributors = await User_1.default.find({ role: "contributor" });
        res.json(contributors);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch contributors" });
    }
});
exports.default = router;
//# sourceMappingURL=contributorRoutes.js.map