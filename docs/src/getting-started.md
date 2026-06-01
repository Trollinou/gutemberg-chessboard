# Quick start

## About

`gutemberg-chessboard` is a native Gutenberg block for WordPress, written in React (JSX) and TypeScript, using <a href="https://github.com/lichess-org/chessground">lichess chessground</a> and <a href="https://github.com/jhlywa/chess.js">chess.js</a> for the board logic.

## Installation

Install the package via npm:

```bash
npm install gutemberg-chessboard
```

## Basic WordPress Setup

Register the block inside your WordPress theme or plugin Javascript entry point:

```javascript
import { registerBlockType } from '@wordpress/blocks';
import Edit from 'gutemberg-chessboard/src/edit';
import Save from 'gutemberg-chessboard/src/save';
import metadata from 'gutemberg-chessboard/src/block.json';
import 'gutemberg-chessboard/dist/style.css';

registerBlockType(metadata.name, {
  edit: Edit,
  save: Save,
});
```
