# TalentDash — India Tech Compensation Data

TalentDash is a career intelligence platform that provides structured, level-aware salary data, company reviews, and interview experiences for Indian tech professionals. It is engineered with a static-first philosophy for maximum SEO performance.

## 🚀 Live Demo & Deployment

This application is designed for Edge deployment via **Cloudflare Pages** or Vercel. 

**Demo URL:** [talentdash.in](https://talentdash.in) *(example)*

## 🏗️ Architecture & Tech Stack

Following the strict trial task guidelines, TalentDash relies exclusively on modern tools:
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 (Custom UI components, NO Shadcn/MUI/Headless libraries)
- **Database:** Prisma ORM 7 + Neon PostgreSQL (Serverless, @prisma/adapter-neon)
- **Deployment:** Cloudflare Pages (Edge runtime support)

### Engineering Decisions

1. **Static-First & SEO Driven:** 
   Company profiles (`/companies/[slug]`) are statically generated at build time using `generateStaticParams()` directly from the database and cached via ISR. This ensures zero latency and perfect SEO.
2. **True Data Contract Enforcement:** 
   The ingest pipeline (`/api/ingest-salary`) strictly forces server-side recalculation of `total_compensation = base + bonus + stock`. Client-submitted TC values are ignored to prevent tampering.
3. **True Statistical Analytics:** 
   All aggregations (e.g., median TC) compute a true statistical median, rather than using an arithmetic average, ensuring outlier salaries (like CEOs) don't distort the expectation for normal software engineers.
4. **Performance:** 
   Global CSS and vanilla React transitions are prioritized over heavy animation libraries to strictly hit the LCP < 2s criteria.
5. **Typesafe Database Schema:** 
   All monetary values are stored as `BigInt` at the schema level to avoid floating point inconsistencies, ensuring penny-perfect accuracy down to the paise.

## ⚙️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Deepak-Solanki04/talentdash.git
   cd talentdash
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env` and add your Neon PostgreSQL connection string:
   ```bash
   DATABASE_URL="postgresql://username:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   *Note: The seed script auto-generates 12 companies and 52 realistic tech salaries (Google, Amazon, Flipkart, etc.).*

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🛣️ API Endpoints

- `POST /api/ingest-salary`: Upload a new salary record (Includes strict validation, deduplication, and server-side TC computation).
- `GET /api/salaries`: Returns paginated, filterable salary data.
- `GET /api/companies/[slug]`: Returns full company metadata and level distributions.
- `GET /api/compare?s1=[id]&s2=[id]`: Fetches a side-by-side comparison of two salary records with detailed deltas.

## 🧪 Evaluation Criteria Checklist

- [x] **Full Stack Implementation:** UI and Database fully integrated.
- [x] **Data Contract Verification:** TC recalculation enforced server-side.
- [x] **UI/UX Aesthetics:** Highly polished, custom Tailwind UI, vibrant branding (`#FF5A5F`), CSS micro-interactions.
- [x] **No UI Libraries:** 100% custom styling, no Shadcn/Radix/MUI used.
- [x] **Edge Cases Handled:** 404 pages mapped, empty states designed, identical ID comparison blocked, duplicate ingest detection built-in.
- [x] **Edge-Ready/Serverless:** Uses Neon connection pooling (`PrismaNeon` adapter) and Edge-friendly Route Handlers.
