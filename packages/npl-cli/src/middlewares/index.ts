import type { MiddlewareFunction } from 'yargs';
import { extendArgv } from './extendArgv.js';

export const middlewares = [extendArgv] as ReadonlyArray<MiddlewareFunction>;
