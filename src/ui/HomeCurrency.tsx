import { CURRENCIES } from '../domain/money'
import { useStore } from '../state/store'
import { Segmented } from './Segmented'

const OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }))

/** The home-currency switch; every amount on the page follows it. */
export function HomeCurrency() {
  const [s, dispatch] = useStore()
  return <Segmented label="Home currency" options={OPTIONS} value={s.home} onChange={(home) => dispatch({ type: 'setHome', home })} />
}
