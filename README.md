# TalentDash Trial Task Submission

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

## Scope Cuts & Justifications

Following the allowances in the trial PDF, the following deliberate scope cuts were made:
- **Interviews & Reviews Directory:** Skipped. The database schema focuses entirely on the core Compensation Engine. Mocking or hardcoding unstructured review data would violate the "Structured data only" philosophy of the platform.
- **ESOP Calculator:** Skipped. Given the vast complexities and variations in Indian startup ESOP vesting schedules, a simplified ESOP calculator provides poor actionable value compared to the base Salary and Hike calculators included in the `/tools` directory.

## Implemented Product Areas
1. **Companies:** Static directory with dynamic search indexing and level distributions.
2. **Salaries:** The core ingestion pipeline and paginated browsing interface.
3. **Compare:** Side-by-side compensation differentials with exact deltas.
4. **Tools:** Client-side calculators for Tax/Take-home Salary and Base Hike scenarios.

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
   Create a `.env` file in the root directory and add your connection string.
   ```text
   DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require&channel_binding=require"
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

## Evaluation Criteria Checklist

- [x] **Full Stack Completeness:** Next.js UI is fully wired to the Prisma/Postgres backend.
- [x] **Data Integrity:** TC calculations are strictly forced on the backend.
- [x] **UI Constraints:** No component libraries were used.
- [x] **Edge Case Handling:** Implemented deduplication on ingest, identical ID checking on compare, and gracefully handled missing fallback UI states (e.g., logo fallbacks).
- [x] **Production Ready:** Fully configured for Vercel/Cloudflare Serverless deployment without connection timeout issues.
