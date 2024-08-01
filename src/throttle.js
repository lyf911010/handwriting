/**
 * 节流 将多次执行变成每隔一段时间才执行
 */
function throttle(fn, wait) {
    let lastTime = 0;
    return function(...args) {
      const now = +new Date();
      if (now - lastTime > wait) {
        lastTime = now;
        fn.apply(this, args);
      }
    }
}