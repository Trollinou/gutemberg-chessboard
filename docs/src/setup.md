# UCI Engines

## Introduction

## Installation/Setup

Install the stockfish browser version
::: code-group

```bash [npm]
npm i stockfish.js
```

```bash [yarn]
yarn add stockfish.js
```

```bash [pnpm]
pnpm install stockfish.js
```

:::

Copy all stockfish files (.wasm & .js files) into your public folder

::: code-group

```bash
cp node_modules/stockfish.js/stockfish.* public
```

```Powershell
Copy-Item -Path .\node_modules\stockfish.js\stockfish.* -Destination .\public\
```

## Creating a class for engine/board communication

Now we create a class for reading the engine stdout and forwarding the info like bestmove to the board.

```js

```
