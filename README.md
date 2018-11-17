# Wool

**This project is very early pre-alpha, not everything described here exists, and much of it will not work as expected.**

- [Getting Started](#getting-started)
- [Creating a New Project](#creating-a-new-project)
- [CLI](#cli)
- [Testing](#testing)

Wool is a new typescript ecosystem designed for a great developer experience. Easy for beginners and scalable for advanced projects.

It is a package manager, decentralised package registry, and monorepo compiler.

With typescript only packages and automated semantic versioning it brings an extra level of stability to your projects.

Many of the early ideas were described in [this article about a better javascript ecosystem](http://gelatindesign.co.uk/coding/javascript-ecosystem), though it has since evolved, notably becoming purely typescript.

Wool is self compiling, so you can look at this repo to see how a project can be structured. For a simpler example see the [examples](examples) directory.

Wool runs on a zero config philosophy, developers shouldn't need to worry about configuring their compilers, be that webpack or tsc, they should only be concerned with writing the code for their projects. To that end, the only configuration possible is naming, versioning, dependencies and structuring your workspaces.

All packages are installed into a single directory, `~/.wool/packages`. Once you've installed a package on your machine, it doesn't need to be installed again, or copied to another location, or even symlinked. All packages are imported directly from this single directory. Starting a new project with packages you've already installed will be instantaneous.

## Getting Started

While in development the installation step is manual. Go to the [releases](https://github.com/woolts/wool/releases) and follow the instructions.

To test it is working, run:

```
wool list --global
```

And you should see a list of the installed `wool/*` packages.

Unless stated on a new release, to upgrade you should be able to simply clone this repo and run `wool make .` inside it. This will install the latest code within each package into `~/.wool/packages`.

## Creating a New Project

In the future you will be able to do this by running `wool init`, but for now you can follow these instructions.

In a new directory create a `wool.json` file:

```json
{
  "name": "lsjroberts/my-project",
  "entry": "index.ts",
  "dependencies": {}
}
```

Note the package name, `lsjroberts/my-projects`, all packages must be namespaced. (The only exception to this are node builtins that keep their non-namespaced names).

In your entry file write your code:

```ts
// index.ts
export default () => console.log('Hello, World!');
```

Then compile your project:

```
wool make .
```

It will compile it into your `wool-stuff/build-artifacts` directory, so it is best to add a `.gitignore`:

```
# Generated files
wool-stuff
tsconfig.json

# Editors
.vscode

# System
.DS_Store
```

Note how we ignore the generated `tsconfig.json` files. These are created each time you run `wool make .` and will contain paths specific to your machine, so you should not commit them to your project.

### Workspaces

Wool takes monorepos to the next level. You can have as many nested shared or independently versioned packages as you like in a single repo.

Running `wool make .` in the root directory will then build all your packages and link them together as needed. You don't need to worry about which `node_modules` directory a package is being imported from, it just works. In fact, there are no `node_modules` directories.

To add workspaces to your project, update your `wool.json`:

```json
{
  "private": true,
  "version": "1.0.0",
  "workspaces": [
    "workspaces/my-package",
    "workspaces/another-package",
    "some/other/directory/a-third-package"
  ]
}
```

Each of your workspaces should then have their own `wool.json`:

```json
// workspaces/my-package
{
  "name": "lsjroberts/my-package"
}
```

In this case, its version is determined by the root version.

If you wanted, you can have a root version, then another set of packages with their own shared version, and yet more packages that are independently versioned.

```json
{
  "private": true,
  "workspaces": [
    "independent/my-package-one",
    "independent/my-package-two",
    "shared"
  ]
}
```

```json
// shared
{
  "private": true,
  "version": "2.3.0",
  "workspaces": ["my-package-three", "my-package-four"]
}
```

```json
// shared/my-package-three
{
  "name": "lsjroberts/my-package-three"
}
```

## CLI

Every command has the following options:

- `--help` - Display detailed help on usage (todo)
- `--dry-run` - Disables all side effects and outputs the actions that would have occurred (todo)

**Compile a project** (✓)

Compiles modified workspaces in the given directory into `./wool-stuff/build-artifacts`, and copies successful packages into your `~/wool` directory ready to be used by any project on your machine.

```
wool make .
```

Wool will detect the compilation order for your packages based on their dependency tree.

**Run a package** (wip)

Instead of polluting your global list of binaries on your machine, you can execute the entry file of any installed wool project through `wool`.

(todo)

```
wool run lsjroberts/example
```

Run a specific version (✓)

```
wool run lsjroberts/example/1.1.0
```

**Run a private package** (✓)

If you have compiled a package that is marked as private, it will not be installed into your `~/.wool` directory, and therefore can not be run with `wool run`.

To run this package use:

```
wool run-private lsjroberts/private-example
```

This will run it from your `./wool-stuff/build-artifacts` directory.

Note, you do not need to provide a version number.

**Pack a workspace into gzipped bundles** (✓)

Bundles each package into `./wool-stuff/bundles/lsjroberts_example-1.0.0.tar.gz`.

Usually you will not need to run this command directly, but it can be helpful to do so if you wish to debug the bundle that will be published to your registries.

```
wool pack .
```

**Add a dependency** (wip)

```
wool add lsjroberts/package
```

Searches and installs packages, in order until a matching package and version is found:

1.  Offline first, from `~/.wool/packages`
2.  Previously specified registry for the package in `wool.lock`
3.  Registries in order listed in `wool.json`

Use `--offline` to only look for the package in the existing installed packages, skipping steps 2 and 3.

Use `--fresh` to ignore the `wool.lock` and search for the package online in registry order.

Use `--workspace` / `-w` to add the package into a specific workspace other than the current directory.

```
wool add lsjroberts/package -w workspaces/example
```

**Run a local task** (wip)

```json
{
  "tasks": {
    "test": "wool run example/test ."
  }
}
```

```
wool task test
```

```json
{
  "tasks": {
    "test": "wool run example/test .",
    "build": {
      "test": "wool task test",
      "make": "wool make ."
    }
  }
}
```

```
wool task build
```

```
wool task build.make
```

**Install a global dependency** (todo)

```
wool install lsjroberts/package
```

Installs a package but does not add it to the local project. Its binaries are symlinked from the `~/.wool/.bin` directory.

e.g.

```json
{
  "name": "lsjroberts/package",
  "version": "1.0.0",
  "bin": {
    "example": "./bin/example.sh"
  }
}
```

```
wool install lsjroberts/package
```

```
ls ~/.wool/.bin/example
> ~/.wool/.bin/example -> ../packages/lsjroberts/package/1.0.0/bin/example.sh
```

## Testing

A test suite can be created as a workspace, for example the `workspaces/example/src` would have its tests in `workspaces/example/tests`, each with their own `wool.json` and dependencies.

We can then add a test task to the parent workspace:

```json
// workspaces/example/wool.json
{
  // ...
  "tasks": {
    "test": ["wool", "run-private", "wool/example-tests"]
  }
}
```

```ts
// workspaces/example/tests/index.ts
import { assert, describe, run } from 'wool/test';

const suite = describe('example', [
  assert({
    given: 'an example',
    should: 'return true',
    actual: true,
    expect: true
  }),
]);

run(suite);
```

See [workspaces/test](workspaces/test) for further information.

See [workspaces/core](workspaces/core) for a working example.

<!--

**Execute a node ts file** (todo)

```
wool path/to/file.ts
```

**Initialise a project** (todo)

```
wool init
```



-->

<!-- **Symlink a package to `~/.wool/packages`** (todo)

```
wool link .
``` -->

<!--
**Version a package** (wip)

```
wool version [version]
```

If no version is provided, it attempts to detect semantic version changes and suggests a new version.

If it has changed, updates the version in `wool.json`.

**Bundle a package** (todo)

```
wool bundle
wool bundle ~/example.tar.gz
wool bundle --version 1.1.0
```

Versions and zips a package into an installable bundle.

**Publish a package** (todo)

```
wool publish
wool publish --version 1.1.0
```

Bundles the package then publishes it to each listed registry that is compatible.

**Publish a package only locally to the `~/.wool` directory** (wip)

```
wool local?
wool local? --watch
```

Bundles and installs the package into `~/.wool/packages/[namespace]/[package]/[version]`.

Use `--watch` to watch its files and republish after any changes.

It will use the version specified in `wool.json`, overwriting any previously installed instance of the package at that version.

**Execute a script from `wool.json`** (todo)

```
wool run [script]
```

e.g.

```json
{
  "scripts": {
    "start": "wool index.mjs"
  }
}
```

```
wool run start
```

## Example

Within the root directory of this repo:

```
wool local
wool list --global
```

Then execute a script with:

```
wool examples/lsjroberts/example/index.mjs
```

And if it all works you should see the following output:

```
bob/package -- alice/package -- lsjroberts/example
```

![image of local command output](_screenshots/local.png)
![image of list command output](_screenshots/list.png)
-->
