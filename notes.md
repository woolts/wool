## Make process for a single package project

1. Compare `wool.json` constraints against `wool-lock.json` versions
  a. If `wool-lock.json` is satisified by `wool.json`, skip to step 3
2. Add missing packages
  a. Find maximum matching version against constraint across all registries
    i. If this is an installed version, skip to step c
  b. Download package into `~/.wool/packages`
  c. Update `wool-lock.json` to point at new version
3. Compile package
4. If any missing package errors are thrown, suggest to add

## Make process for monorepos

Q. Should it throw an error on conflicting dependencies?
A. Probably yes.
  - Pros: It prevents hard to debug errors due to multiple versions of a package being used
  - Cons: It is restrictive, but so is the whole of wool, that's the point

1. Discover conflicting dependencies across workspace `wool.json` files
  a. If there are any, throw an error
2. Discover conflicting versions across workspace `wool-lock.json` files
  a. If there are any, update all to the greatest version in the locks
3. Compare concatenated `wool.json` with concatenated `wool-lock.json`
  a. If concatenated is satisified, skip to step 5
4. Add missing packages
  a. Find maximum matching version against constraint across all registries
    i. If this is an installed version, skip to step c
  b. Download package into `~/.wool/packages`
  c. Update each package `wool-lock.json` as appropriate to point at new version
5. Compile workspaces
6. If any missing package errors are thrown, suggest to add



Discovering conflicts -
  Get list of unique constraints for all packages, linked to the packages those constraints are defined in, and the package linked to the locked version.
  If a dep has multiple constraints, throw an error.
  If a dep has a single constraint but is linked to multiple locked versions, update all to greatest lock version.