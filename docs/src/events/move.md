# Move

Emitted after each move made on the board.

## Definition

```ts
// Emit event signature
emit(event: 'move', payload: MoveEvent (from chess.js)): void;
```

## React Integration Example

```jsx
import { useEffect, useRef } from '@wordpress/element';
import { BoardApi } from 'gutemberg-chessboard/src/classes/BoardApi';

export default function MyChessBoard() {
  const boardRef = useRef(null);

  useEffect(() => {
    if (!boardRef.current) return;

    const boardState = {
      showThreats: false,
      promotionDialogState: { isEnabled: false },
      historyViewerState: { isEnabled: false }
    };

    const emit = (event, payload) => {
      const emit = (event, move) => {
        if (event === 'move') {
          console.log(`Move played: ${move.san} (from ${move.from} to ${move.to})`);
        }
      };
    };

    const boardAPI = new BoardApi(boardRef.current, boardState, {}, emit);

    return () => {
      if (boardAPI.board) boardAPI.board.destroy();
    };
  }, []);

  return <div ref={boardRef} />;
}
```
