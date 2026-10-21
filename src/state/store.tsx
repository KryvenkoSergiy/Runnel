import { createContext, use, useReducer, type ActionDispatch, type ReactNode } from 'react'
import { CLIENTS, START_BALANCES, START_HISTORY, START_RULES, type Billing, type Client } from '../content'
import { addParts, convert, split, withRule, type Currency, type Parts, type Rules } from '../domain/money'

export interface Payment extends Client { key: string }
interface HistoryEntry extends Payment { when: string }

interface State {
  /** USD cents; every look converts to `home` only for display. */
  balances: Parts
  queue: Payment[]
  history: HistoryEntry[]
  rules: Rules
  home: Currency
  billing: Billing
  /** Bumps on refill so queue keys stay unique without impure ids in the reducer. */
  round: number
}

type Action =
  | { type: 'route'; key: string }
  | { type: 'refillQueue' }
  | { type: 'setRule'; key: keyof Rules; value: number }
  | { type: 'setHome'; home: Currency }
  | { type: 'setBilling'; billing: Billing }

const HISTORY = 3
const queueFor = (round: number): Payment[] => CLIENTS.map((c) => ({ ...c, key: `${c.id}-${round}` }))

/**
 * The current round's payments in a fixed order. `gone` ones (routed, or landing right now) keep their slot
 * where a look lists the queue as rows; the first remaining one is next, the rest are `waiting` behind it.
 */
export function queueSlots(s: State, landing?: string) {
  let next = true
  return queueFor(s.round).map((p) => {
    const gone = p.key === landing || !s.queue.some((q) => q.key === p.key)
    const waiting = !gone && !next
    if (!gone) next = false
    return { p, gone, waiting }
  })
}

export const initialState: State = {
  balances: START_BALANCES,
  queue: queueFor(0),
  history: START_HISTORY.map((h, i) => {
    const c = CLIENTS.find((x) => x.id === h.client)!
    return { ...c, key: `seed-${i}`, cents: h.cents, when: h.when }
  }),
  rules: START_RULES,
  home: 'USD',
  billing: 'monthly',
  round: 0,
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'route': {
      const p = state.queue.find((q) => q.key === action.key)
      if (!p) return state
      return {
        ...state,
        balances: addParts(state.balances, split(convert(p.cents, p.currency, 'USD'), state.rules)),
        queue: state.queue.filter((q) => q !== p),
        // Only the latest three are ever shown; the hero loops forever, so the list must not grow.
        history: [{ ...p, when: 'now' }, ...state.history.map((h) => (h.when === 'now' ? { ...h, when: '1m' } : h))].slice(0, HISTORY),
      }
    }
    case 'refillQueue':
      // A new loop of the demo starts from the opening balances, so the numbers never creep upwards forever.
      return { ...state, round: state.round + 1, queue: queueFor(state.round + 1), balances: initialState.balances, history: initialState.history }
    case 'setRule':
      return { ...state, rules: withRule(state.rules, action.key, action.value) }
    case 'setHome':
      return { ...state, home: action.home }
    case 'setBilling':
      return { ...state, billing: action.billing }
  }
}

const StoreContext = createContext<[State, ActionDispatch<[Action]>] | null>(null)

/** Lives above the look loader, so switching looks never resets the data. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext value={useReducer(reducer, initialState)}>{children}</StoreContext>
}

export function useStore() {
  const store = use(StoreContext)
  if (!store) throw new Error('useStore needs <StoreProvider>')
  return store
}
