export default async function add(...specifiers) {
  console.log(specifiers);
  // 1. Find the available registries, including $WOOL_HOME
  // 2. Loop the specifiers
  //   a. Search each registry in sequence for the specifier
  //   b. If specifier found, gather into collection of found specifiers
  // 3. Inform user of installation plan
  //   a. If user accepts plan, install packages into $WOOL_HOME
  //   b. If user rejects plan, abort
}
