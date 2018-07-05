# Wool CLI

## Installation

_(todo) Add a proper installer_

```
mkdir ~/.wool
```

```
git clone https://gitlab.com/wooljs/wool
cp -R ./wool/workspaces/cli ~/.wool/packages/wool/cli
ln -s ~/.wool/packages/wool/cli/wool ~/.wool/.bin
```

## Commands

Every command has the following options:

- `--help` - Display detailed help on usage
- `--dry-run` - Disables all side effects and outputs the actions that would have occurred

**Execute a node file** (✔)

```
wool path/to/file.mjs
```

**Initialise a project** (todo)

```
wool init
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

**Add a global dependency** (todo)

```
wool add --global lsjroberts/package
```

On installation, `~/.wool/.bin` is added to your path. Any package added with `--global` will have its binaries symlinked within this directory.

e.g.

```json
{
  "name": "lsjroberts/package",
  "bin": {
    "example": "./bin/example.sh"
  }
}
```

```
ls ~/.wool/.bin/example
> ~/.wool/.bin/example -> ../packages/lsjroberts/package/1.0.0/bin/example.sh
```

<!-- **Symlink a package to `~/.wool/packages`** (todo)

```
wool link .
``` -->

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
