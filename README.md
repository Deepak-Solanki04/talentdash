# TalentDash Trial Task Submission

**Live Application:** [https://talentdash-ten.vercel.app/](https://talentdash-ten.vercel.app/)

This repository contains the Full Stack implementation for the TalentDash 3-Day Engineering Trial Task. The platform has been engineered specifically for the Indian tech compensation ecosystem, prioritizing structured data, scalability, and static-first performance.

## Product Architecture & Engineering Principles

TalentDash is designed as a career intelligence platform built around the core principle: "Structured data → Comparable → Decision-ready". 

### 1. Static-First Architecture
The business model relies on near-zero infrastructure costs for massive scale. To achieve this, the Next.js App Router (v15) generates static HTML at build time (`generateStaticParams`) for all directories, such as `/companies/[slug]`. 

### 2. Data Contract Enforcement
The backend enforces absolute data integrity. When users submit salaries via the `/api/ingest-salary` endpoint, any client-side Total Compensation (TC) calculation is entirely ignored. The server rigidly calculates `total_compensation = base + bonus + stock`. All monetary values are handled natively as `BigInt` to prevent floating-point loss at scale.

### 3. Serverless Database Edge Architecture
The platform is built on PostgreSQL hosted via Neon Database. To prevent connection limit exhaustion inherent to standard Postgres instances in serverless environments, the application uses Prisma ORM paired with `@prisma/adapter-neon`. The connection is routed through WebSockets (`ws`) and pooled natively, enabling perfect Edge compatibility on Cloudflare Pages and Vercel.

### 4. Custom Design System
As per the strict requirement against using off-the-shelf component libraries (e.g., Shadcn, MUI, Chakra), the UI is built 100% from scratch using Tailwind CSS v4. The visual identity follows a dense, analytical design language similar to Airbnb (using the prescribed `#FF5A5F` and `#222222` color palettes) optimized for trust and clarity. Company logos are dynamically populated via Clearbit APIs.

## Technical Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon Serverless recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Deepak-Solanki04/talentdash.git
   cd talentdash
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your PostgreSQL connection string. 
   ```text
   DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
   ```

4. Initialize the Database and Seed Data:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. Start the Development Server:
   ```bash
   npm run dev
   ```

## Architecture Decisions

### The Hardest Decision
The most difficult decision I made during this project was completely excluding the unstructured reviews and interview experiences rather than mocking them with fake data. I initially wanted to build out the full platform UI with placeholders just to make the app look massive, but I realized this directly violated the product's core philosophy of "Structured data only". Building a legitimate relational pipeline for text-heavy, unstructured reviews would have required a completely different database approach (like vector embeddings or full-text search) which would have distracted from perfecting the core Compensation Engine. Ultimately, I decided to aggressively cut those features to ensure the core mathematical components (Salaries, Comparisons, Calculators) were engineered to absolute perfection. 

### Static vs ISR vs Dynamic
- **Static (`generateStaticParams`):** Applied to individual company profiles (`/companies/[slug]`). Since company data (headquarters, base metadata) rarely changes, this guarantees millisecond load times.
- **ISR (Incremental Static Regeneration):** Applied to the main directories (`/companies` and `/salaries`) with a 3600s TTL. This ensures the high-traffic index pages remain incredibly fast while still periodically reflecting newly ingested salary data without manual redeploys.
- **Dynamic:** Applied strictly to the `/api/ingest-salary` and `/api/compare` endpoints, where user-specific mutations and calculations must happen in absolute real-time.

### Pagination Strategy
I chose **page-based pagination** (using `skip` and `take`) over cursor-based pagination for the Salary directory. While cursor-based pagination is slightly more performant for massive infinite-scroll datasets, page-based pagination was chosen because users researching compensation strongly prefer deterministic navigation (e.g., jumping specifically to page 5 to see mid-tier salaries) rather than being forced to scroll endlessly. 

### What I would build differently with another day
Given another 24 hours, I would completely implement the authentication pipeline and the unstructured data models (Reviews/Interviews). Additionally, I would move the `BigInt` parsing serialization logic out of the component level and into a unified Next.js API interceptor for cleaner boundary passing.

### Scope Choices (What I did NOT build and why)
Following the allowances in the trial PDF under extreme time pressure, the following deliberate scope cuts were made:
- **Interviews & Reviews Directory:** Skipped. Mocking or hardcoding unstructured review data would violate the strict "Structured data only" philosophy of the platform. Building the full pipeline required structural database changes that fell outside the primary Compensation Engine objective.
- **ESOP Calculator:** Skipped. Given the vast complexities and variations in Indian startup ESOP vesting schedules, a simplified ESOP calculator provides poor actionable value compared to the deterministic Salary and Hike calculators included in the `/tools` directory.

## Implemented Product Areas
1. **Companies:** Static directory with dynamic search indexing and level distributions.
2. **Salaries:** The core ingestion pipeline and paginated browsing interface.
3. **Compare:** Side-by-side compensation differentials with exact deltas.
4. **Tools:** Client-side calculators for Tax/Take-home Salary and Base Hike scenarios.
