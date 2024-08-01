/**
 * 防抖 将多次执行变成最后一次执行
 */
function debounce(fn, wait) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, wait)
  }
}
export default debounce;