# ✦ ResumeGlow

**The most elegant and intelligent resume builder on the internet.**

> Resumes That Get You Hired

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Client-side](https://img.shields.io/badge/client--side-100%25-blue)

---

## ✨ What Makes ResumeGlow Different

ResumeGlow isn't just another resume builder. It's an **intelligent career tool** that helps you:

- 🎯 **Beat ATS filters** — real-time compatibility scoring with actionable fixes
- 🤖 **Story Mode** — one-click AI rewriting of boring bullets into compelling achievement stories
- 🔍 **Job Match Analyzer** — paste a JD and instantly see your keyword match score + gaps
- 💎 **6 premium templates** — designed to look like a $500 professional resume
- 📄 **Perfect PDF export** — pixel-perfect A4 output, print-ready

---

## 🚀 Quick Start

No installation required. Just open `index.html` in any modern browser.

```bash
git clone https://github.com/yourusername/resumeglow.git
cd resumeglow
open index.html   # macOS
# or
start index.html  # Windows
```

For development with live reload:

```bash
npx serve .
# then visit http://localhost:3000
```

---

## 📁 Project Structure

```
resumeglow/
├── index.html              # App shell + Alpine.js templates
├── css/
│   └── style.css           # Design system, templates, animations
├── js/
│   ├── main.js             # Alpine.js app controller (state + interactions)
│   ├── resume-data.js      # Data schemas, templates, color presets
│   ├── preview-renderer.js # Renders 6 template HTML strings live
│   ├── ats-optimizer.js    # ATS scoring + job description analysis
│   ├── story-rewriter.js   # AI bullet/summary rewriter (Claude API)
│   ├── pdf-export.js       # html2canvas + jsPDF export
│   └── utils.js            # uid, debounce, storage, date helpers
├── assets/
│   └── icons/              # (optional) custom SVG icon assets
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🎨 Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Modern** | Dark header, two-column | Tech, Design, Product |
| **Minimal** | Ultra-clean, single-column | Any industry |
| **Executive** | Centered, ceremonial | C-suite, Senior roles |
| **Creative** | Colored sidebar | Creative fields |
| **Elegant** | Calligraphic, editorial | Academia, Law, Finance |
| **Tech** | Dark header, monospace accents | Engineering, DevOps |

---

## ⚡ Core Features

### Real-time Live Preview
The right panel updates instantly as you type. Zoom in/out with the preview controls.

### ATS Optimizer
Checks your resume against 12+ ATS criteria including:
- Contact completeness
- Quantified achievements
- Action verbs
- Keyword density
- Employment date formatting

### Story Mode (AI-Powered)
Click **Story Mode** on any experience entry to rewrite your bullet points using Claude AI. Transforms:

> "Helped with website redesign"

Into:
> "Drove end-to-end website redesign, increasing conversion rate by 34% and reducing bounce rate by 22%."

*Requires internet connection. Falls back to local enhancement if API is unavailable.*

### Job Description Analyzer
Paste any job posting and get:
- Match score (%)
- Keywords already in your resume ✓
- Missing high-priority keywords (click to add) ✕
- Smart tailoring suggestions

### Multi-Resume Management
Create and manage multiple resumes (e.g. one per industry/role). All data is stored locally in your browser — nothing leaves your device.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Alpine.js 3 (CDN) |
| Styling | Tailwind CSS (CDN) |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts) |
| PDF Export | jsPDF + html2canvas (CDN) |
| AI Features | Anthropic Claude API |
| Storage | Browser localStorage |
| Backend | None — 100% client-side |

---

## 🔑 AI Features & API Key Setup

Two features use the **Anthropic Claude API**: **Story Mode** (rewrites bullet points) and **Summary Rewrite**.

> **The entire app works without an API key.** If no key is configured, these two features fall back to a built-in local enhancement engine that still adds metrics and fixes weak verbs — just without the full AI magic.

### Which scenario are you in?

---

#### ✅ Scenario A — Opened inside Claude.ai (Artifacts)
No setup needed. API calls are automatically handled. Just click **Story Mode** and it works.

---

#### 🖥️ Scenario B — Running locally (`open index.html` in your browser)

1. **Get a free API key** at [console.anthropic.com](https://console.anthropic.com) → sign up → *API Keys* → *Create Key*
2. **Open** `js/story-rewriter.js` in any text editor
3. **Find line 29** — it looks like this:
   ```js
   const ANTHROPIC_API_KEY = '';
   ```
4. **Paste your key** between the quotes:
   ```js
   const ANTHROPIC_API_KEY = 'sk-ant-api03-xxxxxxxxxxxxxxxx';
   ```
5. **Save the file** and refresh `index.html` in your browser. Done ✓

> ⚠️ **Security warning:** Never commit your real API key to a public GitHub repository.  
> Your key would be exposed to anyone who visits the repo and could be abused.  
> See the safe alternatives below.

---

#### 🔒 Safe Ways to Use Your Key (for public repos / deployments)

**Option 1 — Keep it local only (simplest)**  
Add `js/story-rewriter.js` to your `.gitignore` so the file with your key is never pushed:
```bash
echo "js/story-rewriter.js" >> .gitignore
```
Keep a `story-rewriter.example.js` in the repo with the empty key as a template.

**Option 2 — Use a tiny local proxy server**  
Run a minimal Express server that injects the key server-side:
```bash
npm install express http-proxy-middleware
```
Store your key in a `.env` file (already in `.gitignore`) and proxy `/v1/messages` through it.

**Option 3 — Deploy with environment variables (Netlify / Vercel)**  
Use a serverless function to forward requests. Set `ANTHROPIC_API_KEY` as an environment variable in your hosting dashboard — it never touches the frontend code.

---

#### 🤷 Scenario C — No API key, no problem
Just use the app normally. When you click **Story Mode**, the local fallback engine:
- Replaces weak openers ("helped with", "assisted in") with strong action verbs
- Injects plausible quantified metrics where none exist
- Ensures every bullet ends with a measurable result

It's not as powerful as Claude AI, but it's still significantly better than raw unedited bullets.

---

## 📖 Usage Tips

1. **Start with a template** that matches your industry
2. **Fill in your experience** — use the bullet points for achievements, not responsibilities
3. **Click Story Mode** on each role to supercharge your bullets with AI
4. **Paste a job description** in the Job Match tab to tailor your resume
5. **Check your ATS score** — aim for 80%+
6. **Export your PDF** when ready

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🌟 Acknowledgments

Built with care using [Alpine.js](https://alpinejs.dev), [Tailwind CSS](https://tailwindcss.com), [jsPDF](https://github.com/parallax/jsPDF), and the [Anthropic Claude API](https://anthropic.com).

---

<p align="center">Made with ✦ by the open-source community</p>
<p align="center"><em>ResumeGlow — Resumes That Get You Hired</em></p>