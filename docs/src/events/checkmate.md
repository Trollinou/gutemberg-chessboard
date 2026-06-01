# Checkmate

Emitted when a player is checkmated.

## Definition

```ts
// Emit event signature
emit(event: 'checkmate', payload: 'white' | 'black'): void;
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
      const emit = (event, color) => {
        if (event === 'checkmate') {
          alert(`Checkmate! Game over. ${color} lost.`);
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
