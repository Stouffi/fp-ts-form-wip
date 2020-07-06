import { option } from 'fp-ts'
import { Applicative2 } from 'fp-ts/lib/Applicative'
import { sequenceS } from 'fp-ts/lib/Apply'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import * as React from 'react'

export interface FormState {
  showErrorsAfterSubmit: boolean
  submitted: boolean
}

export interface Form<I, A> {
  (i: I, s: FormState): {
    ui: (onChange: (i: I) => void) => React.ReactElement
    result: option.Option<A>
  }
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    Form: Form<E, A>
  }
}

export const URI = 'Form'
export type URI = typeof URI

export const form: Applicative2<URI> = {
  URI,
  of: a => _input => ({ ui: _changeCb => <></>, result: option.some(a) }),
  map: (form, f) => (input, s) => {
    const formResult = form(input, s)
    return {
      ui: formResult.ui,
      result: pipe(formResult.result, option.map(f))
    }
  },
  ap: (fab, fa) => (input, s) => {
    const ab = fab(input, s)
    const a = fa(input, s)
    const result = pipe(ab.result, option.ap(a.result))
    return {
      ui: i => (
        <>
          {ab.ui(i)}
          {a.ui(i)}
        </>
      ),
      result
    }
  }
}

export const { map, ap } = pipeable(form)
export const ado = sequenceS(form)
