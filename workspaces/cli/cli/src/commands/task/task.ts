import * as colors from 'wool/colors';
import { spawn } from 'wool/process';
import { get, has, readPackageConfig, resolveWorkspaces } from 'wool/utils';

export default async function task({ args, options }) {
  const dir = args.name ? args.nameOrDir : '.';
  const task = (args.name || args.nameOrDir) as string;

  if (!options.children) {
    await runTask(await readPackageConfig(dir), task);
  } else {
    const workspaces = await resolveWorkspaces(dir);
    await Object.keys(workspaces).reduce(
      (promise, w) => promise.then(() => runTask(workspaces[w].config, task)),
      Promise.resolve(),
    );
  }
}

async function runTask(config, task) {
  if (!config.tasks || Object.keys(config.tasks).length === 0) {
    console.log(
      colors.yellow('You have not configured any tasks in your wool.json'),
    );
    return;
  }

  if (!has(task, config.tasks)) {
    console.log(
      `The task ${colors.yellow(task)} does not exist in your wool.json`,
    );
    return;
  }

  const taskConfig = get(task, config.tasks);

  if (Array.isArray(taskConfig)) {
    await spawn(taskConfig[0], taskConfig.slice(1));
    return;
  }

  await Promise.all(
    Object.keys(taskConfig).map(async (key: string) => {
      const innerConfig = get(`${task}.${key}`, config.tasks);
      if (!Array.isArray(innerConfig)) {
        throw new Error(
          `Task '${task}.${key}' is invalid, expected an array of strings, received '${JSON.stringify(
            innerConfig,
          )}'`,
        );
      }
      await spawn(innerConfig[0], innerConfig.slice(1));
    }),
  );
}
