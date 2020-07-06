import { fold, Option, toUndefined } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as React from 'react'
import { FormItemProps } from 'antd/lib/form'

export const renderError = (err: Option<string[]>, ui: React.ReactElement) => {
  const props: Partial<FormItemProps> = {
    help: toUndefined(err),
    validateStatus: pipe(
      err,
      fold(
        () => '',
        () => 'error'
      )
    )
  }
  return React.cloneElement<FormItemProps>(ui, props)
}
