# Available Events & Callbacks

The `gutemberg-chessboard` block and the underlying `BoardApi` emit events and support callback integrations to react to changes on the chessboard.

## List of Events

When instantiating `BoardApi`, you pass an `emit` callback function to capture the following events:

* **`boardCreated`** — Emitted when the board is mounted and `BoardApi` is fully available.
* **`check`** — Emitted when a player is in check (arguments: `'white'` or `'black'`).
* **`checkmate`** — Emitted when the game ends in checkmate (arguments: `'white'` or `'black'`).
* **`stalemate`** — Emitted when the game ends in a stalemate.
* **`draw`** — Emitted when the game ends in a draw.
* **`move`** — Emitted after a piece has been moved (arguments: full `MoveEvent` from `chess.js`).
* **`promotion`** — Emitted when a pawn is promoted (arguments: `PromotionEvent` containing promotion details).

---

## Event Emits Definition

The emit handler has the following TypeScript signature:

```ts
export interface Emits {
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'check' | 'checkmate', color: PieceColor): void;
  (e: 'stalemate'): void;
  (e: 'draw'): void;
  (e: 'promotion', promotion: PromotionEvent): void;
  (e: 'move', move: MoveEvent): void;
}
```

---

## Example Usage in React

To handle these events in your React component, define an `emit` function and pass it when constructing `BoardApi`:

```jsx
import { useEffect, useRef } from '@wordpress/element';
import { BoardApi } from 'gutemberg-chessboard/src/classes/BoardApi';

export default function MyCustomChessBlock() {
  const boardRef = useRef(null);

  useEffect(() => {
    if (!boardRef.current) return;

    const boardState = {
      showThreats: false,
      promotionDialogState: { isEnabled: false },
      historyViewerState: { isEnabled: false }
    };

    const props = {
      boardConfig: { fen: 'start' }
    };

    // Define the custom event emitter
    const emit = (event, payload) => {
      switch (event) {
        case 'checkmate':
          alert(`Game Over! ${payload} is checkmated.`);
          break;
        case 'check':
          console.warn(`Check! ${payload} is checked.`);
          break;
        case 'move':
          console.log('Move played:', payload);
          break;
        default:
          break;
      }
    };

    const boardAPI = new BoardApi(boardRef.current, boardState, props, emit);

    return () => {
      if (boardAPI.board) {
        boardAPI.board.destroy();
      }
    };
  }, []);

  return <div ref={boardRef} className="my-chessboard" />;
}
```
