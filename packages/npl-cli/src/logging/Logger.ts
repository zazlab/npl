import { emoji } from '#/logging/emoji.js';
import { colors } from './colors.js';

const DEBUG = process.env.DEBUG;

export class Logger {
  constructor(private readonly name: string) {}

  fatal(...args: unknown[]) {
    console.error(emoji.FATAL, ...args);
  }
  error(...args: unknown[]) {
    console.error(emoji.ERROR, ...args);
  }
  warn(...args: unknown[]) {
    console.warn(emoji.WARNING, ...args);
  }
  info(...args: unknown[]) {
    console.info(
      emoji.INFO,
      ...args.map((arg) => (typeof arg === 'string' ? colors.blue(arg) : arg)),
    );
  }
  log(...args: unknown[]) {
    console.log(...args);
  }
  debug(...args: unknown[]) {
    if (typeof DEBUG !== 'undefined' && (DEBUG === '*' || this.name.includes(DEBUG))) {
      console.debug(
        `${colors.blue('DEBUG[')}${colors.purple(this.name)}${colors.blue(']')}`,
        ...args,
      );
    }
  }
}
