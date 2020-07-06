import { array } from 'fp-ts'
import { constVoid, constNull } from 'fp-ts/lib/function'
import { none, some, fold } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FormState } from './Form'
import { inputString } from './spec.utils'
import { fresh, modified, validatedFromIoTs, withInputAsString } from './Validator'

const formOptions: FormState = { showErrorsAfterSubmit: false, submitted: false }

const vIoTs = validatedFromIoTs((err, ui) => (
  <>
    {ui}
    {pipe(err, fold(constNull, array.mapWithIndex((i, e) => <p key={i}>{e}</p>)))}
  </>
))

const NonEmptyStringValidator = withInputAsString(NonEmptyString)

describe('Validator', () => {
  it('NonEmptyString', () => {
    const f = vIoTs(NonEmptyStringValidator)(inputString)
    expect(f(fresh(''), formOptions).result).toStrictEqual(none)
    expect(f(fresh('a'), formOptions).result).toStrictEqual(some('a'))
    expect(f(modified('a'), formOptions).result).toStrictEqual(some('a'))
    expect(
      renderToStaticMarkup(f(fresh(''), formOptions).ui(constVoid))).not.toContain(
        'NO VALIDATION MESSAGE'
      )
    expect(
      renderToStaticMarkup(f(modified(''), formOptions).ui(constVoid))).toContain(
        'NO VALIDATION MESSAGE'
      )
  })
})
