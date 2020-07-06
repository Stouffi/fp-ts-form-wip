import * as A from 'fp-ts/lib/Array'
import { flow } from 'fp-ts/lib/function'
import { option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { indexArray } from 'monocle-ts/lib/Index/Array'
import * as React from 'react'
import { Form } from './Form'
import { flipC } from '../function'

export const array = <I extends any>(
  addUI: (add: (i: I) => void, ui: React.ReactElement) => React.ReactElement,
  removeUI: (remove: () => void, ui: React.ReactElement) => React.ReactElement
) => <A extends any>(f: Form<I, A>): Form<I[], A[]> => (is, s) => {
  const atIndex = indexArray<I>()
  const atIndexSet = (index: number) => flipC(atIndex.index(index).set)
  const atIS = flipC(atIndexSet)(is)
  const result = pipe(
    is,
    A.map(input => f(input, s).result),
    A.array.sequence(option)
  )
  return {
    result,
    ui: onChange =>
      addUI(
        i => onChange(A.snoc(is, i)),
        <>
          {pipe(
            is,
            A.mapWithIndex((index, input) => {
              const { ui } = f(input, s)
              return removeUI(
                () => onChange(A.unsafeDeleteAt(index, is)),
                ui(flow(atIS(index), onChange))
              )
            })
          )}
        </>
      )
  }
}
