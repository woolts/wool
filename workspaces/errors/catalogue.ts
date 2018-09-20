import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/colors';

import * as format from './format';

const readFile = promisify(fs.readFile);

// -- MAKE

export function makeMissingWoolConfig({ dir, predictedName }) {
  return [
    format.title('Compilation error', dir),
    format.message(
      `I could not find a ${colors.red('wool.json')} file in this workspace.`,
    ),
    format.message(
      `I recommend either running ${colors.cyan(
        'wool init',
      )} within the directory or manually creating a ${colors.white(
        'wool.json',
      )} file with these contents:`,
    ),
    colors.white(
      JSON.stringify(
        { name: `you/${predictedName}`, version: '1.0.0', dependencies: {} },
        null,
        2,
      ),
    ),
  ].join('\n\n');
}

export async function makeTypescriptMissingModuleError({
  filePath,
  line,
  pos,
  name,
}) {
  const fileContents = await readFile(path.join(process.cwd(), filePath)).then(
    buffer => buffer.toString(),
  );
  const fileContentsLine = fileContents.split('\n')[line - 1];
  const remainder = fileContentsLine.slice(pos);
  const fileContentsPosLength =
    // remainder.indexOf(' ') ||
    remainder.indexOf("'");
  // remainder.indexOf('\n') ||
  // remainder.indexOf(';');

  return [
    format.title('Missing package error', filePath),
    format.message(`I could not find the package ${colors.red(name)}.`),
    `${line}| ${fileContentsLine}\n${format.repeat(
      ' ',
      String(line).length + 2 + Number(pos),
    )}${colors.red(format.repeat('^', fileContentsPosLength))}`,
    format.message(
      `Try running ${colors.cyan(
        `wool add ${name}`,
      )} to install it and add it to your project.`,
    ),
  ].join('\n\n');
}

export async function makeTypescriptGenericError({
  filePath,
  line,
  pos,
  message,
}) {
  const fileContents = await readFile(path.join(process.cwd(), filePath)).then(
    buffer => buffer.toString(),
  );
  const fileContentsLine = fileContents.split('\n')[line - 1];
  const remainder = fileContentsLine.slice(pos);
  const fileContentsPosLength =
    // remainder.indexOf(' ') ||
    remainder.indexOf("'");
  // remainder.indexOf('\n') ||
  // remainder.indexOf(';');

  return [
    format.title('Typescript error', filePath),
    format.message(message),
    // TODO: syntax highlighting
    `${line}| ${fileContentsLine}\n${format.repeat(
      ' ',
      String(line).length + 2 + Number(pos),
    )}${colors.red(format.repeat('^', fileContentsPosLength))}`,
  ].join('\n\n');
}

// -- PUBLISH

export function publishMissingRegistries() {
  return [
    format.title('Publish error', 'wool.json'),
    format.message(
      `Your root ${colors.red('wool.json')} config is missing a ${colors.red(
        'registries',
      )} array. I do not know where to publish your package.`,
    ),
    JSON.stringify({ registries: ['http://localhost:7777'] }, null, 2),
    format.message(
      `Please see ${colors.cyan(
        'woolts.org/publishing',
      )} for further information.`,
    ),
  ].join('\n\n');
}
