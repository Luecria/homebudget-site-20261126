// Pure HTML renderers: the browser controller supplies state and handles actions.
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
<div class="grid2">
<section class="panel"><h2>Where the money went</h2>
${join(top, category => categoryRow(category, money(category.spent)) + progressBar(category.spent, category.budget, category.color))}
<p><a href="#/budgets">See all budgets &rarr;</a></p></section>
<section class="panel"><h2>Recent transactions</h2>
<ul class="tx-list">${join(recent, item => `<li><span class="tx-desc">${escape(item.desc)}</span><span class="tx-meta">${escape(item.date)} · ${escape(categoryName(state, item.category))}</span><span class="tx-amt">−${money(item.amount)}</span></li>`)}</ul>
<p><a href="#/transactions">All transactions &rarr;</a></p>
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
<label>Date <input name="date" type="date" value="2026-11-26" required></label>
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
<section class="panel"><h2>Savings target</h2><p>This month's savings target is <strong>${money(categoryFor(state, 'savings').budget)}</strong>. So far the household has saved <strong>${money0(summary.saved)}</strong> — above target.</p></section>`;
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

export function reports(state) {
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
${join(categories, category => categoryRow(category, `${money(category.spent)} · ${Math.round(category.spent / summary.spent * 100)}%`) + progressBar(category.spent, Math.max(category.spent, category.budget), category.color))}
<p>Total spent: <strong>${money(summary.spent)}</strong> of <strong>${money0(summary.income)}</strong> income.</p></section>
<section class="panel"><h2>Income — November 2026</h2>
<ul class="tx-list">${join(state.income, item => `<li><span class="tx-desc">${escape(item.source)}</span><span class="tx-meta">${escape(item.date)}</span><span class="tx-amt">+${money(item.amount)}</span></li>`)}</ul></section>`;
}

export function missing() {
  return '<h1>Not found</h1><p>There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>';
}
