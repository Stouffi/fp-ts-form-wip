import { Form as AntForm, Input } from 'antd'
import { InputProps } from 'antd/lib/input'
import { some } from 'fp-ts/lib/Option'
import * as React from 'react'
import { Form } from './Form'
import { ExtraFormItemProps } from './types'

export interface FormInputProps extends Omit<InputProps, 'value' | 'onChange'> {}

export const inputFormItem = (
  inputProps: FormInputProps,
  formItemProps: ExtraFormItemProps
): Form<string, string> => i => ({
  result: some(i),
  ui: onChange => (
    <AntForm.Item {...formItemProps}>
      <Input {...inputProps} value={i} onChange={({ target: { value } }) => onChange(value)} />
    </AntForm.Item>
  )
})
