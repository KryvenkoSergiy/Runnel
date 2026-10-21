import type { CSSProperties } from 'react'
import { initials } from '../content'
import { format } from '../domain/money'
import { queueSlots, useStore, type Payment } from '../state/store'
import './ui.css'

/**
 * A hero's incoming payments, display only: the hero plays itself. The next payment shows in full,
 * `waiting` ones fold to their avatar and paid ones become grey placeholders, all by animating the same
 * element, so the row never jumps. `landing` is the payment currently in flight.
 */
export function PaymentQueue({ landing }: { landing?: string }) {
  const [s] = useStore()
  return (
    <div className="queue__chips">
      {queueSlots(s, landing).map(({ p, gone, waiting }, n) => <Chip key={p.key} payment={p} gone={gone} waiting={waiting} index={n} />)}
    </div>
  )
}

function Chip({ payment: p, gone, waiting, index }: { payment: Payment; gone: boolean; waiting: boolean; index: number }) {
  return (
    <div
      className={gone ? 'chip chip--gone' : waiting ? 'chip chip--waiting' : 'chip'}
      data-key={p.key}
      data-client={p.id}
      aria-hidden={gone || undefined}
      style={{ '--i': index } as CSSProperties}
    >
      <span className="avatar" data-client={p.id} aria-hidden="true">{initials(p.name)}</span>
      <span className="chip__body">
        <span className="chip__text">
          <span className="chip__who">{p.name}</span>
          <span className="chip__what">{p.what}</span>
        </span>
        <span className="chip__amt">{format(p.cents, p.currency)}</span>
      </span>
    </div>
  )
}
