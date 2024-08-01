function myNew(constructor, ...args) {
  var obj = {}
  obj.__proto__ = constructor.prototype
  var res = constructor.apply(obj, args)
  return typeof res === 'object' && res !== null ? res : obj
}

function Person(name, age) {
  this.name = name
  this.age = age
}

var p = myNew(Person, 'leon', 123123)
console.log(p instanceof Person);
console.log(p.__proto__ === Person.prototype);
console.log(p.name, p.age);