import { resolve } from 'path';

export const pathToUrl = p => new URL(`file://${resolve(p)}/`);
export const urlToPath = u => u.href.replace('file://', '');
export const normaliseUrl = (pOrU: URL | string): URL =>
  typeof pOrU === 'string' ? pathToUrl(pOrU) : pOrU;
