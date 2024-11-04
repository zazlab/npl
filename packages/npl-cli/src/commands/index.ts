import type { CommandModule } from 'yargs';
import { Link } from './link/command.js';
import { Pack } from './pack/command.js';
import { Unlink } from './unlink/command.js';
import { Watch } from './watch/command.js';

export const commands = [Pack, Link, Unlink, Watch] as CommandModule[];
