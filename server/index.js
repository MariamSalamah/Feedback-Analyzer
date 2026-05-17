import express from "express";
import cors from "cors";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ────────────────────────────────
// Tools
// ────────────────────────────────

const analyzeSentiment = tool({
  name: "analyze_sentiment",
  description: "Analyze the overall sentiment of customer feedback entries and return scores.",
  parameters: z.object({
    feedbacks: z.array(z.string()).describe("List of customer feedback strings"),
  }),
  async execute({ feedbacks }) {
    const positive = feedbacks.filter(f =>
      /love|great|amazing|excellent|perfect|good|fantastic|happy|best/i.test(f)
    ).length;
    const negative = feedbacks.filter(f =>
      /bad|terrible|awful|hate|worst|broken|crash|slow|issue|problem|frustrat/i.test(f)
    ).length;
    const neutral = feedbacks.length - positive - negative;
    const total = feedbacks.length;

    return JSON.stringify({
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral:  Math.round((neutral  / total) * 100),
      total,
    });
  },
});

const extractProblems = tool({
  name: "extract_problems",
  description: "Extract the top problems and pain points from customer feedback.",
  parameters: z.object({
    feedbacks: z.array(z.string()).describe("List of customer feedback strings"),
    productName: z.string().describe("Name of the product being analyzed"),
  }),
  async execute({ feedbacks, productName }) {
    // Return structured hint for the agent to build on
    return JSON.stringify({
      hint: `Analyze these ${feedbacks.length} feedbacks for "${productName}" and identify the top recurring problems, their frequency (high/medium/low), and which product area they affect.`,
      feedbackSample: feedbacks.slice(0, 5),
    });
  },
});

const generateRecommendations = tool({
  name: "generate_recommendations",
  description: "Generate actionable business recommendations based on identified problems.",
  parameters: z.object({
    problems: z.array(z.string()).describe("List of identified problem titles"),
    productName: z.string(),
  }),
  async execute({ problems, productName }) {
    return JSON.stringify({
      hint: `Based on these problems for "${productName}": ${problems.join(", ")} — generate specific, actionable recommendations with priority (critical/high/medium) and expected business impact.`,
    });
  },
});

// ────────────────────────────────
// Agent
// ────────────────────────────────

const feedbackAgent = new Agent({
  name: "Business Feedback Analyzer",
  instructions: `You are a senior business intelligence analyst.
Your job is to analyze customer feedback and produce a structured JSON report.

Steps:
1. Use analyze_sentiment tool to get sentiment scores
2. Use extract_problems tool to identify issues
3. Use generate_recommendations tool to suggest actions
4. Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):

{
  "productName": "<string>",
  "totalFeedbacks": <number>,
  "overallSentiment": "positive|negative|neutral|mixed",
  "sentimentScore": { "positive": <0-100>, "negative": <0-100>, "neutral": <0-100> },
  "summary": "<2-3 sentence executive summary>",
  "keyThemes": ["<theme1>", "<theme2>", "<theme3>", "<theme4>", "<theme5>"],
  "problems": [
    { "title": "<str>", "description": "<str>", "frequency": "high|medium|low", "affectedArea": "<str>" }
  ],
  "recommendations": [
    { "title": "<str>", "description": "<str>", "priority": "critical|high|medium", "impact": "<str>" }
  ],
  "npsScore": <-100 to 100>,
  "analyzedAt": "<ISO date string>"
}

Rules:
- sentimentScore values must sum to 100
- 3-5 problems ordered by frequency
- 3-5 recommendations ordered by priority
- analyzedAt must be current timestamp`,
  tools: [analyzeSentiment, extractProblems, generateRecommendations],
});

// ────────────────────────────────
// API Endpoint
// ────────────────────────────────

app.post("/analyze", async (req, res) => {
  const { feedbacks, productName } = req.body;

  if (!feedbacks?.length || !productName) {
    return res.status(400).json({ error: "feedbacks and productName are required" });
  }

  try {
    const prompt = `Analyze these ${feedbacks.length} customer feedback entries for "${productName}":

${feedbacks.map((f, i) => `[${i + 1}] ${f}`).join("\n\n")}

Use your tools then return the final JSON report.`;

    const result = await run(feedbackAgent, prompt);

    // Parse JSON from agent output
    const text = result.finalOutput || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Agent did not return valid JSON");

    const report = JSON.parse(match[0]);
    res.json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(3000, () => {
  console.log("Feedback Agent running on http://localhost:3000");
});
