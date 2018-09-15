# Todo

- [x] Compile with typescript using `wool make ...`
- [ ] Bundle into an installable executable
- [ ] Add `direct` and `indirect` groupings to dependencies
- [ ] Automatically fix order of workspaces so they build in the correct order, based on the dependency graph
- [ ] Embed a specific node version into `wool`
  - This will prevent issues around incompatible node versions
  - It will make community upgrades easier as it will only be tied to the wool version, not the node version outside of our control
