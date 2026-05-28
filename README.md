# 🎙️ SuperBryn — Voice Agent Playground

> **Diagnose exactly where your voice agent breaks in production.**  
> Upload a call transcript and get instant, AI-powered analysis across the full STT → LLM → TTS pipeline.

---

## 🚀 Live Demo

```
npm run dev
```
Then open [Live Website](https://voice-agent-playground.vercel.app/)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **STT Failure Detection** | Identifies speech recognition errors, clarification loops, and `[inaudible]` segments |
| 🧠 **LLM Intent Analysis** | Flags wrong intents, context loss, hallucinations, and irrelevant responses |
| 🔊 **TTS Quality Check** | Detects unnatural phrasing, broken sentences, and robotic output markers |
| 🔍 **Root Cause Diagnosis** | Per-stage root cause analysis with actionable recommendations |
| 📊 **Health Scores** | 0–100 scores for each pipeline stage + overall call health |
| 🗂️ **Call Timeline** | Turn-by-turn view with filterable flags per stage |
| 📈 **Conversational Metrics** | Resolution rate, user effort score, agent coherence, escalation detection |

---

## 📋 Supported Transcript Formats

- `.txt` — Plain text
- `.pdf` — PDF documents
- `.json` — Vapi, Retell, Bland.ai, and custom JSON formats
- `.vtt` / `.srt` — Subtitle/caption files
- `.md` — Markdown
- 📋 **Paste directly** — Copy-paste any transcript (min. 50 characters)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI / LLM | [Groq](https://groq.com/) — `llama-3.3-70b-versatile` |
| PDF Parsing | `pdf-parse` |
| Icons | `lucide-react` |

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd voice-agent-playground
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> 🔑 Get a free API key at [console.groq.com](https://console.groq.com)

### 3. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
voice-agent-playground/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # POST /api/analyze — transcript analysis endpoint
│   ├── results/
│   │   └── page.tsx              # Analysis results dashboard
│   ├── globals.css               # Global styles + Tailwind theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (upload / paste UI)
│
├── components/
│   ├── OverallHealthCard.tsx     # Health ring + summary + outcome metrics
│   ├── StageCard.tsx             # Per-stage (STT/LLM/TTS) score card
│   ├── TimelineView.tsx          # Turn-by-turn call timeline with filters
│   └── RecommendationsPanel.tsx  # Prioritized actionable recommendations
│
├── lib/
│   ├── analyzeTranscript.ts      # Groq LLM call + prompt engineering
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Helpers: cn, scoreToColor, severityBg, etc.
│
└── public/
    └── sample-transcript.txt     # Example transcript to try out
```

---

## 🧠 How It Works

```
User uploads transcript
        │
        ▼
  POST /api/analyze
        │
        ▼
  Text extraction
  (PDF / JSON / plain text)
        │
        ▼
  Groq LLM (llama-3.3-70b)
  analyzes full pipeline:
  ┌─────────────────────────┐
  │  STT  →  LLM  →  TTS   │
  └─────────────────────────┘
        │
        ▼
  JSON result stored in
  sessionStorage
        │
        ▼
  /results dashboard renders:
  • Overall health score
  • Stage-by-stage breakdown
  • Call timeline with flags
  • Recommendations panel
```

### Analysis Output Schema

The LLM returns structured JSON covering:

```typescript
{
  overall: {
    overall_health: number,       // 0–100
    primary_failure_stage: "STT" | "LLM" | "TTS" | "none",
    call_outcome: "successful" | "partial" | "failed",
    sentiment: "positive" | "neutral" | "negative" | "frustrated",
    resolution_rate: number,      // 0–100
    user_effort_score: number,    // 0–100
    agent_coherence_score: number // 0–100
    // ...and more
  },
  stages: {
    stt: StageFailure,
    llm: StageFailure,
    tts: StageFailure
  },
  timeline: TimelineEvent[],      // All turns, flagged where issues found
  recommendations: Recommendation[]
}
```

---

## 🧪 Try It Out

A sample transcript is included at `public/sample-transcript.txt` — a HealthCare support call where the agent repeatedly misunderstands the user's rescheduling request. Upload it on the home page to see the analyzer in action.

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key for LLM inference |

### Customizing the Model

In `lib/analyzeTranscript.ts`, change the model:

```typescript
model: "llama-3.3-70b-versatile",  // swap for any Groq-supported model
max_tokens: 5000,
temperature: 0.1,
```

### Transcript Length Limit

The analyzer currently processes up to **12,000 characters** of transcript text (configurable in `analyzeTranscript.ts`):

```typescript
${transcriptText.slice(0, 12000)}
```

---

## 📦 Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🎯 Supported Voice Platforms

The JSON parser in `route.ts` supports out-of-the-box detection for:

- **[Vapi](https://vapi.ai)** — `messages[]` format
- **[Retell AI](https://retellai.com)** — `transcript[]` format
- **[Bland.ai](https://bland.ai)** — array of utterances
- **Custom implementations** — plain text or any structured JSON

---

## 🚢 Deployment

### Deploy on Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your repo to GitHub
2. Import into Vercel
3. Add `GROQ_API_KEY` in **Settings → Environment Variables**
4. Deploy 🎉

### Other platforms

```bash
npm run build
npm run start
```

Ensure `GROQ_API_KEY` is set in your host's environment.

---

## 🔒 Privacy & Data

- Transcripts are **not stored** — they're processed in-memory per request
- Analysis results are stored in **browser sessionStorage** only (cleared on tab close)
- No analytics, no ads, no third-party tracking

---

<p align="center">
  Built for <a href="https://superbryn.com">SuperBryn</a> · Voice AI Reliability Platform
</p>
