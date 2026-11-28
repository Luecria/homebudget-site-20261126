# homebudget-site-20261126

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Luecria/homebudget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Luecria/homebudget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

**HomeBudget v3**, by **Luecria**, is an offline household budget site for the Alvarez household, November 2026, and the [Make the best household budget site competition](https://make.fun/bounty/best-household-budget-site-20261126-1457).

The app uses plain HTML, CSS, and JavaScript modules, with no build step, external libraries, or runtime network requests. Its responsive green interface works on desktop and phone screens.

## What's new in v3

- **Insights — `#/insights`** compares November spending with October 2026 by category, showing dollar and percentage changes. The new `PREV_MONTH_BY_CAT` table in `app/data.js` totals $3,910, matching October in Reports. Insights also aggregates the top five merchants or payees by transaction description, lists the three biggest single expenses, and identifies the best and worst categories by dollars remaining against budget.
- **Dashboard donut** uses only CSS `conic-gradient`, with category colors from the shared data. The chart sits beside “Where the money went”; its legend includes every spending category, amount, and percentage. Savings is excluded because it is an allocation rather than an expense. Panels stack on narrow screens.
- **Spending pace** appears on both Dashboard and Insights: daily spending, daily budget allowance, projected month-end spending and saving, and an on-track/over-pace verdict against the combined spending budgets. Days covered run from November 1 through the latest recorded November transaction, including days without spending. The projection multiplies that daily average by 30; the completed month therefore projects its actual total.
- **A fuller month** adds six realistic transactions from November 27–30, for 35 total. November's Reports figure follows the live transaction total, including additions and deletions. Existing saved households receive the six new seed transactions once while retaining their edits, goals, and Bills status under the existing `homebudget-v1` storage key.

Starting v3 figures:

- Income: **$5,850** from two sources.
- Spending: **$3,834.01** across **35 transactions**, through November 30.
- Saved: **$2,015.99** (34% of income). Dashboard cards round to $3,834 spent and $2,016 saved.
- Utilities is the **only** category over budget: **$306.29 / $290**, or **$16.29 over**.
- Groceries: **$717.70 / $720**, leaving **$2.30**.
- Daily average: **$127.80**; daily spending budget pace: **$138.00**, based on a **$4,140** spending budget. The household is **on track**.
- Best category by budget headroom: **Transport**, $98.95 remaining; worst: **Utilities**, $16.29 over.
- Six-month average saving: **$2,018**, rounded.

## Existing features

- **Dashboard — `#/`**: income, spending, savings, category progress, recent transactions, upcoming bills, and savings goals, plus the v3 additions above.
- **Transactions — `#/transactions`**: category and text filters, and controls to add or delete spending.
- **Budgets — `#/budgets`**: editable monthly category limits, remaining balances, progress bars, and the savings target.
- **Bills — `#/bills`**: six December 2026 bills totaling $2,090.99 initially due, five on autopay. Mark bills paid or unpaid, add bills, or delete them. The Dashboard retains its four-bill preview.
- **Goals — `#/goals`**: emergency fund ($8,400/$12,000), Bali vacation ($1,150/$2,500), and new car ($2,300/$8,000). Add $50 or $100, create a goal, or delete one.
- **Reports — `#/reports`**: six months of income and spending, the current category breakdown, and both income sources.

Edits persist in localStorage. **Reset demo data** restores the complete v3 household.

## Run and verify

```sh
node serve.ts
```

Open `http://localhost:8080`. Visit all seven routes listed above, including Insights. Reset demo data before comparing starting figures. Check the donut legend against Budgets and Insights, and compare November Reports spending with the Transactions total. On a narrow screen, the donut and insight panels stack and the comparison table scrolls horizontally.

Add or delete a transaction and confirm Dashboard, Insights, Budgets, and Reports update consistently. Try marking a bill paid, adding a bill with optional autopay, and deleting a bill; reload to check persistence. Budget edits also update the pace verdict and category rankings.

Build the entry in a temporary output directory:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/hb-v3-out node main.ts
```

This copies `app/` and the existing `screenshots/`, and writes `dossier.json`. Without `MAKEFUN_OUTPUT_DIR`, the default destination is `/output`. Building locally does not submit the entry. `vendor/makefun-frontend.ts` is unchanged.

## How to verify

1. Run `node serve.ts`, open `http://localhost:8080`, and click **Reset demo data**.
2. Visit `#/`, `#/transactions`, `#/budgets`, `#/bills`, `#/goals`, `#/reports`, and `#/insights`; each should render and highlight its navigation link.
3. Compare Dashboard's donut, Insights' November total, and Reports' total: all show **$3,834.01**. Dashboard and Insights project **$2,015.99** saved at month end; Dashboard cards round spending and saving to **$3,834 / $2,016**. Reports' November income is **$5,850**, giving the same saving.
4. Confirm October is **$3,910**, Utilities alone is **$16.29 over budget**, and both pace strips show **$127.80/day**, a **$138.00/day** allowance, and **On track**.
5. Add a **$10** November 30 transaction: all three spending totals should become **$3,844.01**, with **$2,005.99** saved. Delete it and reload to confirm persistence and restored totals. Check the donut and Insights layout on a narrow screen.

## Screenshots

The existing screenshots show the original site and predate the v3 additions:

1. `screenshots/1-dashboard.png` — dashboard, 1280×800.
2. `screenshots/2-transactions.png` — transactions, 1280×800.
3. `screenshots/3-budget-phone.png` — budgets, 390×844.
4. `screenshots/4-reports.png` — reports, 1280×800.

---

Referral: **t2m0zqpw** · [make.fun](https://make.fun/?ref=t2m0zqpw&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
