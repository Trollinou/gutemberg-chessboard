# Promotion

Emitted when a pawn is promoted to another piece (Queen, Rook, Bishop, or Knight).

## Definition

```ts
// Emit event signature
emit(event: 'promotion', payload: PromotionEvent): void;
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
      const emit = (event, promotion) => {
        if (event === 'promotion') {
          console.log(`Pawn promoted to ${promotion.promotedTo} by ${promotion.color}`);
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
