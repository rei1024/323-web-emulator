export function* chunk<A>(
  iterable: Iterable<A>,
  size: number,
): Generator<A[], void, unknown> {
  if (!Number.isInteger(size)) {
    throw RangeError("size is not an integer");
  }

  let temp = [];
  for (const x of iterable) {
    temp.push(x);
    if (size <= temp.length) {
      yield temp;
      temp = [];
    }
  }

  if (temp.length !== 0) {
    yield temp;
  }
}
