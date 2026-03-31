# Salesforce M&A Screening and Judgment System

Production-minded Assignment 2 project for a Business AI Foundations course. The system screens acquisition targets for Salesforce Corporate Development using deterministic financial logic, a narrow strategic-fit agent boundary, structured outputs, Markdown reports, Supabase persistence, and a lightweight dashboard.

## Quick start

```bash
npm.cmd install
npm.cmd run test
npm.cmd run screen
npm.cmd run dev
```

## Supabase setup

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_SUPABASE_URL`
3. Set `SUPABASE_SERVICE_ROLE_KEY`
4. Run the SQL in `src/db/schema.sql`

If Supabase environment variables are not set, the app falls back to an in-memory store so the assignment demo still works locally. If `OPENAI_API_KEY` is not set, the strategic-fit step uses a deterministic mock fallback.

## Dataset modes

- Default: curated real-company dataset with modeled financial inputs
- Optional: set `TARGET_DATASET=sample` in `.env.local` to use the original fictional fixture set

The real-company dataset uses actual company identities and official product sources, while some financial fields remain assignment estimates where reliable public figures are not consistently available.

## Live enrichment

- Default: `TARGET_ENRICHMENT=live`
- Optional: set `TARGET_ENRICHMENT=static` to skip web refreshes

In live mode, the app fetches official company websites and refreshes the product-language fields from page metadata and title tags before screening. Financial fields remain explicitly modeled until a dedicated finance ingestion layer is added.

## Public-company financial overrides

To stay within assignment scope, the finance layer is intentionally narrow:
- Private companies still use modeled financial inputs
- Public companies can use a small official-source override layer
- The current implementation includes ServiceTitan as the first official-source-backed public-company example

This keeps the system inspectable and realistic without turning the project into a full financial data platform.
