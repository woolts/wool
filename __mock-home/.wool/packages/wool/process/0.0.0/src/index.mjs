import child_process from 'child_process';
import util from 'util';

export const exec = util.promisify(child_process.exec);
// export const exec = console.log;
export const spawn = util.promisify(child_process.spawn);
