# Board Created

Emitted when the board component is mounted and the BoardApi instance is fully available.

## Definition

```ts
// Emit event signature
emit(event: 'board-created', payload: BoardApi): void;
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
      const emit = (event, boardApi) => {
        if (event === 'boardCreated') {
          console.log('Board initialized! Current position:', boardApi.getFen());
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
