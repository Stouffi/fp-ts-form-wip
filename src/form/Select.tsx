import { Form as AntForm, Select } from 'antd'
import { LabeledValue, SelectProps } from 'antd/lib/select'
import { array } from 'fp-ts'
import { constUndefined, flow } from 'fp-ts/lib/function'
import { fold, Option, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as React from 'react'
import { Form } from './Form'
import { ExtraFormItemProps } from './types'

interface Labeled<A> {
  label: React.ReactNode
  value: A
}
type SelectSingleValue = LabeledValue | string | number

interface ExtraSelectProps
  extends Omit<
    SelectProps<never>,
    'value' | 'options' | 'onChange' | 'onSelect' | 'onDeselect' | 'loading'
  > {}

const toPrimitive = (v: SelectSingleValue): string | number =>
  typeof v === 'string' || typeof v === 'number' ? v : v.value

export const selectFormItem = <A extends any>(
  values: Labeled<A>[],
  toSelectValue: (a: A) => SelectSingleValue,
  fromSelectValue: (v: SelectSingleValue) => Option<A>,
  selectProps: ExtraSelectProps,
  formItemProps: ExtraFormItemProps
): Form<Option<A>, Option<A>> => i => ({
  result: some(i),
  ui: onChange => (
    <AntForm.Item {...formItemProps}>
      <Select
        {...selectProps}
        value={pipe(i, fold(constUndefined, toSelectValue))}
        options={pipe(
          values,
          array.map(({ label, value }) => ({ label, value: toPrimitive(toSelectValue(value)) }))
        )}
        onChange={flow(fromSelectValue, onChange)}
      />
    </AntForm.Item>
  )
})
