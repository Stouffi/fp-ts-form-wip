import { some } from 'fp-ts/lib/Option'
import * as React from 'react'
import { Form } from './Form'

export const inputString: Form<string, string> = value => ({
  result: some(value),
  ui: onChange => <input onChange={({ target: { value } }) => onChange(value)} value={value} />
})
