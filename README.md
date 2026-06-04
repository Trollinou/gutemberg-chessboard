# gutemberg-chessboard

A native Gutenberg chessboard block for WordPress, powered by [lichess chessground](https://github.com/lichess-org/chessground) & [chess.js](https://github.com/jhlywa/chess.js).

## Features

- Native Gutenberg Block interface
- Customizable chessboard via WordPress block settings/sidebar (Inspector Controls)
- Options to set starting position (FEN), board orientation, coordinates, and interactivity (View Only)
- Automatic pawn promotion overlays
- Built-in threats highlighting system

## Installation

Within your WordPress plugin or theme directory:

```bash
npm install gutemberg-chessboard
```

Then register the block in your block registrations or theme assets.

## Block Attributes

The block supports the following settings saved in the block metadata:

- **`fen`**: Chess position in Forsyth-Edwards Notation.
- **`orientation`**: Board orientation (`white` or `black`).
- **`coordinates`**: Whether to display board ranks and files labels.
- **`viewOnly`**: Set to true to disable piece dragging.
- **`playerColor`**: Moveable color (`both`, `white`, or `black`).
- **`showThreats`**: Overlay threat highlight lines/circles.
- **`boardConfig`**: Object configuration representing Chessground parameters.
- **`reactiveConfig`**: Enable reactive config updates (`boolean`).
- **`promotionDialogState`**: Internal object tracking pawn promotion dialog overlay.
- **`historyViewerState`**: Internal object tracking history navigation viewer.

## Exposing the Board API

For advanced integrations (like custom game navigation or backend integration), the `BoardApi` instance is attached directly to the `.gutemberg-chessboard-block` DOM elements:

```javascript
const block = document.querySelector('.gutemberg-chessboard-block');
if (block && block.boardAPI) {
  // Load a PGN game
  block.boardAPI.loadPgn('1. e4 e5 ...');
  
  // Navigate history
  block.boardAPI.viewHistory(2); // View position after 2nd move
  block.boardAPI.viewNext();     // View next move
}
```

## Origin & Attribution

This project is a complete rewrite of the original [vue3-chessboard](https://github.com/qwerty084/vue3-chessboard) Vue 3 component library, adapted to run as a native Gutenberg block in the React-based WordPress environment.

