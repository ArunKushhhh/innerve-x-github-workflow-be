import dotenv from "dotenv";
import path from "path";

// Load environment variables
const envPath = path.resolve(__dirname, "../../.env");
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const requiredVars = ["GEMINI_API_KEY", "GITHUB_COMMENT_TOKEN", "MONGO_URI"];

const missingVars: string[] = [];

console.log("🔍 Checking environment variables...");

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing: ${varName}`);
    missingVars.push(varName);
  } else {
    // Check if it looks like a placeholder
    if (
      process.env[varName]?.includes("your_") ||
      process.env[varName]?.includes("placeholder")
    ) {
      console.warn(`⚠️  Warning: ${varName} looks like a placeholder value.`);
    } else {
      const masked = process.env[varName]!.substring(0, 4) + "...";
      console.log(`✅ ${varName} is set (${masked})`);
    }
  }
});

if (missingVars.length > 0) {
  console.error(
    "\n❌ Environment check failed. Please set the missing variables in your .env file or deployment environment.",
  );
  process.exit(1);
} else {
  console.log("\n✅ Environment check passed! All required variables are set.");
  process.exit(0);
}
