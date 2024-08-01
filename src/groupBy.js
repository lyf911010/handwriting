function groupBy(list, fn) {
  // let res = {}
  // list.forEach(item => {
  //   const key = fn(item)
  //   if (res[key]) {
  //     res[key].push(item)
  //   } else {
  //     res[key] = [item]
  //   }
  // });
  // return res
  return list.reduce((acc, item) => {
    const key = fn(item)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)

    return acc
  }, {})
}


const items = [
  {
    id: 1,
    kind: 'a',
  },
  {
    id: 2,
    kind: 'b',
  },
  {
    id: 3,
    kind: 'a',
  }
]

const res = groupBy(items, ({ kind }) => kind)
// const res = groupBy([0, 1, 2, 3, 4, 5], (item) => item % 2 === 0 ? 'even' : 'odd')
console.log(res);