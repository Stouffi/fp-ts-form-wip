import { fromOption } from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { Option } from 'fp-ts/lib/Option'
import { withMessage } from 'io-ts-types/lib/withMessage'
import { Form } from './Form'
import { inputFormItem } from './Input'
import {
  Validated,
  validatedForAntd,
  validatedFromIoTsForAntd,
  withInputAsString
} from './Validator'
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString'

export const requiredFromOption: (
  messageIfNone: string
) => <I>(f: Form<Option<I>, Option<I>>) => Form<Validated<Option<I>>, I> = message =>
  validatedForAntd(fromOption(() => [message]))

export const nonEmptyStringFormItem = (messageIfEmpty: string) =>
  flow(
    inputFormItem,
    validatedFromIoTsForAntd(withInputAsString(withMessage(NonEmptyString, () => messageIfEmpty)))
  )
