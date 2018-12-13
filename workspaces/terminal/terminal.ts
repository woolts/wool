import { Dict, List, String, Tuple } from 'wool/core';

interface UIConfig<Model> {
  args?: Array<ArgConfig>;
  flags?: Array<FlagConfig>;
  init: (cmd: Command) => Model;
  update: (msg: any, model: Model) => Model;
  view: (model: Model) => any; // => UI.Layout
}

interface ApplicationConfig {
  commands: Array<CommandConfig>;
}

interface CommandConfig {
  args?: Array<ArgConfig>;
  flags?: Array<FlagConfig>;
  action: (cmd: Command) => void;
}

interface ArgConfig {
  name: string;
  required: boolean;
}

interface FlagConfig {
  name: string;
}

interface Command {
  [key: string]: boolean | string | number | null;
}

export function command(config: CommandConfig) {
  return () => {
    const cmd = parseArgv(process.argv);
    return config.action(cmd);
  };
}

export function application(config: ApplicationConfig) {
  return () => {};
}

export function ui<Model>(config: UIConfig<Model>) {
  return () => {};
}

// --- Parsing ---

/**

-f
--flag

-f hello
--flag hello
--flag=hello

a
arg

*/

function parseArgv(argv: Array<string>): Dict<string, any> {
  return Dict.fromList(
    List.reduce(
      (as, word) => {
        return [...as, ...parseWord(word)];
      },
      argv,
      [],
    ),
  );
}

function parseWord(word: string): Tuple.Tuple<string, string> {
  if (String.startsWith('--', word) && String.contains('=', word)) {
    // TODO: handle `--flag=hello=boo`
    return Tuple.pair(...String.split('=', String.tail(2, word)));
  }

  if (String.startsWith('--', word)) {
    return Tuple.pair(String.tail(2, word), true);
  }

  if (String.startsWith('-', word)) {
    return Tuple.pair(String.tail(1, word), true);
  }

  // TODO: handle non-located flags
  // ['-f', 'hello']
  // ['--flag', 'hello']

  // TODO: handle non-located args
  // ['arg', 'hello']

  return Tuple.pair(word, true);
}
