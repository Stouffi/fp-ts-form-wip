import { flow } from 'fp-ts/lib/function'
import { Lens } from 'monocle-ts'
import { Form } from './Form'
import { flipC } from '../function'

export const focus = <I, J>(l: Lens<I, J>) => <A>(f: Form<J, A>): Form<I, A> => (i, o) => {
  const { ui, result } = f(l.get(i), o)
  return { result, ui: onChange => ui(flow(flipC(l.set)(i), onChange)) }
}
