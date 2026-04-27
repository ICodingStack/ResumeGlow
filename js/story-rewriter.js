/**
 * ResumeGlow — js/story-rewriter.js
 * Story Mode: rewrites dry bullet points into compelling,
 * achievement-focused stories using the Anthropic API.
 *
 * ─────────────────────────────────────────────────────────────────
 *  HOW TO USE AI FEATURES (Story Mode & Summary Rewrite)
 * ─────────────────────────────────────────────────────────────────
 *  These features call the Anthropic Claude API from your browser.
 *
 *  Option A — Claude.ai Artifacts environment (no key needed):
 *    If you opened ResumeGlow inside a Claude.ai Artifact, the API
 *    calls are automatically proxied — no API key required.
 *
 *  Option B — Running locally (open index.html in your browser):
 *    1. Get a free API key from https://console.anthropic.com
 *    2. Set ANTHROPIC_API_KEY below (replace the empty string).
 *    3. ⚠️  NEVER commit your real API key to a public git repo.
 *       Use a .env file + a tiny local proxy server, OR add the
 *       key temporarily only for your own local testing.
 *
 *  Option C — No API key at all:
 *    The app falls back gracefully to local enhancement rules
 *    (adds metrics, fixes weak verbs) — fully functional, no AI.
 * ─────────────────────────────────────────────────────────────────
 */

// ⬇️  PASTE YOUR API KEY HERE FOR LOCAL USE (leave empty for Claude.ai Artifacts)
const ANTHROPIC_API_KEY = "";

/**
 * Rewrite bullet points into STAR-format achievement stories.
 * Uses the Claude API (proxied through the artifact's API access).
 *
 * @param {string[]} bullets - array of bullet point strings
 * @param {string} jobTitle - the role title for context
 * @param {string} company  - company name for context
 * @returns {Promise<string[]>} rewritten bullet points
 */
async function rewriteBulletsWithAI(bullets, jobTitle, company) {
  const validBullets = bullets.filter((b) => b && b.trim());
  if (!validBullets.length) return bullets;

  const prompt = `You are an expert resume coach and career strategist. Your task is to rewrite resume bullet points into compelling, achievement-focused stories using the STAR method (Situation, Task, Action, Result) — but compressed into a single powerful sentence.

Role: ${jobTitle || "Professional"}${company ? ` at ${company}` : ""}

Original bullet points:
${validBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Rewrite each bullet point following these rules:
- Start with a strong action verb (Led, Built, Drove, Increased, Reduced, Designed, Launched, etc.)
- Include a specific, quantified result where possible (add plausible metrics if none exist, e.g. "by ~30%", "saving ~10 hrs/week")
- Keep each bullet to one clear, powerful sentence (max 20 words)
- Be specific and concrete — avoid vague phrases like "assisted with" or "helped to"
- Make the impact immediately obvious

Return ONLY a JSON array of strings, one rewritten bullet per original. No preamble, no markdown, no explanation. Example format:
["Rewrote bullet 1 here.", "Rewrote bullet 2 here."]`;

  try {
    const headers = { "Content-Type": "application/json" };
    if (ANTHROPIC_API_KEY) headers["x-api-key"] = ANTHROPIC_API_KEY;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || "";

    // Parse JSON array from response
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return parsed.map((b) => String(b).trim());
    }
    throw new Error("Unexpected response format");
  } catch (err) {
    console.error("Story Mode API error:", err);
    // Graceful fallback: enhance bullets locally
    return localEnhanceBullets(validBullets);
  }
}

/**
 * Rewrite a professional summary with AI.
 * @param {string} currentSummary
 * @param {string} name
 * @param {string} title
 * @returns {Promise<string>}
 */
async function rewriteSummaryWithAI(currentSummary, name, title) {
  const prompt = `You are an expert resume writer. Rewrite the following professional summary to be more compelling, specific, and achievement-focused. 

Name: ${name || "Professional"}
Title: ${title || "Professional"}
Current summary: ${currentSummary || "No summary provided."}

Rules:
- 2–3 sentences maximum
- Lead with years of experience and core expertise
- Mention 1-2 specific achievements or unique value propositions
- End with what you bring to the next role
- Professional, confident tone — not boastful

Return ONLY the rewritten summary text. No preamble, no quotes, no explanation.`;

  try {
    const headers2 = { "Content-Type": "application/json" };
    if (ANTHROPIC_API_KEY) headers2["x-api-key"] = ANTHROPIC_API_KEY;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: headers2,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || currentSummary;
  } catch (err) {
    console.error("Summary rewrite error:", err);
    return localEnhanceSummary(currentSummary);
  }
}

/**
 * Fallback: local bullet enhancement without API.
 * Applies simple heuristics to improve bullets.
 * @param {string[]} bullets
 * @returns {string[]}
 */
function localEnhanceBullets(bullets) {
  const WEAK_STARTS = {
    helped: "Supported",
    assisted: "Collaborated on",
    "worked on": "Developed",
    "was responsible for": "Owned",
    "responsible for": "Owned",
    did: "Executed",
    made: "Created",
    "did work": "Delivered",
    "participated in": "Contributed to",
  };

  const METRIC_SUGGESTIONS = [
    ", reducing costs by ~20%",
    ", increasing efficiency by ~35%",
    ", improving user engagement by ~25%",
    ", saving ~8 hours per week",
    ", boosting performance by ~40%",
    ", growing revenue by ~15%",
  ];

  return bullets.map((bullet, i) => {
    if (!bullet.trim()) return bullet;

    let enhanced = bullet.trim();

    // Fix weak openers
    for (const [weak, strong] of Object.entries(WEAK_STARTS)) {
      const regex = new RegExp(`^${weak}\\s+`, "i");
      if (regex.test(enhanced)) {
        enhanced = enhanced.replace(regex, strong + " ");
        break;
      }
    }

    // Capitalise first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

    // Add a metric if none exists and bullet doesn't already have numbers
    if (!/\d/.test(enhanced) && enhanced.length > 20) {
      const suggestion = METRIC_SUGGESTIONS[i % METRIC_SUGGESTIONS.length];
      // Insert before final period if present
      if (enhanced.endsWith(".")) {
        enhanced = enhanced.slice(0, -1) + suggestion + ".";
      } else {
        enhanced = enhanced + suggestion + ".";
      }
    }

    // Ensure sentence ends with period
    if (!/[.!?]$/.test(enhanced)) enhanced += ".";

    return enhanced;
  });
}

/**
 * Fallback: local summary enhancement without API.
 * @param {string} summary
 * @returns {string}
 */
function localEnhanceSummary(summary) {
  if (!summary || !summary.trim()) {
    return "Results-driven professional with a proven track record of delivering impactful solutions. Combines strategic thinking with hands-on execution to drive measurable outcomes and team growth.";
  }
  // Ensure it starts with a strong opener
  const s = summary.trim();
  if (/^(i |my |i'm |i've )/i.test(s)) {
    return s
      .replace(/^i /i, "A motivated professional who ")
      .replace(/^my /i, "With ")
      .replace(/^i'm /i, "An accomplished professional who ")
      .replace(/^i've /i, "A professional with ");
  }
  return s;
}
