import { apply, either, eitherT } from 'fp-ts'
import { observable } from 'fp-ts-rxjs'
import { flow } from 'fp-ts/lib/function'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

const fold = <R, L, A>(left: (l: L) => R, right: (a: A) => R) => (
  fa: Observable<either.Either<L, A>>
): Observable<R> =>
  obsEitherT.fold(
    fa,
    // tslint:disable-next-line: no-unnecessary-callback-wrapper
    flow(left, l => of(l)),
    // tslint:disable-next-line: no-unnecessary-callback-wrapper
    flow(right, a => of(a))
  )

const foldW: <RL, RA, L, A>(
  left: (l: L) => RL,
  right: (a: A) => RA
) => (fa: Observable<either.Either<L, A>>) => Observable<RL | RA> = fold as any

const left = <L, A>(l: L): Observable<either.Either<L, A>> => of(either.left(l))

const mapLeft = <L, LL>(f: (a: L) => LL) => map(either.mapLeft(f))

const obsEitherT = eitherT.getEitherM(observable.observable)

export const obsEither = {
  ...obsEitherT,
  fold,
  foldW,
  left,
  mapLeft
}
export const adoObservable = apply.sequenceS(observable.observable)
