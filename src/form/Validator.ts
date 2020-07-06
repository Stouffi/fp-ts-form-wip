import { array, either, option } from 'fp-ts'
import { Either, mapLeft, right } from 'fp-ts/lib/Either'
import { flow, identity } from 'fp-ts/lib/function'
import { fromEither, Option, some } from 'fp-ts/lib/Option'
import * as t from 'io-ts'
import { Form, FormState } from './Form'
import { renderError } from './render-error'
import { constNone } from '../function'

export interface Validator<I, A> {
  (input: I): Either<string[], A>
}

export interface Validated<A> {
  value: A
  modified: boolean
}

export const modified = <A>(value: A): Validated<A> => ({ value, modified: true })
export const fresh = <A>(value: A): Validated<A> => ({ value, modified: false })

const shouldShowErrors = <I>(i: Validated<I>, s: FormState) =>
  s.submitted || (i.modified && !s.showErrorsAfterSubmit)

export const validated = (
  renderError: (err: Option<string[]>, ui: React.ReactElement) => React.ReactElement
) => <I, B>(validator: Validator<I, B>) => <A>(f: Form<I, A>): Form<Validated<I>, B> => (i, s) => {
  const { ui } = f(i.value, s)
  const err = shouldShowErrors(i, s) ? some(validator(i.value)) : forFresh(validator(i.value))
  return {
    result: toResult(err),
    ui: onChange => renderError(toOptionError(err), ui(flow(modified, onChange)))
  }
}

const forFresh = flow(fromEither, option.map(right))

const toResult = option.chain(fromEither)

const toOptionError: <A, B>(
  ma: option.Option<either.Either<A, B>>
) => option.Option<A> = option.chain(either.fold(some, constNone))

const messageFromValidationError = (e: t.ValidationError) => e.message || 'NO VALIDATION MESSAGE'

const mapLeftDecode = mapLeft(array.map(messageFromValidationError))

export const fromIoTs = <A, O, I>(type: t.Type<A, O, I>): Validator<I, A> =>
  flow(type.asDecoder().decode, mapLeftDecode)

export const validatedFromIoTs = (
  renderError: (err: Option<string[]>, ui: React.ReactElement) => React.ReactElement
) => <I, B, O>(v: t.Type<B, O, I>): (<A>(f: Form<I, A>) => Form<Validated<I>, B>) =>
  validated(renderError)(fromIoTs(v))

export const withInputAs: <I>() => <C extends t.Any>(c: C) => t.Type<C['_A'], C['_O'], I> = () =>
  identity

export const withInputAsString = withInputAs<string>()
export const withInputAsNumber = withInputAs<number>()
export const withInputAsBoolean = withInputAs<boolean>()
export const validatedType = <C extends t.Any>(c: C): t.Type<Validated<C['_A']>> =>
  t.type({ modified: t.boolean, value: c })

export const validatedFromIoTsForAntd = validatedFromIoTs(renderError)
export const validatedForAntd = validated(renderError)
