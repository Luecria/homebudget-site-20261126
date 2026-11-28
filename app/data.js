// November 2026 demo household. Monetary amounts are expressed in USD.
// The tables below are the shared source for every route and calculation.
export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  month: 'November 2026',
  members: 4,
  currency: 'USD',
};

export const CATEGORIES = [
  ['housing', 'Housing', 1650, '#2563eb'],
  ['groceries', 'Groceries', 720, '#16a34a'],
  ['transport', 'Transport', 380, '#d97706'],
  ['utilities', 'Utilities', 290, '#0891b2'],
  ['dining', 'Dining out', 240, '#db2777'],
  ['entertainment', 'Entertainment', 150, '#7c3aed'],
  ['health', 'Health', 220, '#dc2626'],
  ['kids', 'Kids', 310, '#65a30d'],
  ['shopping', 'Shopping', 180, '#4f46e5'],
  ['savings', 'Savings', 900, '#0d9488'],
].map(([id, name, budget, color]) => ({ id, name, budget, color }));

export const INCOME = [
  ['inc-1', '2026-11-01', 'Salary — Maya Alvarez', 4850],
  ['inc-2', '2026-11-15', 'Freelance design — Daniel Alvarez', 1000],
].map(([id, date, source, amount]) => ({ id, date, source, amount }));

export const TRANSACTIONS = [
  ['t-01', '2026-11-01', 'Monthly rent', 'housing', 1650.00],
  ['t-02', '2026-11-02', 'Whole Foods Market', 'groceries', 142.30],
  ['t-03', '2026-11-03', 'Shell — fuel', 'transport', 48.20],
  ['t-04', '2026-11-04', 'Electric bill — City Power', 'utilities', 112.40],
  ['t-05', '2026-11-05', "Luigi's Pizzeria", 'dining', 34.50],
  ['t-06', '2026-11-06', "Trader Joe's", 'groceries', 96.45],
  ['t-07', '2026-11-07', 'Metro monthly pass', 'transport', 96.00],
  ['t-08', '2026-11-08', 'CVS Pharmacy', 'health', 42.30],
  ['t-09', '2026-11-09', 'Movie night — Regal Cinemas', 'entertainment', 28.00],
  ['t-10', '2026-11-10', 'Safeway', 'groceries', 128.90],
  ['t-11', '2026-11-11', 'Water bill — City Water', 'utilities', 48.90],
  ['t-12', '2026-11-12', 'Sushi House', 'dining', 42.10],
  ['t-13', '2026-11-13', 'School supplies — Target', 'kids', 68.40],
  ['t-14', '2026-11-14', 'Shell — fuel', 'transport', 52.10],
  ['t-15', '2026-11-15', 'Streaming — Netflix + Spotify', 'entertainment', 15.99],
  ['t-16', '2026-11-16', 'Internet — FiberNet', 'utilities', 79.99],
  ['t-17', '2026-11-17', 'Gym membership — FitLife', 'health', 39.00],
  ['t-18', '2026-11-18', 'Whole Foods Market', 'groceries', 154.60],
  ['t-19', '2026-11-19', 'Soccer club fees — Leo', 'kids', 75.00],
  ['t-20', '2026-11-20', 'Concert tickets — The Lumineers', 'entertainment', 85.00],
  ['t-21', '2026-11-21', 'Phone bill — T-Mobile', 'utilities', 65.00],
  ['t-22', '2026-11-22', "Trader Joe's", 'groceries', 76.35],
  ['t-23', '2026-11-23', 'Dentist — Dr. Patel', 'health', 120.00],
  ['t-24', '2026-11-24', "Kids' books — Bookshop", 'kids', 45.20],
  ['t-25', '2026-11-25', 'Safeway', 'groceries', 110.15],
  ['t-26', '2026-11-25', 'Parking — downtown garage', 'transport', 18.00],
  ['t-27', '2026-11-26', 'Clothes — H&M', 'shopping', 89.99],
  ['t-28', '2026-11-26', 'Shell — fuel', 'transport', 44.75],
  ['t-29', '2026-11-26', 'Household goods — Target', 'shopping', 54.20],
].map(([id, date, desc, category, amount]) => ({ id, date, desc, category, amount }));

export const BILLS = [
  ['b-1', 'Rent', '2026-12-01', 1650.00, true],
  ['b-2', 'Electric — City Power', '2026-12-05', 112.00, true],
  ['b-3', 'Internet — FiberNet', '2026-12-08', 79.99, true],
  ['b-4', 'Car insurance — Geico', '2026-12-12', 145.00, false],
  ['b-5', 'Gym — FitLife', '2026-12-15', 39.00, true],
  ['b-6', 'Phone — T-Mobile', '2026-12-20', 65.00, true],
].map(([id, name, due, amount, autopay]) => ({ id, name, due, amount, autopay, paid: false }));

export const GOALS = [
  ['g-1', 'Emergency fund', 12000, 8400, '6 months of expenses'],
  ['g-2', 'Family vacation — Bali', 2500, 1150, 'Flights + hotel, July 2027'],
  ['g-3', 'New car', 8000, 2300, 'Down payment'],
].map(([id, name, target, saved, note]) => ({ id, name, target, saved, note }));

export const MONTHS = [
  ['Jun 2026', 5750, 3720],
  ['Jul 2026', 5850, 3980],
  ['Aug 2026', 5750, 3610],
  ['Sep 2026', 5950, 3840],
  ['Oct 2026', 5850, 3910],
  ['Nov 2026', 5850, 3663.77],
].map(([month, income, spent]) => ({ month, income, spent }));
