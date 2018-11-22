# Wool / Package

A collection of actions to modify wool packages.

## Preflight

```ts
import { preflight } from 'wool/package';

await preflight('.');
```

## Make

```ts
make(dir, options);
```

### Options

| Name | Type | Default | Description |
|-|-|-|-|
| `force` | `Boolean` | `false` | foo |