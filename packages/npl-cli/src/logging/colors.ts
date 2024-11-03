export const colors = {
  black: (log: string) => `\u001b[30m${log}\u001b[0m`,
  red: (log: string) => `\u001b[31m${log}\u001b[0m`,
  green: (log: string) => `\u001b[32m${log}\u001b[0m`,
  yellow: (log: string) => `\u001b[33m${log}\u001b[0m`,
  blue: (log: string) => `\u001b[34m${log}\u001b[0m`,
  purple: (log: string) => `\u001b[35m${log}\u001b[0m`,
  cyan: (log: string) => `\u001b[36m${log}\u001b[0m`,
  white: (log: string) => `\u001b[37m${log}\u001b[0m`,
} as const;
