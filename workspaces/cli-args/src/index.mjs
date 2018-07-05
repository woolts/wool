import path from 'path';

export default function run(app, args) {
  const [command, ...rest] = args;

  const found = app.commands.filter(c => c.name === command)[0];

  if (!found) {
    help(app);
    return;
  }

  if (found && args.includes('--help')) {
    helpCommand(app, found);
    return Promise.resolve();
  }

  const namedArguments = {};
  if (found.arguments) {
    const argumentsArray = found.arguments.split(' ');

    argumentsArray.forEach((a, index) => {
      const name = a
        .split('')
        .slice(1, -1)
        .join('');

      if (a[0] === '[' && a[a.length - 1] === ']') {
        namedArguments[name] = rest[index];
        return;
      }

      if (a[0] === '<' && a[a.length - 1] === '>') {
        if (arguments[index] === undefined) {
          throw new Error('shit it');
        }
        namedArguments[name] = rest[index];
        return;
      }

      throw new Error('fuck it');
    });
  }

  return found.action({ arguments: namedArguments });
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
