# Callbacks

You can register custom callback functions on the chessboard through the `boardConfig` object under the `events` property.

> [!WARNING]
> The `move` callback inside `boardConfig.events` is executed by Chessground *before* the internal chess.js board state is updated. Accessing `BoardApi` methods during this callback may return stale info.
> For post-move logic, we recommend listening to the `move` event emitted by the component.

---

## Supported Callbacks

The following callbacks can be specified inside `boardConfig.events`:

* **`change()`** — Called after any state changes on the board.
* **`move(from, to, capturedPiece)`** — Called immediately after a piece has been moved on the board.
* **`select(key)`** — Called when a square on the board has been clicked or selected (e.g. `'e4'`).
* **`dropNewPiece(piece, key)`** — Called when a new piece is dropped on the board (e.g., in a board editor mode).
* **`insert(elements)`** — Called when the board DOM elements have been inserted or re-inserted.

---

## Example in React

```javascript
const boardConfig = {
  events: {
    change: () => {
      console.log('Something changed on the board!');
    },
    move: (from, to, capturedPiece) => {
      console.log(`Piece moved from ${from} to ${to}`);
      if (capturedPiece) {
        console.log('Captured piece:', capturedPiece);
      }
    },
    select: (key) => {
      console.log(`Square selected: ${key}`);
    }
  }
};
```
