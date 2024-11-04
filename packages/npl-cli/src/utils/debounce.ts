// biome-ignore lint/suspicious/noExplicitAny: generic debounce function must accept any
export const debounce = <T extends (...args: any[]) => Promise<void>>(func: T, delay: number) => {
  let flag = true;
  return function (this: unknown, ...args: Parameters<T>) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, delay);
      return func.apply(this, args);
    }
  };
};
