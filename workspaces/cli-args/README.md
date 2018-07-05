# CLI Args

```js
import run from 'wool/cli-args';

const app = run(
  {
    name: 'app',
    arguments: '<required> [optional]',
    options: [
      {
        name: 'one',
        alias: 'o',
      },
      {
        name: 'two',
        alias: 't',
      },
    ],
  },
  process.argv.slice(2),
);
```

Valid

```shell
wool app "required value"
wool app "required value" optional
wool app required --flag
wool app --flag required
wool app required --flag --other value
```

Invalid

```shell
wool app
wool app required --other
wool app --other value required
```
