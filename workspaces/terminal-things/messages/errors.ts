import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/colors';

import format from './format';

const readFile = promisify(fs.readFile);

export default {
  addUnresolvedPackage,
  makeMissingWoolConfig,
  makeTypescriptMissingModuleError,
  makeTypescriptGenericError,
  publishMissingRegistries,
  publishRegistryConnectionRefused,
  readPackageConfig,
  readPackageLock,
};

// --- Add ---

function addUnresolvedPackage({ unresolved }) {
  const unresolvedMessages = unresolved.map(u =>
    colors.red(`    ${u.name}  required by ${u.parent}  at ${u.constraint}`),
  );

  return [
    format.title('Resolution error', 'wool add'),
    '',
    format.message(
      'I could not resolve some of the packages you requested and/or their dependencies.',
    ),
    '',
    ...unresolvedMessages,
    '',
    format.message(
      'This is either an issue with one or more of the published packages, or with wool itself.',
    ),
    '',
    format.message(
      'Please report this issue to https://github.com/woolts/wool/issues',
    ),
  ].join('\n');
}

// --- Make ---

function makeMissingWoolConfig({ dir, predictedName }) {
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

async function makeTypescriptMissingModuleError({ filePath, line, pos, name }) {
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

async function makeTypescriptGenericError({ filePath, line, pos, message }) {
  const fileContents = await readFile(path.join(process.cwd(), filePath)).then(
    buffer => buffer.toString(),
  );
  const fileLines = fileContents.split('\n');
  const fileContentsLine = fileLines[line - 1];
  const remainder = fileContentsLine.slice(pos);
  const fileContentsPosLength =
    // remainder.indexOf(' ') ||
    remainder.indexOf("'");
  // remainder.indexOf('\n') ||
  // remainder.indexOf(';');

  // TODO: this is awful
  const above2 = fileLines[line - 3];
  const above1 = fileLines[line - 2];
  const below1 = fileLines[line];
  const below2 = fileLines[line + 1];

  // TODO: syntax highlighting
  const lines = [
    `${line - 2}| ${above2}`,
    `${line - 1}| ${above1}`,
    `${line}| ${fileContentsLine}`,
    `${format.repeat(' ', String(line).length + 2 + Number(pos))}${colors.red(
      format.repeat('^', fileContentsPosLength),
      `${line + 1}| ${below1}`,
      `${line + 2}| ${below1}`,
    )}`,
  ].join('\n');

  return [
    format.title('Typescript error', filePath),
    format.message(message),
    lines,
  ].join('\n\n');
}

// --- Publish ---

function publishMissingRegistries() {
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

function publishRegistryConnectionRefused(registry) {
  return [
    format.title('Publish error', registry),
    format.message(
      `I could not connect to ${colors.red(
        registry,
      )}, check your network settings or if the registry is offline.`,
    ),
    format.message('To start a local registry, try running:'),
    `    ${colors.cyan('wool run you/registry registry-name')}`,
  ].join('\n\n');
}

// --- Utils ---

function readPackageConfig(err) {
  const cleanPath = err.path.replace(process.cwd(), '.');

  return [
    format.title('Missing package config', cleanPath),
    format.message(`I could not find ${colors.red(cleanPath)}.`),
    format.message(
      `I recommend either running ${colors.cyan(
        'wool init',
      )} within the directory or manually creating a ${colors.white(
        'wool.json',
      )} file.`,
    ),
    format.message('Alternatively, you may be looking in the wrong directory.'),
  ].join('\n\n');
}

function readPackageLock(err) {
  const cleanPath = err.path.replace(process.cwd(), '.');

  return [
    format.title('Missing package lock', cleanPath),
    format.message(`I could not find ${colors.red(cleanPath)}.`),
    format.message(
      `I recommend running ${colors.cyan(
        `wool make ${cleanPath.replace('wool.lock', '').replace('./', '.')}`,
      )} to create it.`,
    ),
    format.message('Alternatively, you may be looking in the wrong directory.'),
  ].join('\n\n');
}
