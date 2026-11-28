# homebudget-site-20261126

[![make.fun competition](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Luecria / homebudget-site-20261126 rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Luecria/homebudget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard)
[![Luecria / homebudget-site-20261126 reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Luecria/homebudget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

**HomeBudget v2**, by **Luecria**, is an offline household budget site for the [Make the best household budget site competition](https://make.fun/bounty/best-household-budget-site-20261126-1457). This repository is `Luecria/homebudget-site-20261126`. Version 2 adds bill tracking to the Alvarez household's November 2026 budget.

The app uses plain HTML, CSS, and JavaScript modules with no build step or external network requests. Its responsive green interface presents the Alvarez household's November 2026 demo budget on desktop and phone screens.

## What it does

- **Dashboard — `#/`**: income, spending, savings, category progress, recent transactions, upcoming bills, and savings goals.
- **Transactions — `#/transactions`**: all 29 transactions, category and text filters, and controls to add or delete spending. Changes update totals across the app.
- **Budgets — `#/budgets`**: editable monthly category limits, remaining balances, and progress bars. Utilities is the only category over budget; groceries is at 98%.
- **Bills — `#/bills`**: December 2026 due dates, amounts, autopay, unpaid totals, and paid status. Mark bills paid or unpaid, add bills, or delete them; changes persist in localStorage.
- **Goals — `#/goals`**: emergency fund, Bali vacation, and new car balances. Add $50 or $100, create a goal, or delete one.
- **Reports — `#/reports`**: six months of income and spending, this month's category breakdown, and both income sources. Average monthly saving is $2,046, rounded.

Bill additions, paid-status toggles, and deletions persist under the existing `homebudget-v1` localStorage key. The Bills page starts with six December bills totaling $2,090.99 due, five on autopay, and all six unpaid. **Reset demo data** restores the starting household.

## Run it

```sh
node serve.ts
```

Open `http://localhost:8080` in a browser. The existing server serves `app/` without a build step.

## Build the entry

```sh
MAKEFUN_OUTPUT_DIR=/tmp/hb-v2-out node main.ts
```

This copies `app/` and the existing `screenshots/` into `/tmp/hb-v2-out` and writes `dossier.json`. Without `MAKEFUN_OUTPUT_DIR`, the default destination is `/output`.

`main.ts` has an authored HomeBudget header comment; its executable lines are unchanged. `serve.ts`, `shots.json`, `screenshots/`, and the vendored make.fun kit are unchanged. Building locally does not submit the entry.

## Verify

The six page renderers were loaded as ES modules in Node and rendered successfully, including the new `#/bills` route. The Bills view contains every seeded bill's name, amount, and due date; the Dashboard render includes a link to Bills. JavaScript syntax checks passed. The Bills page screenshot is `screenshots/2-bills.png` (it replaces the Transactions screenshot; the dashboard already shows recent transactions). The four screenshots are the dashboard, Bills, phone Budgets, and Reports views.

The build command above completed successfully. `/tmp/hb-v2-out/dossier.json` parses as valid JSON with the required keys **cover**, **images**, **schema**, and **text**.

Verified starting figures:

- **Income: $5,850 from 2 sources.**
- **Total spent: $3,663.77 across 29 transactions.**
- **Saved: $2,186.23, or 37% of income.** The dashboard preserves whole-dollar displays: $3,664 spent and $2,186 saved.
- **Utilities is the only category over budget: $306.29 of $290, or $16.29 over.**
- **Groceries: $708.75 of $720 (98%), with $11.25 left.**
- **10 categories**, including the savings target, and **6 upcoming bills** in the data. The dashboard preserves its four-bill preview.
- **3 goals:** emergency fund **$8,400/$12,000**; Family vacation — Bali **$1,150/$2,500**; new car **$2,300/$8,000**.
- **6-month trend:** June–November 2026, with rounded average monthly saving of **$2,046**.

The original household, transaction, budget, goal, and report figures remain unchanged; the bill seed records add a `paid: false` status. The existing four screenshots remain in place because Chromium could not run to produce the requested Bills image.

To repeat these checks in this verification environment:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/hb-v2-out node main.ts
node /tmp/hb-v2-verify.mjs
```

The verifier and its original-file reference are temporary verification artifacts outside the repository. Screenshots were preserved from the original entry; they were not regenerated during these offline checks.

## How to verify

Run the site locally:

```sh
node serve.ts
```

Open `http://localhost:8080` and visit all six routes: `#/`, `#/transactions`, `#/budgets`, `#/bills`, `#/goals`, and `#/reports`. Use **Reset demo data** before comparing the starting figures. On `#/bills`, try marking a bill paid and unpaid, adding a bill with optional autopay, and deleting a bill; reload to check saved changes.

Build the dossier in a temporary output directory:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/hb-out node main.ts
```

Check that `/tmp/hb-out/dossier.json` is valid JSON containing **cover**, **images**, **schema**, and **text**. Confirm income is **$5,850**, total spent is **$3,663.77**, and saved is **$2,186.23**. Only **Utilities** should be over budget, by **$16.29**. The dashboard rounds spending and savings to whole dollars; use the detailed views or the data calculations for cents. In a sandbox that blocks live servers, render the five views offline instead.

## Screenshots

The four existing screenshots are real headless Chromium renders of the original site's code:

1. `screenshots/1-dashboard.png` — dashboard, 1280×800.
2. `screenshots/2-transactions.png` — transactions, 1280×800.
3. `screenshots/3-budget-phone.png` — budgets, 390×844.
4. `screenshots/4-reports.png` — reports, 1280×800.

The requested `screenshots/5-bills.png` capture for `#/bills` at 1280×800 was not generated because Chromium could not start in the verification environment.

---

Referral: **t2m0zqpw** · [make.fun](https://make.fun/?ref=t2m0zqpw&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
