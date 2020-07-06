import { FormItemInputProps } from 'antd/lib/form/FormItemInput'
import { FormItemLabelProps } from 'antd/lib/form/FormItemLabel'
import { Refinement } from 'fp-ts/lib/function'

export interface ExtraFormItemProps extends FormItemLabelProps, Omit<FormItemInputProps, 'help'> {
  required?: boolean
  className?: string
  hasFeedback?: boolean
}