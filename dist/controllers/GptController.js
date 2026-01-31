"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePRSummary = exports.handleCodeReview = void 0;
const openai_1 = require("../utils/openai");
const generative_ai_1 = require("@google/generative-ai");
const gemini_1 = require("../utils/gemini");
const handleCodeReview = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: "Code is required" });
            return;
        }
        const result = await (0, openai_1.reviewCodeWithAI)({ code });
        res.json(result);
    }
    catch (error) {
        console.error("Error reviewing code:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.handleCodeReview = handleCodeReview;
const handlePRSummary = async (req, res) => {
    console.log("📝 Starting PR summary generation");
    const { owner, repo, prNumber, title, description, author, metadata, diff } = req.body;
    if (!owner || !repo || !prNumber) {
        res.status(400).json({ error: "owner, repo, and prNumber are required" });
        return;
    }
    try {
        console.log(`📝 Generating summary for PR #${prNumber} in ${owner}/${repo}`);
        /* 1️⃣ Initialize Gemini client */
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not set");
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: "You are a senior technical lead reviewing pull requests. Generate clear, concise summaries that help team members understand the changes and their impact. Always respond with valid JSON only.",
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1200,
            },
        });
        /* 2️⃣ Use provided diff or fetch from GitHub */
        let finalDiff = diff;
        if (!finalDiff) {
            console.log("📡 No diff provided, fetching from GitHub API...");
            finalDiff = await fetchPRDiff(owner, repo, prNumber);
        }
        /* 3️⃣ Fetch repository context */
        const repoContext = await fetchRepositoryContext(owner, repo);
        /* 4️⃣ Generate AI summary */
        const summaryResult = await generateAISummary(model, {
            title,
            description: description || "No description provided",
            diff: finalDiff,
            repoContext,
            prNumber,
            author: author || "Unknown",
            metadata,
        });
        /* 5️⃣ Post summary as comment on PR */
        await postSummaryComment(owner, repo, prNumber, summaryResult);
        /* 6️⃣ Return results */
        res.status(200).json({
            success: true,
            prNumber,
            author,
            summary: summaryResult,
            message: `Successfully generated and posted summary for PR #${prNumber}`,
        });
    }
    catch (err) {
        console.error("❌ PR summary generation failed:", err.message);
        res.status(500).json({
            error: "PR summary generation failed: " + err.message,
        });
    }
};
exports.handlePRSummary = handlePRSummary;
/* 🤖 Generate AI-powered PR summary */
async function generateAISummary(model, prData) {
    const summaryPrompt = `# Pull Request Summary Generation

## PR Information
- **Title**: ${prData.title}
- **Description**: ${prData.description}
- **PR Number**: #${prData.prNumber}
- **Author**: ${prData.author}
${prData.metadata
        ? `- **Branch**: ${prData.metadata.headBranch} → ${prData.metadata.baseBranch}
- **Created**: ${prData.metadata.createdAt}`
        : ""}

## Repository Context
- **Primary Language**: ${prData.repoContext?.primaryLanguage || "Unknown"}
- **Architecture**: ${prData.repoContext?.architectureStyle || "Unknown"}
- **Frameworks**: ${prData.repoContext?.frameworks?.join(", ") || "None detected"}

## Code Changes
\`\`\`diff
${prData.diff.substring(0, 6000)}
\`\`\`

## Task

Generate a comprehensive yet concise summary of this Pull Request. Focus on:

1. **What was changed** (high-level overview)
2. **Why it was changed** (purpose/motivation)
3. **Key technical changes** (specific modifications)
4. **Potential impact** (how it affects the system)
5. **Risk assessment** (potential issues or concerns)
6. **Recommendations** (next steps or suggestions)

## Output Format

Respond with ONLY a valid JSON object in this exact format:

{
  "summary": "<2-3 sentence high-level summary of what this PR accomplishes>",
  "keyChanges": [
    "<specific change 1>",
    "<specific change 2>",
    "<specific change 3>"
  ],
  "technicalImpact": "<1-2 sentences about technical implications>",
  "riskAssessment": "<1-2 sentences about potential risks or concerns>",
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>"
  ]
}`;
    try {
        const result = await model.generateContent(summaryPrompt);
        const response = result.response.text().trim();
        console.log(`🤖 Gemini response received`);
        const cleanedResponse = (0, gemini_1.cleanJsonResponse)(response);
        const parsed = JSON.parse(cleanedResponse);
        return {
            summary: parsed.summary || "Summary generation failed",
            keyChanges: Array.isArray(parsed.keyChanges)
                ? parsed.keyChanges
                : ["Changes could not be analyzed"],
            technicalImpact: parsed.technicalImpact || "Technical impact could not be assessed",
            riskAssessment: parsed.riskAssessment || "Risk assessment unavailable",
            recommendations: Array.isArray(parsed.recommendations)
                ? parsed.recommendations
                : ["Manual review recommended"],
        };
    }
    catch (error) {
        console.error(`❌ Gemini analysis failed:`, error.message);
        return {
            summary: `Pull Request #${prData.prNumber}: ${prData.title}`,
            keyChanges: ["Automated analysis failed - manual review required"],
            technicalImpact: "Technical impact could not be automatically assessed",
            riskAssessment: "Manual risk assessment required",
            recommendations: [
                "Please review changes manually",
                "Ensure adequate testing",
            ],
        };
    }
}
/* 💬 Post summary as comment on PR */
async function postSummaryComment(owner, repo, prNumber, summary) {
    const token = process.env.GITHUB_COMMENT_TOKEN;
    if (!token) {
        throw new Error("GITHUB_COMMENT_TOKEN environment variable is not set");
    }
    const commentBody = `## 🤖 AI-Generated PR Summary

### 📋 Overview
${summary.summary}

### 🔧 Key Changes
${summary.keyChanges.map((change) => `- ${change}`).join("\n")}

### ⚡ Technical Impact
${summary.technicalImpact}

### ⚠️ Risk Assessment
${summary.riskAssessment}

### 💡 Recommendations
${summary.recommendations.map((rec) => `- ${rec}`).join("\n")}

---
*This summary was automatically generated by AI. Please review the changes carefully and validate the analysis.*`;
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentBody }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to post summary comment: ${response.status} ${response.statusText} - ${errorText}`);
    }
    console.log(`✅ Comment posted successfully`);
}
/* 📡 Fetch PR diff */
async function fetchPRDiff(owner, repo, prNumber) {
    const token = process.env.GITHUB_COMMENT_TOKEN;
    if (!token) {
        throw new Error("GITHUB_COMMENT_TOKEN environment variable is not set");
    }
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3.diff",
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch PR diff: ${response.status} - ${errorText}`);
    }
    return await response.text();
}
/* 📋 Fetch basic repository context */
async function fetchRepositoryContext(owner, repo) {
    const token = process.env.GITHUB_COMMENT_TOKEN;
    if (!token) {
        return {
            primaryLanguage: "Unknown",
            architectureStyle: "Unknown",
            frameworks: [],
        };
    }
    try {
        const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const response = await fetch(repoUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        if (response.ok) {
            const repoData = await response.json();
            return {
                primaryLanguage: repoData.language || "Unknown",
                architectureStyle: "Web Application",
                frameworks: [],
            };
        }
    }
    catch (error) {
        console.log("📦 Error fetching repo context:", error.message);
    }
    return {
        primaryLanguage: "Unknown",
        architectureStyle: "Unknown",
        frameworks: [],
    };
}
//# sourceMappingURL=GptController.js.map