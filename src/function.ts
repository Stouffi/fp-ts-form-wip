import { none } from "fp-ts/lib/Option"

export type Curried<A extends unknown[], B> = A['length'] extends 0
? () => B
: A['length'] extends 1
? (a: A[0]) => B
: A['length'] extends 2
? (a: A[0]) => (a: A[1]) => B
: 'Curried function for more than 2 arguments not available. You can add what you need at the type definition'

export const flipC = <A, B, C>(c: Curried<[A, B], C>): Curried<[B, A], C> => b => a => c(a)(b)

export const constNone = () => none