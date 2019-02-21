import { Dict } from 'wool/core';
import { command } from 'wool/terminal';
import { assert, attempt, describe } from 'wool/test';

export default describe('command', [
  assert({
    given: 'a command',
    should: 'call the command',
    actual: () => {
      let res;
      command({
        action: cmd => {
          res = cmd;
        },
      })({ argv: [] });
      return res;
    },
    expected: {},
  }),
  assert({
    given: 'a command with an argument',
    should: 'call the command with the argument',
    actual: () => {
      let res;
      command({
        args: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', 'value'] });
      return res;
    },
    expected: Dict.fromList([['name', 'value']]),
  }),
  assert({
    given: 'a command with a flag `--name="value"`',
    should: 'call with the flag and value',
    actual: () => {
      let res;
      command({
        flags: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', '--name="value"'] });
      return res;
    },
    expected: Dict.fromList([['name', 'value']]),
  }),
  assert({
    given: 'a command with a flag `--name="value with space"`',
    should: 'call with the flag and spaced value',
    actual: () => {
      let res;
      command({
        flags: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', '--name="value with space"'] });
      return res;
    },
    expected: Dict.fromList([['name', 'value with space']]),
  }),
  assert({
    given: 'a command with a flag `--name=value`',
    should: 'call with the flag and value',
    actual: () => {
      let res;
      command({
        flags: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', '--name=value'] });
      return res;
    },
    expected: Dict.fromList([['name', 'value']]),
  }),
  assert({
    given: 'a command with a flag `--name value`',
    should: 'call with the flag and value',
    actual: () => {
      let res;
      command({
        flags: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', '--name', 'value'] });
      return res;
    },
    expected: Dict.fromList([['name', 'value']]),
  }),
  assert({
    given: 'a command with a flag `--name`',
    should: 'call with the flag as boolean true',
    actual: () => {
      let res;
      command({
        flags: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', '--name'] });
      return res;
    },
    expected: Dict.fromList([['name', true]]),
  }),
  assert({
    given: 'a command with multiple flags',
    should: 'call with all the flags and values',
    actual: () => {
      let res;
      command({
        flags: [{ name: 'name' }],
        action: cmd => {
          res = cmd;
        },
      })({ argv: ['program', 'command', '--on', '--dir=./dist'] });
      return res;
    },
    expected: Dict.fromList([['on', true], ['dir', './dist']]),
  }),
]);
