import { some } from 'fp-ts/lib/Option'
import { Lens } from 'monocle-ts'
import { focus } from './focus'
import { ado, Form, FormState } from './Form'
import { inputString } from './spec.utils'

const formOptions: FormState = { showErrorsAfterSubmit: false, submitted: false }

describe('Form', () => {
  it('produce result', () => {
    expect(inputString('toto', formOptions).result).toStrictEqual(some('toto'))
  })
  it('ado', () => {
    const f = ado({
      username: inputString,
      fullName: inputString
    })
    expect(
      f('toto', formOptions).result).toStrictEqual(
      some({ username: 'toto', fullName: 'toto' })
    )
  })
  it('focus', () => {
    interface A {
      username: string
      fullName: string
    }
    const makeLensA = Lens.fromProp<A>()
    const f: Form<A, A> = ado({
      username: focus(makeLensA('username'))(inputString),
      fullName: focus(makeLensA('fullName'))(inputString)
    })

    expect(
      f({ username: 'toto', fullName: 'titi' }, formOptions).result).toStrictEqual(
      some({ username: 'toto', fullName: 'titi' })
    )
  })
})
