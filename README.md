# 323-web-emulator

An emulator for the
[323](https://conwaylife.com/forums/viewtopic.php?f=2&t=6808) computer.

## Development

### Requirements

- `deno`
  - Above v2.0
  - <https://docs.deno.com/runtime/getting_started/installation/>

### Usage

#### Local Server

```sh
deno task dev
```

#### Unit tests

```sh
deno task t
```

with file watcher

```sh
deno task w
```

#### Production build

Output to the `dist` directory.

```sh
deno task build
```
