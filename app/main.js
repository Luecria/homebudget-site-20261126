// Hash navigation and delegated controls share a single persisted household.
import { HOUSEHOLD, CATEGORIES, INCOME, TRANSACTIONS, BILLS, GOALS, MONTHS } from './data.js';
import { dashboard, transactions, bills, budgets, goals, reports, insights, missing } from './views.js';

const STORAGE_KEY = 'homebudget-v1';
const outlet = document.getElementById('app');
const pages = {
  '': { title: 'Dashboard', view: dashboard },
  transactions: { title: 'Transactions', view: transactions },
  budgets: { title: 'Budgets', view: budgets },
  bills: { title: 'Bills', view: bills },
  goals: { title: 'Savings goals', view: goals },
  reports: { title: 'Reports', view: reports },
  insights: { title: 'Insights', view: insights },
};

function initialState() {
  return {
    version: 3,
    household: HOUSEHOLD,
    categories: structuredClone(CATEGORIES),
    income: structuredClone(INCOME),
    transactions: structuredClone(TRANSACTIONS),
    bills: structuredClone(BILLS),
    goals: structuredClone(GOALS),
    months: structuredClone(MONTHS),
  };
}

function restore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) return initialState();
    const restored = { ...initialState(), ...parsed };
    if (parsed.version !== 3) {
      // Add the fuller month once, preserving existing edits and bill status.
      for (const item of TRANSACTIONS.slice(29)) {
        if (!restored.transactions.some(transaction => transaction.id === item.id)) {
          restored.transactions.push(structuredClone(item));
        }
      }
      restored.version = 3;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      } catch {
        // Keep restored edits available even when storage is read-only.
      }
    }
    return restored;
  } catch {
    return initialState();
  }
}

let state = restore();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep in-memory editing available when browser storage cannot be written.
  }
}

function pageFromHash(hash) {
  return hash.split('?')[0].replace(/^#\/?/, '').split('/')[0] || '';
}

function render() {
  window.__shotReady = false;
  const page = pageFromHash(location.hash || '#/');
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const definition = Object.hasOwn(pages, page) ? pages[page] : { title: 'Not found', view: missing };
  const html = definition.view(state, {
    cat: params.get('cat') || '',
    q: params.get('q') || '',
  });
  document.title = `${definition.title} | HomeBudget`;
  outlet.innerHTML = html;
  document.querySelectorAll('nav a').forEach(link => {
    const destination = link.getAttribute('href').replace(/^#\/?/, '').split('/')[0];
    link.classList.toggle('active', destination === page);
  });
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function storeAndRender() {
  persist();
  render();
}

const submissions = {
  'tx-add'(form) {
    const fields = new FormData(form);
    const amount = Number(fields.get('amount'));
    if (!fields.get('desc') || !(amount > 0)) return;
    state.transactions.push({
      id: `t-${Date.now()}`,
      date: fields.get('date') || '2026-11-30',
      desc: String(fields.get('desc')).trim(),
      category: String(fields.get('category')),
      amount: Math.round(amount * 100) / 100,
    });
    persist();
    location.hash = '#/transactions';
    render();
  },
  'tx-filter'(form) {
    const fields = new FormData(form);
    const query = new URLSearchParams();
    if (fields.get('cat')) query.set('cat', fields.get('cat'));
    if (fields.get('q')) query.set('q', fields.get('q'));
    const suffix = query.toString();
    location.hash = '#/transactions' + (suffix ? `?${suffix}` : '');
    render();
  },
  'goal-add'(form) {
    const fields = new FormData(form);
    const target = Number(fields.get('target'));
    if (!fields.get('name') || !(target > 0)) return;
    state.goals.push({
      id: `g-${Date.now()}`,
      name: String(fields.get('name')).trim(),
      target,
      saved: Math.max(0, Number(fields.get('saved') || 0)),
      note: 'Added today',
    });
    storeAndRender();
  },
  'bill-add'(form) {
    const fields = new FormData(form);
    const amount = Number(fields.get('amount'));
    const name = String(fields.get('name') || '').trim();
    const due = String(fields.get('due') || '');
    if (!name || !(amount > 0) || !due) return;
    state.bills.push({
      id: `b-${Date.now()}`,
      name,
      due,
      amount: Math.round(amount * 100) / 100,
      autopay: fields.has('autopay'),
      paid: false,
    });
    storeAndRender();
  },
};

outlet.addEventListener('submit', event => {
  const form = event.target;
  if (Object.hasOwn(submissions, form.id)) {
    event.preventDefault();
    submissions[form.id](form);
    return;
  }
  if (!form.classList.contains('budget-edit')) return;
  event.preventDefault();
  const category = state.categories.find(item => item.id === form.dataset.cat);
  const value = Number(new FormData(form).get('budget'));
  if (category && value >= 0) {
    category.budget = Math.round(value);
    storeAndRender();
  }
});

const actions = {
  'del-tx'(button) {
    state.transactions = state.transactions.filter(item => item.id !== button.dataset.id);
    storeAndRender();
  },
  'goal-add'(button) {
    const goal = state.goals.find(item => item.id === button.dataset.id);
    if (!goal) return;
    goal.saved = Math.min(goal.target, goal.saved + Number(button.dataset.amount || 0));
    storeAndRender();
  },
  'goal-del'(button) {
    state.goals = state.goals.filter(item => item.id !== button.dataset.id);
    storeAndRender();
  },
  'bill-toggle'(button) {
    const bill = state.bills.find(item => item.id === button.dataset.id);
    if (!bill) return;
    bill.paid = !bill.paid;
    storeAndRender();
  },
  'bill-del'(button) {
    state.bills = state.bills.filter(item => item.id !== button.dataset.id);
    storeAndRender();
  },
};

outlet.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (button && Object.hasOwn(actions, button.dataset.action)) actions[button.dataset.action](button);
});

document.getElementById('reset-demo').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  state = initialState();
  storeAndRender();
});
window.addEventListener('hashchange', render);
render();
