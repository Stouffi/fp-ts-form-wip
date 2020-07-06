export interface ResourceSuccess<P, A> {
  _tag: 'ResourceSuccess'
  params: P
  result: A
}
export interface ResourceNothing {
  _tag: 'ResourceNothing'
}
export interface ResourceWaiting<P> {
  _tag: 'ResourceWaiting'
  params: P
}
export interface ResourceError<P, E> {
  _tag: 'ResourceError'
  params: P
  error: E
}

export type ResourceState<P, E, A> =
| ResourceNothing
| ResourceWaiting<P>
| ResourceError<P, E>
| ResourceSuccess<P, A>

export const resourceNothing = <P = never, E = never, A = never>(): ResourceState<P, E, A> => ({
_tag: 'ResourceNothing'
})
export const resourceWaiting = <P>(params: P) => <E = never, A = never>(): ResourceState<
P,
E,
A
> => ({
_tag: 'ResourceWaiting',
params
})
export const resourceError = <P>(params: P) => <E, A = never>(
error: E
): ResourceState<P, E, A> => ({
_tag: 'ResourceError',
params,
error
})
export const resourceSuccess = <P>(params: P) => <A, E = never>(
result: A
): ResourceState<P, E, A> => ({
_tag: 'ResourceSuccess',
params,
result
})