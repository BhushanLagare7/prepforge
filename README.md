<div align="center">

# 🧠 PrepForge

**AI-powered job preparation — interviews, resumes, and technical skills in one place.**

Land your dream job faster with real-time AI voice interviews, ATS resume analysis, and curated practice questions tailored to every role you target.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com)
[![NeonDB](https://img.shields.io/badge/NeonDB-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)

<br/>

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-prepforge--ten.vercel.app-6C47FF?style=for-the-badge)](https://prepforge-ten.vercel.app)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎙️ AI Voice Interviews

Conduct realistic mock interviews powered by Hume AI's voice engine. Get real-time adaptive questioning and personalized feedback on your communication style and delivery.

</td>
<td width="50%">

### 📄 Resume Analysis

Upload your resume and receive an AI-generated ATS compatibility score, keyword gap analysis, and actionable suggestions tailored to your target role.

</td>
</tr>
<tr>
<td width="50%">

### 💡 Question Practice

Browse AI-generated technical and behavioral question sets scoped to each specific job. Practice answers and review detailed explanations.

</td>
<td width="50%">

### 📊 Job Dashboard

Organize your entire prep around individual job applications. Each job has its own interviews, questions, and resume analyses tracked in one place.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

|     Category     | Technology                                           |
| :--------------: | :--------------------------------------------------- |
| 🏗️ **Framework** | Next.js 16 (App Router) + React 19                   |
| 🔷 **Language**  | TypeScript (strict mode)                             |
|   🔐 **Auth**    | Clerk (`@clerk/nextjs` v7)                           |
| 🗄️ **Database**  | NeonDB (serverless PostgreSQL) via Drizzle ORM       |
| 🤖 **AI / LLM**  | Vercel AI SDK + Google Gemini (`@ai-sdk/google`)     |
| 🎙️ **Voice AI**  | Hume AI (`hume`, `@humeai/voice-react`)              |
| 🛡️ **Security**  | Arcjet (bot protection, rate limiting, OWASP shield) |
|    🎨 **UI**     | shadcn/ui + Radix UI + Tailwind CSS v4               |
|   📝 **Forms**   | React Hook Form + Zod v4                             |

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have accounts and credentials for the following:

|                                                    Service                                                    | Purpose                  |                        Link                        |
| :-----------------------------------------------------------------------------------------------------------: | ------------------------ | :------------------------------------------------: |
|   ![Node](https://img.shields.io/badge/Node.js_20+-339933?logo=nodedotjs&logoColor=white&style=flat-square)   | JavaScript runtime       |          [nodejs.org](https://nodejs.org)          |
|       ![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white&style=flat-square)        | Authentication           |           [clerk.com](https://clerk.com)           |
|     ![Neon](https://img.shields.io/badge/NeonDB-00E599?logo=postgresql&logoColor=black&style=flat-square)     | Serverless PostgreSQL    |           [neon.tech](https://neon.tech)           |
| ![Google](https://img.shields.io/badge/Google_AI_Studio-4285F4?logo=google&logoColor=white&style=flat-square) | Gemini API key           | [aistudio.google.com](https://aistudio.google.com) |
|                    ![Hume](https://img.shields.io/badge/Hume_AI-FF6B35?style=flat-square)                     | Voice interviews         |             [hume.ai](https://hume.ai)             |
|                    ![Arcjet](https://img.shields.io/badge/Arcjet-1A1A2E?style=flat-square)                    | Security & rate limiting |          [arcjet.com](https://arcjet.com)          |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/BhushanLagare7/prepforge.git
cd prepforge

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in all values — see the Environment Variables section below

# 4. Push the schema to your database
npm run db:push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

All variables are validated at startup via `@t3-oss/env-nextjs` — missing values throw at build time.

<details>
<summary><strong>🔒 Server-side variables (never exposed to the browser)</strong></summary>

```env
ARCJET_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
HUME_API_KEY=
HUME_SECRET_KEY=
GEMINI_API_KEY=
```

</details>

<details>
<summary><strong>🌐 Client-side variables (<code>NEXT_PUBLIC_*</code>)</strong></summary>

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
NEXT_PUBLIC_HUME_CONFIG_ID=
```

</details>

---

## 📜 Available Scripts

<div align="center">

| Script                | Description                                    |
| :-------------------- | :--------------------------------------------- |
| `npm run dev`         | ▶️ Start the Next.js development server        |
| `npm run build`       | 📦 Build for production                        |
| `npm run start`       | 🚀 Start the production server                 |
| `npm run lint`        | 🔍 Lint the project                            |
| `npm run lint:fix`    | 🔧 Auto-fix lint issues                        |
| `npm run dev:webhook` | 🔗 Start ngrok for local Clerk webhook testing |
| `npm run db:push`     | 🗄️ Push schema changes directly to DB          |
| `npm run db:generate` | 📋 Generate Drizzle migration files            |
| `npm run db:migrate`  | ⚡ Run migrations                              |
| `npm run db:studio`   | 🖥️ Open Drizzle Studio (visual DB explorer)    |

</div>

---

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (auth provider, themes, fonts)
│   ├── page.tsx            # Public marketing/landing page
│   ├── sign-in/            # Clerk-hosted sign-in UI
│   ├── onboarding/         # Post-signup onboarding flow
│   ├── app/                # Authenticated app shell
│   │   ├── page.tsx        # Dashboard
│   │   └── job-infos/      # Per-job-application routes
│   └── api/
│       ├── ai/             # AI streaming / generation endpoints
│       └── webhooks/       # Clerk webhook handlers
├── components/             # Shared UI components (shadcn/ui + custom)
├── features/               # Feature-scoped modules
│   ├── interviews/
│   ├── job-infos/
│   ├── questions/
│   ├── resume-analyses/
│   └── users/
├── services/               # External service integrations
│   ├── ai/                 # Vercel AI SDK wrappers
│   ├── clerk/              # Clerk auth helpers
│   └── hume/               # Hume AI voice session helpers
├── drizzle/                # Database layer (schema, client, helpers)
├── data/env/               # Runtime env validation (server + client)
├── lib/                    # Shared utilities (cache tags, formatters, etc.)
└── proxy.ts                # Next.js middleware (Clerk auth + Arcjet)
```

---

## 🔐 Auth & Routing

<div align="center">

| Route              | Access                                     |
| :----------------- | :----------------------------------------- |
| `/`                | 🌍 Public — marketing landing page         |
| `/sign-in(.*)`     | 🔑 Public — Clerk sign-in                  |
| `/onboarding`      | 🎉 Post-signup — creates user record in DB |
| `/app`             | 🔒 Protected — dashboard                   |
| `/app/job-infos/*` | 🔒 Protected — per-job preparation hub     |

</div>

> [!NOTE]
> The middleware is located at `src/proxy.ts`, not the conventional `middleware.ts`.

---

## 🔗 Webhook Setup (Local Dev)

To test Clerk webhooks locally, run ngrok alongside the dev server:

```bash
npm run dev:webhook   # starts: ngrok http 3000
```

Configure the generated ngrok URL as a webhook endpoint in your Clerk dashboard pointing to `/api/webhooks/clerk`.

---

## ⚡ Caching

The project uses Next.js experimental `"use cache"` with tag-based invalidation. Cache tags are generated in `src/lib/data-cache.ts`:

| Helper                          | Scope                              |
| :------------------------------ | :--------------------------------- |
| `getGlobalTag(tag)`             | Invalidates all records of a type  |
| `getUserTag(tag, userId)`       | Invalidates a specific user's data |
| `getJobInfoTag(tag, jobInfoId)` | Invalidates job-scoped data        |
| `getIdTag(tag, id)`             | Invalidates a single record        |

Available tags: `"users"` · `"jobInfos"` · `"interviews"` · `"questions"`

---

## 🛡️ Security

- **🤖 Arcjet** — All non-public routes are protected with bot detection, rate limiting (100 req/min sliding window), and OWASP shield.
- **🔐 Clerk** — Handles all authentication end-to-end. No custom auth is implemented.
- **🪝 Webhooks** — `/api/webhooks/*` is excluded from Clerk middleware; Clerk signs webhook payloads separately.

> [!CAUTION]
> Never commit secrets or API keys. All credentials must live in `.env` and are never exposed to the browser unless explicitly prefixed with `NEXT_PUBLIC_`.

---

## 🚢 Deployment

<div align="center">

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BhushanLagare7/prepforge)

</div>

```bash
npm run build   # Produces an optimized production build in .next/
npm run start   # Serves the production build locally
```

Ensure all environment variables are configured in your deployment environment before building.

> [!NOTE]
> This project uses Next.js 16 with `experimental.useCache: true`. Some APIs differ significantly from earlier versions — always consult `node_modules/next/dist/docs/` for the most accurate references.

---

<div align="center">

Built with ❤️ to help you **land your dream job**.

[![prepforge-ten.vercel.app](https://img.shields.io/badge/🌐_prepforge--ten.vercel.app-Visit_Live_Site-6C47FF?style=for-the-badge)](https://prepforge-ten.vercel.app)

</div>
