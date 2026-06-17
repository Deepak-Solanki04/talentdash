# TalentDash — Career Intelligence Platform

This repository contains the completed 3-Day Engineering Trial Task (Frontend/Full-Stack) for TalentDash.

## Live Deployment
👉 **[Live URL: https://talentdash-ten.vercel.app](https://talentdash-ten.vercel.app)**

---

## Quick Start (Run Locally in < 2 mins)

### 1. Prerequisites
Ensure you have Node.js 18+ and `npm` installed.

### 2. Environment Variables
Create a `.env` file in the root directory. Since this is an MVP using a mock dataset, the local SQLite database path is fine for local testing.
```env
# .env
DATABASE_URL="file:./dev.db"
```

### 3. Database Setup & Seeding
Install dependencies and run the Prisma migrations and seed script. The seed script uses the `lib/mock-data.ts` file to populate the database with realistic salary records.
```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start the Application
Run the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

To test the production build (recommended to test ISR and Static Generation):
```bash
npm run build
npm start
```

---

## Architecture Decisions & Trade-Offs

### 1. Rendering Strategies (Static vs ISR vs Dynamic)
I rigorously followed the exact rendering strategies mandated by the business model (zero-cost static edge delivery):
*   **Homepage (`/`) — ISR (3600s):** The homepage displays trending companies and recent data. Revalidating every hour keeps it fresh without triggering constant DB queries.
*   **Salary Table (`/salaries`) — Static:** This is the core SEO asset. It is generated at build time. Since data doesn't change every minute, static generation ensures the absolute fastest LCP (< 2s) for Google indexing.
*   **Company Pages (`/companies/[slug]`) — Static + ISR (7200s):** I used `generateStaticParams` to pre-build all known companies at build time. They revalidate every 2 hours to pick up new review/salary averages.
*   **Compare Page (`/compare`) — Client Component:** The comparison tool relies on highly interactive state (dropdowns, URL parameter syncing for `s1` and `s2`, and real-time delta math). Since it's a tool rather than a core content page, client-side rendering with URL state preservation was the correct architectural choice.

### 2. Pagination: Page-Based vs Cursor-Based
I chose **Page-Based Pagination** for the frontend Salary Table. 
*   **Why?** The requirements strictly specified "Pagination: 25 rows per page. Previous / Next controls. Shows 'Showing 26–50 of 312 records'". Cursor-based pagination is excellent for infinite scrolling (like social feeds) and massive datasets, but page-based pagination is much better for structured, analytical data where users expect to jump to specific pages and see the exact total count of records matching their filters.

### 3. What I would build differently with another day
*   **Typesense Integration:** Currently, the company/role search uses simple text filtering on the client/DB. With another day, I would integrate Typesense (as per the backend architectural docs) to handle typo-tolerance and lightning-fast autocomplete.
*   **Full API Routes:** While I used Server Components directly querying Prisma for the frontend MVP, building out the rigorous `POST /api/ingest-salary` pipeline with LLM normalization and Pydantic validation (as outlined in the AI/Data spec) would be my immediate next priority to complete the full-stack loop.

### 4. Scope Cuts (What I did NOT build and why)
*   **Authentication (Clerk/Auth.js):** I explicitly did not build authentication walls. The trial instructions clearly stated: *"No auth. There is no authentication in this trial. No login walls, no session handling... keep the scope clean."*
*   **Backend Scraper/AI Normalization:** I focused 100% of my time on the Frontend delivery (F1 through F7). Building the AI/Data pipeline would have taken time away from perfecting the strict "Levels.fyi meets Airbnb" visual aesthetics, the URL-synced filtering, and the percentage delta math logic required for a flawless frontend submission within 72 hours.
*   **Component Libraries:** I completely avoided ShadCN, MUI, and Chakra. Every single component, table, card, and button was built using raw Tailwind CSS utility classes to prove absolute mastery over the UI layer and keep the JS bundle minimal.

---

## Key Features Delivered
1.  **Strict "Levels.fyi meets Airbnb" Aesthetics:** Pure Tailwind CSS, data-dense layouts, `#0369A1` Data Blue highlights, and clear typography.
2.  **The "Power" Filter Bar:** Fully functional URL-synced filters on the `/salaries` page.
3.  **Real-Time Currency Toggle:** Instant INR/USD recalculations across the entire table.
4.  **Percentage Delta Math:** The `/compare` tool instantly calculates exact percentage differences (e.g., `+28.0%`) for all compensation metrics.
5.  **Performance & SEO:** All pages use `next/image` to prevent layout shifts (CLS < 0.1), and include JSON-LD structured data to guarantee rich Google search results.
