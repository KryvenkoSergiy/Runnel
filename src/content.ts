import type { Currency, DatedPayment, Parts, Rules } from './domain/money'

// Shared copy and demo data for every look. Clients, prices and rates are made up.

export interface Client { id: string; name: string; what: string; cents: number; currency: Currency }

export const CLIENTS: readonly Client[] = [
  { id: 'halden', name: 'Halden Studio', what: 'Brand system', cents: 240000, currency: 'USD' },
  { id: 'okapi', name: 'Okapi Motion', what: 'Title sequence', cents: 185000, currency: 'EUR' },
  { id: 'linden', name: 'Linden & Vale', what: 'Retainer · Oct', cents: 90000, currency: 'GBP' },
  { id: 'moro', name: 'Moro Type', what: 'Type licensing', cents: 3800000, currency: 'UAH' },
]

export const initials = (name: string) =>
  name.split(/\s+/).filter((w) => /\w/.test(w)).map((w) => w[0]).slice(0, 2).join('')

export const START_RULES: Rules = { taxes: 25, savings: 15 }
export const START_BALANCES: Parts = { taxes: 184000, savings: 296000, spendable: 412000 }

interface SeedHistory { client: string; cents: number; when: string }
// Three rows from the start so the hero card never grows when the first payment arrives.
export const START_HISTORY: readonly SeedHistory[] = [
  { client: 'linden', cents: 120000, when: '2d' },
  { client: 'halden', cents: 180000, when: '6d' },
  { client: 'okapi', cents: 95000, when: '9d' },
]

/** The USD amount the Rules section uses for its worked example. */
export const EXAMPLE_CENTS = 240000

export interface MonthPayment extends DatedPayment { client: string; what: string }
export const MONTH_PAYMENTS: readonly MonthPayment[] = [
  { day: 3, client: 'halden', what: 'Brand system', cents: 240000, currency: 'USD' },
  { day: 8, client: 'okapi', what: 'Title sequence', cents: 185000, currency: 'EUR' },
  { day: 15, client: 'linden', what: 'Retainer · Oct', cents: 90000, currency: 'GBP' },
  { day: 21, client: 'moro', what: 'Type licensing', cents: 3800000, currency: 'UAH' },
  { day: 27, client: 'halden', what: 'Brand system, phase 2', cents: 160000, currency: 'USD' },
]

export const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id

export type Billing = 'monthly' | 'yearly'

interface Plan { id: string; name: string; price: Record<Billing, number>; features: string[]; popular?: boolean }
/** Whole US dollars per month. */
export const PLANS: readonly Plan[] = [
  { id: 'solo', name: 'Solo', price: { monthly: 0, yearly: 0 }, features: ['One home currency', 'Three envelopes', 'Up to 10 payments a month'] },
  { id: 'pro', name: 'Pro', price: { monthly: 12, yearly: 9 }, features: ['Any currency in, one out', 'Unlimited envelopes and rules', 'Quarterly tax reminders'], popular: true },
  { id: 'studio', name: 'Studio', price: { monthly: 29, yearly: 23 }, features: ['Everything in Pro', 'Up to 5 people', 'Per-client rules'] },
]
export const YEARLY_SAVING = '−20%'

export const FAQ: readonly { q: string; a: string }[] = [
  { q: 'Does Runnel calculate my taxes?', a: 'No. You pick a percentage that feels right for you, and Runnel sets it aside every time. It is a habit, not tax advice — check the number with an accountant.' },
  { q: 'Where does the money actually sit?', a: 'Runnel is a fictional product, so nowhere. In a real version, envelopes would be sub-accounts at a partner bank.' },
  { q: 'Which currencies are supported?', a: 'This demo knows USD, EUR, GBP and UAH with fixed example rates. Switch the home currency anywhere on the page and every number follows.' },
  { q: 'Can I change the rules later?', a: 'Any time. New rules apply to the next payment; money already sorted stays where it is.' },
]

/** Headings are [plain, emphasised] so each look can style the second half its own way. */
export const COPY = {
  hero: { eyebrow: 'Money for freelancers', lede: 'Runnel splits each client payment into Taxes, Savings and Spendable the moment it lands — in any currency, by rules you set once.', cta: 'Join the waitlist', secondary: 'See the rules', incoming: 'Incoming', slot: 'Next payment lands here', total: 'Total balance', recent: 'Recent' },
  rules: { label: 'Rules', title: ['Set it once.', 'Skip the spreadsheet.'], sub: 'Choose what goes to taxes and savings. Whatever is left is yours to spend — no mental math after every invoice.', fine: 'Example percentages. Not tax advice.' },
  currencies: { label: 'Currencies', title: ['Paid in four currencies.', 'Counted in one.'], fine: 'Demo rates, fixed — not live market data.' },
  month: { label: 'A month with Runnel', quiet: 'A quiet start. Invoices are out.', sorted: 'Sorted in under a second.', ready: 'Taxes ready for the quarter' },
  pricing: { label: 'Pricing', title: ['Less than', 'one late fee.'] },
  faq: { label: 'FAQ', title: ['Questions,', 'answered.'] },
  waitlist: { label: 'Waitlist', title: ['Get paid.', 'Stay sorted.'], sub: 'Be first to try Runnel when it opens.', fine: 'Demo only — nothing is sent or stored.', error: 'Enter an email like you@studio.com', success: "You're on the list." },
  footer: ['Runnel is a fictional product · a design demo', 'Prices, rates and clients are made up.'],
} as const

export const ENVELOPE_LABEL = { taxes: 'Taxes', savings: 'Savings', spendable: 'Spendable' } as const

export type SectionId = 'hero' | 'rules' | 'currencies' | 'month' | 'pricing' | 'faq' | 'waitlist'

/** "How it's built" notes true for every look; each look adds its own for what it draws itself (themes/<id>/index.tsx). */
export const BUILT: Record<SectionId, string> = {
  hero: 'Each look is a lazy chunk with CSS scoped to html[data-look], so all four share one page and one store. The hero plays itself: a small hook routes the next payment whenever the look is idle and on screen, and loops the same four forever. Money is integer cents: taxes and savings round down, the remainder goes to spendable, so the parts always add up.',
  rules: 'One useReducer store sits above the look loader. Move a slider here, switch the look, and the new design shows the same rules and balances.',
  currencies: 'Fixed demo rates, one rounding step per conversion. Every number on the page re-derives from the store when the home currency changes.',
  month: 'Scroll progress through a tall sticky section picks a day from a pure simulateMonth(). With reduced motion it renders four still frames instead.',
  pricing: 'RollingNumber: every digit is a 0–9 column moved by one CSS transform, staggered 25 ms. Screen readers get the plain value.',
  faq: 'Native <details>. The height animates with interpolate-size and ::details-content, no JavaScript.',
  waitlist: 'Checked on submit, the error is tied to the field with aria-describedby, the shake is one WAAPI call. Nothing leaves the page.',
}
