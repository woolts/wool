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

type ActionFn = () => void;

interface ArgConfig {
  name: string;
  required?: boolean;
}

interface FlagConfig {
  name: string;
  type?: 'boolean' | 'string' | 'number';
  required?: boolean;
}

interface Command {
  [key: string]: boolean | string | number | null;
}

export function action(fn: ActionFn) {
  return () => fn();
}

export function command(config: CommandConfig) {
  return proc => {
    const cmd = parseArgv(config.args, config.flags, proc.argv.slice(2));
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

// TODO: Regex this :(
function parseArgv(
  args: Array<ArgConfig>,
  flags: Array<FlagConfig>,
  argv: Array<string>,
): Dict<string, any> {
  return Dict.fromList(
    List.foldr(
      (cur, prev) => {
        return [...prev, parseWord({ cur, prev, args, flags })];
      },
      [],
      argv,
    ),
  );
}

function parseWord({
  cur,
  prev,
  args,
  flags,
}: any): Tuple.Tuple<string, string> {
  if (String.startsWith('--', cur) && String.contains('=', cur)) {
    // TODO: handle `--flag=hello=boo`
    let [name, value] = String.split('=', String.dropLeft(2, cur));
    return Tuple.pair(name, trimQuotes(value));
  }

  if (String.startsWith('--', cur)) {
    return Tuple.pair(String.dropLeft(2, cur), true);
  }

  if (String.startsWith('-', cur)) {
    return Tuple.pair(String.dropLeft(1, cur), true);
  }

  // TODO: handle non-located flags
  // ['-f', 'hello']
  // ['--flag', 'hello']

  // TODO: handle non-located args
  // ['arg', 'hello']

  return Tuple.pair(cur, true);
}

const trimQuotes = str =>
  String.startsWith('"', str) && String.endsWith('"', str)
    ? String.dropLeft(1, String.dropRight(1, str))
    : str;
