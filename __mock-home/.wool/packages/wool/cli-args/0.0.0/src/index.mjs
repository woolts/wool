import path from 'path';

export default function run(app, args) {
  const [command, ...rest] = args;

  const found = app.commands.filter(c => c.name === command)[0];

  if (!found) {
    help(app);
    return;
  }

  if (found && rest.includes('--help')) {
    helpCommand(app, found);
    return Promise.resolve();
  }

  const namedArguments = matchArguments(found.arguments, rest);
  const options = matchOptions(found.options, rest);

  return found.action({ args: namedArguments, options });
}

function help(app) {
  console.log(app.name);
  console.log(app.version);
  console.log('');

  console.log('Commands');
  console.log(`  ${app.commands.map(c => c.name).join('\n  ')}`);
}

function helpCommand(app, command) {
  console.log(`${command.name} ${command.arguments}`);
  console.log('');
  console.log('Options');
  console.log('');
  command.options.forEach(option => {
    console.log(`    --${option.name}  ${option.description}`);
  });
}

function matchArguments(expectedString, actual) {
  if (!expectedString) return {};

  const expectedArray = expectedString.split(' ');
  const matched = {};

  expectedArray.forEach((expected, index) => {
    const name = expected
      .split('')
      .slice(1, -1)
      .join('');

    if (isRequired(expected)) {
      if (actual[index] === undefined) {
        throw new Error(`Required argument ${name} was not provided`);
      }
      if (isOption(actual[index])) {
        throw new Error(`Arguments must be provided before optional flags`);
      }
      matched[name] = actual[index];
      return;
    }

    if (isOptional(expected)) {
      if (!isOption(actual[index])) {
        matched[name] = actual[index];
      }
      return;
    }

    // TODO: This should error earlier
    throw new Error(`Argument definition is invalid: ${expected}`);
  });

  return matched;
}

function matchOptions(expected, actual) {
  // TODO: filter against expected

  // if (!expectedString) return {};

  // const expectedArray = expectedString.split(' ');
  const matched = {};

  // TODO: functional
  for (let index = 0; index < actual.length; index++) {
    const value = actual[index];
    if (!isOption(value)) {
      continue;
    }
    matched[value.replace(/^--?/, '')] = actual[index + 1];
    index += 1;
  }

  return matched;
}

function isRequired(arg) {
  return arg[0] === '<' && arg[arg.length - 1] === '>';
}

function isOptional(arg) {
  return arg[0] === '[' && arg[arg.length - 1] === ']';
}

function isOption(option) {
  return option.startsWith('--') || option.startsWith('-');
}

/*

parse({
  version: '0.0.0',
  options: [
    ['-h, --help', 'Show the help', () => {}],
  ],
  commands: [
    ['a, add', 'Add a package to your dependencies', {
      arguments: '<name>',
      options: [
        ['-g, --global', "Add the package's binaries to your global path"]
      ],
      examples: [
        ['wool add alice/package', 'Install alice/package into your wool packages and add it to your project dependencies'],
        ['wool add alice/cli --global', 'Install alice/cli into your wool packages and add its binaries to your path'],
        ['wool add .', 'Install the project in the current directory into your wool packages'],
      ]
    }, () => {}],
    ['init', 'Initialise a new wool project'],
    ['link', 'Add a package to your dependencies', {}, () => {}],
    ['publish', 'Publish a package to the registries', {
      options: [
        ['-l, --local', 'Only publish to local registries'],
        ['-n, --no-version', 'Skip version update, local registries only'],
        ['-v, --version', 'Update to the given version, root package only, no workspaces'],
        ['-w, --watch', 'Watch for changes and publish without version update, local registries only'],
      ]
    }],
    ['run', 'Run a script from your wool.json'],
  ]
}, process.argv)

*/
