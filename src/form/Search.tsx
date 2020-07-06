import { Form as AntForm, Select } from 'antd'
import { ValidateStatus } from 'antd/lib/form/FormItem'
import { SelectProps } from 'antd/lib/select'
import { array, either, option } from 'fp-ts'
import { Either } from 'fp-ts/lib/Either'
import { constUndefined, flow, Predicate, identity, constVoid } from 'fp-ts/lib/function'
import { Option, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as React from 'react'
import { debounceTime, switchMap, startWith } from 'rxjs/operators'
import {ReplaySubject, NEVER, concat, MonoTypeOperatorFunction, of, using, Unsubscribable, ObservableInput, Observable, from}from 'rxjs'
import { Form } from './Form'
import { ExtraFormItemProps } from './types'
import { Validator } from './Validator'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { flipC } from '../function'
import { useState, useRef, useCallback, useEffect } from 'react'
import { resourceSuccess, resourceNothing, resourceError, resourceWaiting } from '../resource-state'
import { obsEither } from '../observable-either'


interface OptionType {
  label: React.ReactNode
  value: React.ReactText
}

const flippedFindFirst: <A>(a: A[]) => (a: Predicate<A>) => option.Option<A> = flipC(
  array.findFirst
) as any

interface ExtraSelectProps
  extends Omit<
    SelectProps<never>,
    | 'value'
    | 'options'
    | 'onChange'
    | 'onSelect'
    | 'onDeselect'
    | 'showSearch'
    | 'showArrow'
    | 'filterOption'
    | 'loading'
    | 'onSearch'
  > {}

export const search = <R, E, A>(ra: ReaderTaskEither<R, E, A[]>) => {
  const debounceOp = debounceTime<R | null>(400)
  return <S extends string>(
    toStringValue: (a: A) => string,
    toRequest: (searchValue: S) => R,
    toOption: (a: A) => OptionType,
    predicate: (value: string) => Predicate<A>,
    validator: Validator<string, S>,
    formItemProps: ExtraFormItemProps,
    selectProps: ExtraSelectProps,
    whenNoResults: React.ReactNode
  ): Form<Option<A>, Option<A>> => i => ({
    result: some(i),
    ui: onChange => {
      const [state, setState] = usePromiseEitherResourceWithOp(ra)(debounceOp)
      const [validateStatus, setValidateStatus] = React.useState<ValidateStatus>('')
      const [extra, setExtra] = React.useState<React.ReactNode>(null)
      const results = state._tag === 'ResourceSuccess' ? state.result : []
      const options = pipe(results, array.map(toOption))
      return (
        <AntForm.Item {...formItemProps} validateStatus={validateStatus} extra={extra}>
          <Select
            {...selectProps}
            value={pipe(i, option.fold(constUndefined, toStringValue))}
            showSearch
            // showArrow={false}
            filterOption={false}
            loading={state._tag === 'ResourceWaiting'}
            onSearch={flow(
              validator,
              either.fold(
                messages => {
                  setValidateStatus('warning')
                  setExtra(messages)
                  setState(null)
                },
                value => {
                  setExtra(null)
                  setValidateStatus('')
                  setState(toRequest(value))
                }
              )
            )}
            notFoundContent={
              state._tag === 'ResourceSuccess' && state.result.length && whenNoResults
            }
            defaultActiveFirstOption={false}
            options={options}
            onChange={flow(predicate, flippedFindFirst(results), onChange)}
          />
        </AntForm.Item>
      )
    }
  })
}

// tslint:disable-next-line: deprecation
const fromPromise: <A>(pa: Promise<A>) => Observable<A> = from as any

const safeUsing: <T, R extends Unsubscribable>(
  resourceFactory: () => R,
  observableFactory: (resource: R) => ObservableInput<T>
) => Observable<T> = using as any

const usePromiseEitherResourceWithOp = <P, E, A>(
  ra: ReaderTaskEither<P, E, A>
) => (op: MonoTypeOperatorFunction<P | null>) => {
  const [state, setState] = useState(resourceNothing<P, E, A>())
  const bracket = (a: P) =>
    safeUsing(
      () => ({ resource: ra(a)(), unsubscribe: constVoid }),
      ({ resource }) => concat(fromPromise(resource), NEVER)
    )
  const subjectA = useRef(new ReplaySubject<P | null>(1))
  const setA = useCallback((a: P | null) => {
    subjectA.current.next(a)
  }, [])

  useEffect(() => {
    const sub = subjectA.current
      .pipe(
        op,
        switchMap(
          flow(params =>
            params === null
              ? of(resourceNothing())
              : pipe(
                  bracket(params),
                  obsEither.foldW(resourceError(params), resourceSuccess(params)),
                  startWith(resourceWaiting(params)())
                )
          )
        )
      )
      .subscribe(setState)
    return () => sub.unsubscribe()
  }, [])
  return [state, setA] as const
}

export const usePromiseEitherResource = <P, E, A>(ra: ReaderTaskEither<P, E, A>) =>
  usePromiseEitherResourceWithOp(ra)(identity)

