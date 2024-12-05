function undefinedToNull(obj) {
  for (const key in obj) {
    if (obj[key] instanceof Array ) {
      obj[key] = obj[key].map(i => {
        if (i === undefined) {
          i = null
        }
        return i
      })
    } else if (obj[key] === undefined) {
      obj[key] = null
    }
  }
}

// undefinedToNull({a: undefined, b: 'BFE.dev'})
// {a: undefined, b: { c: { d: undefined, e: ['BFE.dev', undefined]} }} 
//['BFE.dev', undefined, null, {a: ['BFE.dev', undefined]}]

undefinedToNull({a: ['BFE.dev', undefined, 'bigfrontend.dev']})