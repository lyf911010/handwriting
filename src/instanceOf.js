function _instanceOf(instance, classFn) {
  if (typeof instance !== 'object' || instance === null) return false
  var proto = Object.getPrototypeOf(instance) // instance.__proto__
  while(proto) {
    if (proto === classFn.prototype) return true
    proto = Object.getPrototypeOf(proto) // proto.__proto__
  }
  return false
}


function Person() {
  console.log(1)
}

var p = new Person();
// console.log(p.__proto__ === Person.prototype);
// console.log(Person.prototype.__proto__ === Object.prototype);
// console.log(Object.prototype.__proto__ === null);

console.log(_instanceOf({}, Object));