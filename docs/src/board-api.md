# Board API

The `BoardApi` class is used to modify and retrieve information programmatically from the chessboard.

You get access to the API instance during the `boardCreated` event callback or by instantiating it directly in your custom React components.

---

## React Example

```jsx
import { useEffect, useRef } from '@wordpress/element';
import { BoardApi } from 'gutemberg-chessboard/src/classes/BoardApi';

export default function MyCustomChessBlock() {
  const boardRef = useRef(null);
  const boardApiRef = useRef(null);

  useEffect(() => {
    if (!boardRef.current) return;

    const boardState = {
      showThreats: false,
      promotionDialogState: { isEnabled: false },
      historyViewerState: { isEnabled: false }
    };

    const emit = (event, api) => {
      if (event === 'boardCreated') {
        boardApiRef.current = api;
        // Accessing Board API methods
        console.log('Board FEN:', api.getFen());
      }
    };

    const boardAPI = new BoardApi(boardRef.current, boardState, {}, emit);

    return () => {
      if (boardAPI.board) boardAPI.board.destroy();
    };
  }, []);

  return <div ref={boardRef} />;
}
```

---

## Available Methods

Here is the TypeScript signature list of all the methods available on the `BoardApi` instance:

```ts
/**
 * Resets the board to the initial starting configuration.
 */
resetBoard(): void;

/**
 * Undo last move, if possible.
 */
undoLastMove(): void;

/**
 * Returns the current material count for white, black and the diff.
 */
getMaterialCount(): MaterialDifference;

/**
 * Finds all the captured pieces from the game history.
 */
getCapturedPieces(): CapturedPieces;

/**
 * Toggles the board orientation (white / black player view).
 */
toggleOrientation(): void;

/**
 * Draws arrows and circles on the board for possible moves/captures.
 */
drawMoves(): void;

/**
 * Removes arrows and circles from the board for possible moves/captures.
 */
hideMoves(): void;

/**
 * Draws an arrow on the board from a square to another.
 */
drawMove(orig: Square, dest: Square, brushColor: BrushColor): void;

/**
 * Toggle drawing of arrows and circles on the board.
 */
toggleMoves(): void;

/**
 * Returns the opening name for the current position from lichess API.
 */
getOpeningName(): Promise<string | null>;

/**
 * Make a move programmatically on the board.
 */
move(move: string | Move): boolean;

/**
 * Returns the current turn color ('white' or 'black').
 */
getTurnColor(): Color;

/**
 * Returns the current board orientation ('white' or 'black').
 */
getOrientation(): Color;

/**
 * Returns all possible moves for the current position.
 */
getPossibleMoves(): Map<Key, Key[]> | undefined;

/**
 * Returns the current turn number.
 */
getCurrentTurnNumber(): number;

/**
 * Returns the current ply number.
 */
getCurrentPlyNumber(): number;

/**
 * Returns the latest move made on the board.
 */
getLastMove(): MoveEvent | undefined;

/**
 * Retrieves the move history.
 */
getHistory(): string[];
getHistory(verbose: false): string[];
getHistory(verbose: true): MoveEvent[];

/**
 * Returns the FEN string for the current position.
 */
getFen(): string;

/**
 * Returns the board position as a 2D array.
 */
getBoardPosition(): ({
  square: Square;
  type: PieceSymbol;
  color: ShortColor;
} | null)[][] ;

/**
 * Returns the PGN string for the current position.
 */
getPgn(): string;

/**
 * Returns true if the game is over.
 */
getIsGameOver(): boolean;

/**
 * Returns true if a player is checkmated.
 */
getIsCheckmate(): boolean;

/**
 * Returns true if a player is in check.
 */
getIsCheck(): boolean;

/**
 * Returns true if a player is in stalemate.
 */
getIsStalemate(): boolean;

/**
 * Returns true if a game is drawn.
 */
getIsDraw(): boolean;

/**
 * Returns true if a game is drawn by threefold repetition.
 */
getIsThreefoldRepetition(): boolean;

/**
 * Returns true if a game is drawn by insufficient material.
 */
getIsInsufficientMaterial(): boolean;

/**
 * Sets the board position to the given FEN string.
 */
setPosition(fen: string): void;

/**
 * Set the board configuration options.
 */
setConfig(config: BoardConfig, reset?: boolean): void;

/**
 * Views the position at the given ply number in the game's history.
 */
viewHistory(ply: number): void;

/**
 * Stops viewing history and returns the board to the present position.
 */
stopViewingHistory(): void;

/**
 * Views the starting position of this game.
 */
viewStart(): void;

/**
 * If viewing history, views the move after the one currently being viewed.
 */
viewNext(): void;

/**
 * If viewing history, views the previous move to the one currently being viewed.
 */
viewPrevious(): void;
```
