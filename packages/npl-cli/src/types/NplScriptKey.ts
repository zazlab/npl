import type { NplCommand } from '#/enums/NplCommand.js';
import type { NplScriptHook } from './NplScriptHook.js';

export type NplScriptKey = `${NplScriptHook}${NplCommand}`;
