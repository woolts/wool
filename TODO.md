# Todo

- [x] Compile with typescript using `wool make ...`
- [ ] Bundle into an installable executable
  - `pkg` is the best option
  - However it critically does not support esm loaders
- [x] Add `direct` and `indirect` groupings to dependencies
- [x] Automatically fix order of workspaces so they build in the correct order, based on the dependency graph
- [ ] Embed a specific node version into `wool`
  - This will prevent issues around incompatible node versions
  - It will make community upgrades easier as it will only be tied to the wool version, not the node version outside of our control
- [ ] Spike using `deno` instead of node
  - It is _very_ early days so no need to do this yet
- [ ] Change exec of \*nix specific tools to a compatibility layer to make it work on windows as well
- [ ] Reduce node api surface
  - May be controversial, but would help if there is a switch to deno perhaps
  - e.g. `import { path } from 'wool/node';`
  - or `import { path } from 'wool';`
  - or `import { path } from 'node/path';`
- [ ] Catch all errors and map through sourcemaps to ts code
- [x] Add `wool summary` for info on installed packages
- [ ] Suppress esm experimental warning (not any others)
- [ ] Fix `wool.lock` to include direct and indirect deps from parent workspace
- [ ] Rename `wool.lock` to `wool-lock.json` since it is a json file
- [ ] Fix `wool add` to handle down registries
- [ ] Add `wool add npm/example` to install npm packages with caveats
  - Only in private packages
- [ ] Add a `wool-stats.json` to store compilation info
- [ ] When running `wool run` check for missing dependencies, run a `wool make .` if required and a `wool add ...` for the remaining non-local deps
- [ ] When running `wool make .` check for missing dependencies and if required run a `wool add ...`
- [ ] Change global add to `wool install wool/cli`
  - [ ] And `wool install wool/cli -v 0.2.0`
- [ ] Add generic run configs, `wool run -c example.json lsjroberts/example`
- [ ] `wool run` should run the version that matches the local dep unless version specified
- [x] Add `tasks` for `wool task . build` from `{ "tasks": { "build": "do thing" } }`
  - [x] With built-in nesting, `wool task . build.web` from `{ "tasks": { "build": { "web": "do web" } } }`, and `wool task . build` would run all nested tasks.
  - [ ] Shortcut cwd with `wool task build`
- [ ] Add generic run watch, `wool run -w lsjroberts/example`, it watches files in local workspace
- [ ] Add make watch `wool make . -w`
- [ ] Change `wool run lsjroberts/example/1.0.0` to `wool run lsjroberts/example -v 1.0.0`
- [ ] Add `wool run lsjroberts/example -v 1.0` and `wool run lsjroberts/example -v 1`
- [ ] Always run the latest version of a package acceptable to the given constraint
  - [ ] If none specified, run the version that matches the local dep if there is one
  - [ ] If the user attempts to run a version that would not be picked by the local dep, warn and await confirmation, unless `--force` is given
- [ ] Fail fast on make, stop compilation after the first error
  - e.g. "make failed on wool/cli with 12 errors, the first was: ... to see all run again with `--verbose`"
- [ ] Fix dependency tree order
  - It errored on a weird situation when utils failed after cli, but may have caused cli to not see utils anymore
- [ ] When making local packages they should install into `~/.wool/packages/lsjroberts/example/1.0.0-dev`
  - A package's version will be determined by its interface, therefore you have to write the code before you can version. However, this means it will compile into and overwrite the existing actual version you have downloaded / made. To prevent this it installs into the `-dev` suffix for the current version.
  - Local packages that depend on `1.0.0` will use the `-dev` version
  - Local packages that have a constraint that does not match `1.0.0` will not depend on this `-dev` version
- [ ] Record package usage in `~/.wool/usage.json` and auto clean unused packages
  - When a project is compiled, update the `usage.json` with which packages and versions it depends on
  - If the compilation causes a package to have zero projects using it, delete that package/version
- [ ] Restructure into:
  ```
  wool/core
    Array
    Dict
    List
    Maybe
    Process
    Set
    String
    Tuple
  wool/cli
  wool/fs
  wool/package
  wool/request
  wool/semver
  wool/terminal
  wool/test
  ```
- [ ] Extract cli commands into programattic actions which the cli calls and provides a terminal interface to
- [ ] Fix intermittent make failures. It fails on types but running again it passes.
- [ ] Add test failure reporter for object diffs
- [ ] Fix constant rebuild of private packages (not checking for dirty correctly)