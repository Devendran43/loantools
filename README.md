# LoanTools — Indian Loan Cost Calculator

A minimal, accurate, privacy-first calculator that shows Indian borrowers exactly where their EMI goes: the interest
and principal in every installment, the full amortization schedule, the true cost of a loan after charges, and how
tenure changes affect total interest.

Built with **Next.js (App Router) + TypeScript + React**, no backend, no database, no accounts. Every calculation
runs in the browser.

## Why this exists

Most EMI calculators show a single number. This one is built around a different question:

> **How much will this loan actually cost me, and where does every rupee of my EMI go?**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (strict TypeScript rules) |
| `npm test` | Run the calculation engine's unit test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Project structure

```
app/                  Next.js App Router entry (layout, page, global styles)
components/           React UI components (presentational; no financial formulas)
hooks/                Small client-side hooks (count-up animation, scroll reveal)
lib/                  Pure calculation engine — currency formatting, validation, EMI/amortization math
types/                Shared TypeScript types for loan inputs/outputs
tests/                Vitest unit tests for lib/
```

The calculation engine (`lib/loanCalculator.ts`, `lib/loanValidation.ts`, `lib/currency.ts`) has **no dependency on
React or the DOM** — it's plain, independently-testable TypeScript. UI components only call into it; they never
contain financial formulas themselves. This is deliberate: it's what makes `npm test` meaningful, and it's what lets
future loan-type-specific features (home loan, vehicle loan, prepayment, etc.) reuse the same core.

## Enabling Google AdSense

The app ships with three `<AdSlot>` placements (top banner, mid-page rectangle, lower banner) that render neutral,
correctly-sized placeholders by default — **no request to Google is made until you configure a publisher ID**.

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to your AdSense publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
3. Set one or more `NEXT_PUBLIC_ADSENSE_SLOT_*` variables to your ad unit (slot) IDs.
4. Once approved by AdSense, add a `public/ads.txt` file containing the line AdSense gives you
   (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`).

Each `AdSlot`:

- Reserves its layout footprint up front (via `min-height` per variant), so real ads never cause layout shift versus
  the placeholder — on any device.
- Only asks AdSense to fill the slot once it's within 200px of the viewport (`IntersectionObserver`), so ads below
  the fold don't cost load time up front.
- Is visibly labeled "Advertisement" and boxed distinctly from editorial content, so it never gets confused with the
  calculator's own numbers — important for a financial tool where trust matters.
- Works with either AdSense's automatic/default ad formats or a manually-configured custom ad unit — both use the
  same responsive `data-ad-format="auto"` + `data-full-width-responsive="true"` unit.

## Privacy & security

- No accounts, no login, no PII fields anywhere in the form.
- Loan inputs never leave the browser — there is no backend or API to send them to, and no analytics wired up.
- No `console.log` of financial inputs.
- The only third-party network request the app can ever make is the AdSense script, and only when you've explicitly
  configured a client ID.

## Testing

```bash
npm test
```

`tests/loanCalculator.test.ts` and `tests/loanValidation.test.ts` cover EMI calculation (normal/zero-interest/edge
cases), full amortization reconciliation (schedules always close to a ₹0 balance, principal and interest totals
always reconcile), charges, tenure comparison, and input validation.

## Scope

This is an intentionally small MVP: a loan calculator, a true-cost breakdown, a tenure comparison, and the
educational explanation of how reducing-balance EMI works. It does not include loan applications, credit checks,
lender comparison, accounts, or any backend. The calculation engine is structured so those (and other loan-type- or
lender-specific features) can be added later without rewriting the math.
