function myCall(context, ...args) {
  context = context || globalThis
  let fn = Symbol()
  context[fn] = this
  const res = context[fn](...args)
  delete context[fn]
  return res
}

Function.prototype.myCall = myCall

function say() {
  console.log(`this is ${this.name}`)
}

var person = { name: 'John' }

say.myCall(person)

