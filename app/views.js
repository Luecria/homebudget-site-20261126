// Pure HTML renderers: the browser controller supplies state and handles actions.
import { PREV_MONTH_BY_CAT } from './data.js';
const escape = value => String(value).replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`);
export const money = value => '$' + Number(value).toLocaleString('en-US', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
export const money0 = value => '$' + Math.round(Number(value)).toLocaleString('en-US');
const join = (items, render) => items.map(render).join('');
const spendingCategories = state => state.categories.filter(category => category.id !== 'savings');
const categoryFor = (state, id) => state.categories.find(category => category.id === id);
const categoryName = (state, id) => categoryFor(state, id)?.name ?? id;
const categoryColor = (state, id) => categoryFor(state, id)?.color ?? '#666';
const goalPercent = goal => Math.round(goal.saved / goal.target * 100);

export function totals(state) {
  const income = state.income.reduce((sum, item) => sum + item.amount, 0);
  const spent = state.transactions.reduce((sum, item) => sum + item.amount, 0);
  const byCat = {};
  state.transactions.forEach(item => {
    byCat[item.category] = (byCat[item.category] || 0) + item.amount;
  });
  return { income, spent, saved: income - spent, byCat };
}

export function spendingPace(state) {
  const summary = totals(state);
  const dates = state.transactions.map(item => item.date)
    .filter(date => /^2026-11-(0[1-9]|[12]\d|30)$/.test(date)).sort();
  // Count from November 1 through the latest entry, including quiet days.
  const days = dates.length ? Number(dates.at(-1).slice(-2)) : 0;
  const budget = spendingCategories(state).reduce((sum, category) => sum + category.budget, 0);
  const daily = days ? summary.spent / days : 0;
  const projected = daily * 30;
  return { days, budget, daily, dailyBudget: budget / 30, projected,
    saving: summary.income - projected, onTrack: projected <= budget };
}

function paceStrip(state) {
  const pace = spendingPace(state);
  return `<section class="panel pace-strip" aria-label="Spending pace">
<div><h2>Spending pace</h2><span class="pace-verdict ${pace.onTrack ? 'positive' : 'negative'}">${pace.onTrack ? 'On track' : 'Over pace'}</span>
<p class="muted">${pace.days ? `Nov 1–${pace.days} · ${pace.days} days covered` : 'No November transactions yet'}. Projection uses the daily average × 30 days.</p></div>
<dl class="pace-metrics"><div><dt>Daily average</dt><dd>${money(pace.daily)}</dd></div>
<div><dt>Daily budget pace</dt><dd>${money(pace.dailyBudget)}</dd></div>
<div><dt>Projected month-end spend</dt><dd>${money(pace.projected)}</dd></div>
<div><dt>Projected month-end saving</dt><dd>${money(pace.saving)}</dd></div></dl>
</section>`;
}

function spendingDonut(state, summary) {
  let end = 0;
  const categories = spendingCategories(state);
  const stops = categories.map(category => {
    const start = end;
    end += summary.spent ? (summary.byCat[category.id] || 0) / summary.spent * 100 : 0;
    return `${category.color} ${start}% ${end}%`;
  });
  return `<figure class="spending-donut"><div class="donut" role="img" aria-label="November spending by category; amounts and percentages in the legend" style="background:conic-gradient(${summary.spent ? stops.join(',') : '#eee 0% 100%'})">
<div class="donut-center"><strong>${money(summary.spent)}</strong><span>Total spent</span></div></div>
<figcaption><ul class="donut-legend">${join(categories, category => `<li><span class="dot" style="background:${category.color}"></span><span>${escape(category.name)}</span><strong>${money(summary.byCat[category.id] || 0)}</strong><span>${summary.spent ? ((summary.byCat[category.id] || 0) / summary.spent * 100).toFixed(1) : '0.0'}%</span></li>`)}</ul></figcaption></figure>`;
}

function progressBar(spent, budget, color) {
  const percent = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
  const over = spent > budget;
  return `<div class="bar"><div class="bar-fill${over ? ' over' : ''}" style="width:${percent}%;background:${over ? '#dc2626' : color}"></div></div>
<div class="bar-label"><span>${money(spent)} of ${money(budget)}</span><span>${percent}%${over ? ' — over budget' : ''}</span></div>`;
}

function goalHeading(goal) {
  return `<div class="goal-head"><strong>${escape(goal.name)}</strong><span>${money0(goal.saved)} of ${money0(goal.target)} · ${goalPercent(goal)}%</span></div>`;
}
function goalBar(goal) {
  return `<div class="bar"><div class="bar-fill" style="width:${goalPercent(goal)}%;background:#0d9488"></div></div>`;
}
function categoryRow(category, amount) {
  return `<div class="cat-row"><span class="dot" style="background:${category.color}"></span><span class="cat-name">${escape(category.name)}</span><span class="cat-amt">${amount}</span></div>`;
}
function categoryOptions(categories, selected) {
  return join(categories, category => `<option value="${category.id}"${selected === category.id ? ' selected' : ''}>${escape(category.name)}</option>`);
}

export function dashboard(state) {
  const summary = totals(state);
  const recent = [...state.transactions].sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 6);
  const top = spendingCategories(state)
    .map(category => ({ ...category, spent: summary.byCat[category.id] || 0 }))
    .sort((a, b) => b.spent - a.spent).slice(0, 5);
  const bills = [...state.bills].sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 4);
  const cards = [
    ['Income', money0(summary.income), '2 sources this month', ''],
    ['Spent', money0(summary.spent), `${state.transactions.length} transactions`, ''],
    ['Saved', money0(summary.saved), `${Math.round(summary.saved / summary.income * 100)}% of income`, ' good'],
    ['Left to spend', money0(summary.income - summary.spent), 'until 30 November', ''],
  ];
  return `<h1>November 2026</h1>
<p class="lede">${escape(state.household.name)} — 4 people · all figures in USD, computed from your transactions.</p>
<section class="cards">${join(cards, ([label, value, note, modifier]) => `<div class="card${modifier}"><span class="card-label">${label}</span><strong class="card-value">${value}</strong><span class="card-note">${note}</span></div>`)}</section>
${paceStrip(state)}
<div class="grid2">
<section class="panel"><h2>Where the money went</h2>
${join(top, category => categoryRow(category, money(category.spent)) + progressBar(category.spent, category.budget, category.color))}
<p><a href="#/budgets">See all budgets &rarr;</a></p></section>
<section class="panel"><h2>Spending by category</h2>${spendingDonut(state, summary)}
<p><a href="#/insights">Explore insights &rarr;</a></p></section></div>
<div class="grid2">
<section class="panel"><h2>Recent transactions</h2>
<ul class="tx-list">${join(recent, item => `<li><span class="tx-desc">${escape(item.desc)}</span><span class="tx-meta">${escape(item.date)} · ${escape(categoryName(state, item.category))}</span><span class="tx-amt">−${money(item.amount)}</span></li>`)}</ul>
<p><a href="#/transactions">All transactions &rarr;</a></p>
</section><section class="panel">
<h2>Upcoming bills</h2>
<ul class="tx-list">${join(bills, bill => `<li><span class="tx-desc">${escape(bill.name)}</span><span class="tx-meta">due ${escape(bill.due)}${bill.autopay ? ' · autopay' : ''}</span><span class="tx-amt">${money(bill.amount)}</span></li>`)}</ul>
<p><a href="#/bills">Manage bills &rarr;</a></p>
</section></div>
<section class="panel"><h2>Savings goals</h2>
<div class="goals">${join(state.goals, goal => `<div class="goal">${goalHeading(goal)}${goalBar(goal)}<p class="muted">${escape(goal.note)}</p></div>`)}</div>
<p><a href="#/goals">Manage goals &rarr;</a></p></section>`;
}

export function transactions(state, filter) {
  const categories = spendingCategories(state);
  let visible = [...state.transactions].sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  if (filter.cat) visible = visible.filter(item => item.category === filter.cat);
  if (filter.q) visible = visible.filter(item => item.desc.toLowerCase().includes(filter.q.toLowerCase()));
  const sum = visible.reduce((total, item) => total + item.amount, 0);
  const rows = join(visible, item => `<tr><td>${escape(item.date)}</td><td>${escape(item.desc)}</td><td><span class="dot" style="background:${categoryColor(state, item.category)}"></span> ${escape(categoryName(state, item.category))}</td><td class="num">−${money(item.amount)}</td><td><button type="button" class="del" data-action="del-tx" data-id="${item.id}" aria-label="Delete ${escape(item.desc)}">Delete</button></td></tr>`);
  return `<h1>Transactions</h1>
<p class="lede">${visible.length} transactions · ${money(sum)} shown.</p>
<form class="filters" id="tx-filter">
<label>Category <select name="cat"><option value="">All categories</option>${categoryOptions(categories, filter.cat)}</select></label>
<label>Search <input name="q" type="search" value="${escape(filter.q || '')}" placeholder="e.g. Shell"></label>
<button type="submit">Filter</button>
<a class="btn-link" href="#/transactions">Clear</a>
</form>
<table class="tx-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
<tbody>${rows || '<tr><td colspan="5">No transactions match this filter.</td></tr>'}</tbody></table>
<h2>Add a transaction</h2>
<form id="tx-add" class="form-grid">
<label>Description <input name="desc" required maxlength="80" placeholder="e.g. Weekly shop"></label>
<label>Amount (USD) <input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
<label>Category <select name="category">${categoryOptions(categories)}</select></label>
<label>Date <input name="date" type="date" value="2026-11-30" required></label>
<button type="submit">Add transaction</button>
</form>`;
}

export function bills(state) {
  const unpaid = state.bills.filter(bill => !bill.paid).length;
  const total = state.bills.reduce((sum, bill) => sum + (!bill.paid ? Number(bill.amount) : 0), 0);
  const autopay = state.bills.filter(bill => bill.autopay).length;
  const sorted = [...state.bills].sort((a, b) => a.due.localeCompare(b.due));
  const rows = join(sorted, bill => {
    const paid = Boolean(bill.paid);
    return `<tr><td>${escape(bill.name)}</td><td>${escape(bill.due)}</td><td class="num">${money(bill.amount)}</td><td>${bill.autopay ? 'Yes' : 'No'}</td><td>${paid ? 'Paid' : 'Unpaid'}</td><td><button type="button" data-action="bill-toggle" data-id="${escape(bill.id)}">Mark ${paid ? 'unpaid' : 'paid'}</button> <button type="button" class="del" data-action="bill-del" data-id="${escape(bill.id)}" aria-label="Delete ${escape(bill.name)}">Delete</button></td></tr>`;
  });
  return `<h1>Bills — December 2026</h1>
<p class="lede">${money(total)} total due this month · ${unpaid} unpaid · ${autopay} on autopay.</p>
<table class="tx-table"><thead><tr><th>Bill</th><th>Due date</th><th class="num">Amount</th><th>Autopay</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6">No bills yet. Add one below.</td></tr>'}</tbody></table>
<h2>Add a bill</h2>
<form id="bill-add" class="form-grid">
<label>Bill name <input name="name" required maxlength="80" placeholder="e.g. Water bill"></label>
<label>Amount (USD) <input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
<label>Due date <input name="due" type="date" value="2026-12-01" required></label>
<label class="check-field"><input name="autopay" type="checkbox"> Autopay</label>
<button type="submit">Add bill</button>
</form>`;
}

export function budgets(state) {
  const summary = totals(state);
  const categories = spendingCategories(state);
  const over = categories.filter(category => (summary.byCat[category.id] || 0) > category.budget);
  const status = over.length
    ? `${over.length} ${over.length === 1 ? 'category is' : 'categories are'} over budget: ${over.map(category => escape(category.name)).join(', ')}.`
    : 'All categories are within budget.';
  return `<h1>Budgets — November 2026</h1>
<p class="lede">Monthly limits per category. ${status}</p>
${join(categories, category => {
    const spent = summary.byCat[category.id] || 0;
    const left = category.budget - spent;
    return `<section class="panel budget-row"><div class="budget-head"><strong>${escape(category.name)}</strong><span>${money(spent)} of ${money(category.budget)} · ${left < 0 ? `${money(-left)} over budget` : `${money(left)} left`}</span></div>
${progressBar(spent, category.budget, category.color)}
<form class="budget-edit" data-cat="${category.id}"><label>Monthly budget <input name="budget" type="number" min="0" step="1" value="${category.budget}" aria-label="Monthly budget for ${escape(category.name)}"></label> <button type="submit">Save</button></form></section>`;
  })}
<section class="panel"><h2>Savings target</h2><p>This month's savings target is <strong>${money(categoryFor(state, 'savings').budget)}</strong>. So far the household has saved <strong>${money0(summary.saved)}</strong> — ${summary.saved >= categoryFor(state, 'savings').budget ? 'meeting target' : 'below target'}.</p></section>`;
}

export function goals(state) {
  return `<h1>Savings goals</h1>
<p class="lede">Three goals, tracked against real balances. Add money or start a new goal.</p>
<div class="goals">${join(state.goals, goal => `<section class="panel goal">${goalHeading(goal)}
${goalBar(goal)}
<p class="muted">${escape(goal.note)} · ${money0(goal.target - goal.saved)} to go.</p>
<div class="goal-actions"><button type="button" data-action="goal-add" data-id="${goal.id}" data-amount="50">Add $50</button><button type="button" data-action="goal-add" data-id="${goal.id}" data-amount="100">Add $100</button><button type="button" class="del" data-action="goal-del" data-id="${goal.id}">Delete goal</button></div></section>`)}</div>
<h2>Start a new goal</h2>
<form id="goal-add" class="form-grid">
<label>Goal name <input name="name" required maxlength="60" placeholder="e.g. New sofa"></label>
<label>Target (USD) <input name="target" type="number" min="1" step="1" required placeholder="1000"></label>
<label>Saved so far (USD) <input name="saved" type="number" min="0" step="1" value="0"></label>
<button type="submit">Add goal</button>
</form>`;
}

export function reports(input) {
  const current = totals(input);
  const state = { ...input, months: input.months.map(month => month.month === 'Nov 2026'
    ? { ...month, income: current.income, spent: current.spent } : month) };
  const summary = totals(state);
  const maximum = Math.max(...state.months.map(month => Math.max(month.income, month.spent)));
  const categories = spendingCategories(state)
    .map(category => ({ ...category, spent: summary.byCat[category.id] || 0 }))
    .sort((a, b) => b.spent - a.spent);
  const average = state.months.reduce((sum, month) => sum + (month.income - month.spent), 0) / state.months.length;
  return `<h1>Reports</h1>
<p class="lede">Six months of income and spending, and this month by category.</p>
<section class="panel"><h2>Income vs spending — last 6 months</h2>
<div class="chart">${join(state.months, month => `<div class="chart-col"><div class="chart-bars"><div class="chart-bar income" style="height:${Math.round(month.income / maximum * 140)}px" title="Income ${money0(month.income)}"></div><div class="chart-bar spent" style="height:${Math.round(month.spent / maximum * 140)}px" title="Spent ${money0(month.spent)}"></div></div><span class="chart-label">${escape(month.month)}</span><span class="chart-vals">${money0(month.income)} / ${money0(month.spent)}</span></div>`)}</div>
<p class="legend"><span class="swatch income"></span> Income &nbsp; <span class="swatch spent"></span> Spending</p>
<p>Average monthly saving over the last 6 months: <strong>${money0(average)}</strong>.</p></section>
<section class="panel"><h2>November 2026 by category</h2>
${join(categories, category => categoryRow(category, `${money(category.spent)} · ${summary.spent ? Math.round(category.spent / summary.spent * 100) : 0}%`) + progressBar(category.spent, category.budget, category.color))}
<p>Total spent: <strong>${money(summary.spent)}</strong> of <strong>${money0(summary.income)}</strong> income.</p></section>
<section class="panel"><h2>Income — November 2026</h2>
<ul class="tx-list">${join(state.income, item => `<li><span class="tx-desc">${escape(item.source)}</span><span class="tx-meta">${escape(item.date)}</span><span class="tx-amt">+${money(item.amount)}</span></li>`)}</ul></section>`;
}

export function insights(state) {
  const summary = totals(state);
  const categories = spendingCategories(state).map(category => ({ ...category,
    spent: summary.byCat[category.id] || 0, previous: PREV_MONTH_BY_CAT[category.id] || 0,
    remaining: category.budget - (summary.byCat[category.id] || 0),
  }));
  const merchants = new Map();
  state.transactions.forEach(item => {
    const merchant = merchants.get(item.desc) || { name: item.desc, amount: 0, count: 0 };
    merchant.amount += item.amount;
    merchant.count++;
    merchants.set(item.desc, merchant);
  });
  const topMerchants = [...merchants.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const biggest = [...state.transactions].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const ranked = [...categories].sort((a, b) => b.remaining - a.remaining);
  const previousTotal = categories.reduce((sum, category) => sum + category.previous, 0);
  const change = (now, previous) => {
    const delta = now - previous;
    return `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${money(Math.abs(delta))} (${previous ? `${delta > 0 ? '+' : ''}${(delta / previous * 100).toFixed(1)}%` : now ? 'new spending' : '0.0%'})`;
  };
  const budgetHighlight = (label, category) => category ? `<section class="panel"><h2>${label}</h2>
<p class="insight-value"><span class="dot" style="background:${category.color}"></span> ${escape(category.name)}</p>
<p class="${category.remaining < 0 ? 'negative' : 'positive'}">${money(Math.abs(category.remaining))} ${category.remaining < 0 ? 'over budget' : 'under budget'}</p>
${progressBar(category.spent, category.budget, category.color)}</section>` : '';
  return `<h1>Insights — November 2026</h1>
<p class="lede">${escape(state.household.name)} · a closer look at spending, pace, and budget headroom.</p>
${paceStrip(state)}
<section class="panel"><h2>Month over month · November vs October 2026</h2>
<p class="muted">November transactions compared with October's full month. Positive changes mean more spending.</p>
<div class="insights-table-wrap"><table class="tx-table insights-table"><thead><tr><th>Category</th><th class="num">October</th><th class="num">November</th><th class="num">Change</th></tr></thead>
<tbody>${join(categories, category => `<tr><td><span class="dot" style="background:${category.color}"></span> ${escape(category.name)}</td><td class="num">${money(category.previous)}</td><td class="num">${money(category.spent)}</td><td class="num">${change(category.spent, category.previous)}</td></tr>`)}</tbody>
<tfoot><tr><th>Total</th><td class="num">${money(previousTotal)}</td><td class="num">${money(summary.spent)}</td><td class="num">${change(summary.spent, previousTotal)}</td></tr></tfoot></table></div></section>
<div class="grid2"><section class="panel"><h2>Top 5 merchants by total spend</h2>
<p class="muted">Repeated transaction descriptions are grouped as one merchant or payee, including rent and bills.</p>
<ol class="insight-list">${join(topMerchants, merchant => `<li><div><strong>${escape(merchant.name)}</strong><span class="muted">${merchant.count} ${merchant.count === 1 ? 'transaction' : 'transactions'}</span></div><span>${money(merchant.amount)}</span></li>`) || '<li>No spending yet.</li>'}</ol></section>
<section class="panel"><h2>Top 3 biggest single expenses</h2>
<ol class="insight-list">${join(biggest, item => `<li><div><strong>${escape(item.desc)}</strong><span class="muted">${escape(item.date)} · ${escape(categoryName(state, item.category))}</span></div><span>${money(item.amount)}</span></li>`) || '<li>No expenses yet.</li>'}</ol></section></div>
<p class="muted">Best and worst categories are ranked by dollars remaining against their monthly budgets. Savings is excluded from spending comparisons.</p>
<div class="grid2">${budgetHighlight('Best category vs budget', ranked[0])}${budgetHighlight('Worst category vs budget', ranked.at(-1))}</div>`;
}

export function missing() {
  return '<h1>Not found</h1><p>There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>';
}
