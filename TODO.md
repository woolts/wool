# Todo

- [x] Compile with typescript using `wool make ...`
- [ ] Bundle into an installable executable
  - `pkg` is the best option
  -
- [x] Add `direct` and `indirect` groupings to dependencies
- [ ] Automatically fix order of workspaces so they build in the correct order, based on the dependency graph
- [ ] Embed a specific node version into `wool`
  - This will prevent issues around incompatible node versions
  - It will make community upgrades easier as it will only be tied to the wool version, not the node version outside of our control
- [ ] Spike using `deno` instead of node
  - It is _very_ early days so no need to do this yet
- [ ] Change exec of \*nix specific tools to a compatibility layer to make it work on windows as well
