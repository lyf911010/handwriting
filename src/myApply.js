Function.prototype.myApply = function(context, args) {
  context = context || globalThis
  let fn = Symbol()
  context[fn] = this
  const res = args && args.length ? context[fn](...args) : context[fn]()
  delete context[fn]
  return res
}

const numbers = [5, 6, 2, 3, 7];

const max = Math.max.myApply(null, numbers);

console.log(max);

const array = ["a", "b"];
const elements = [0, 1, 2];
array.push.apply(array, elements);
console.info(array);