# Wool Registry Protocol

Version 0

## namespace

Provides information on the requested namespace.

### HTTP Request

```
GET /info/[namespace]
```

### Example

#### Request

```http
/info/bob
```

#### Response

```http
{
  "name": "bob",
  "packages": [
    "bob/package"
  ]
}
```

## package

Provides information on the requested package.

### HTTP Request

```
GET /info/[namespace]/[package]
```

| Parameter | Type              | Description                   |
| :-------- | :---------------- | :---------------------------- |
| version   | string (optional) | Exact or semver version range |

### Examples

#### Latest version

##### Request

```http
/info/bob/package
```

##### Response

```http
{
  "name": "bob/package",
  "version": "1.0.0",
  "dependencies": {
    "alice/package": {
      "version": "1.0.0 <= v < 2.0.0"
    }
  },
  "versions": [
    "0.1.0",
    "0.2.0",
    "1.0.0"
  ],
  "publishedDate" {
    "0.1.0": "...",
    "0.2.0": "...",
    "1.0.0": "..."
  }
}
```

#### Specific version

##### Request

```http
/info/bob/package?version=0.2.0
```

##### Response

```http
{
  "name": "bob/package",
  "version": "0.2.0",
  "dependencies": {},
  "versions": [
    "0.1.0",
    "0.2.0",
    "1.0.0"
  ],
  "publishedDate" {
    "0.1.0": "...",
    "0.2.0": "...",
    "1.0.0": "..."
  }
}
```

#### Latest in version range

##### Request

```http
/info/bob/package?version=1.0.0%20%3C%3D%20v%20%3C%202.0.0
```

##### Response

```http
{
  "name": "bob/package",
  "version": "1.0.0",
  "dependencies": {},
  "versions": [
    "0.1.0",
    "0.2.0",
    "1.0.0"
  ],
  "publishedDate" {
    "0.1.0": "...",
    "0.2.0": "...",
    "1.0.0": "..."
  }
}
```
