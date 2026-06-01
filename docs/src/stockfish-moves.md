# Displaying Engine Moves

You can display visual hints for the best moves calculated by the Stockfish engine using the `drawMove` method in `BoardApi`.

This builds upon the "Play vs Stockfish" guide, drawing a pale blue arrow to suggest the engine's recommended path.

---

## Engine Communication Class

```ts
import { type BoardApi, type SquareKey } from 'gutemberg-chessboard';

export class Engine {
  private stockfish: Worker;
  private boardApi: BoardApi;
  public bestMove: string | null = null;

  constructor(boardApi: BoardApi) {
    this.boardApi = boardApi;
    const wasmSupported =
      typeof WebAssembly === 'object' &&
      WebAssembly.validate(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );

    this.stockfish = new Worker(
      wasmSupported ? 'stockfish.wasm.js' : 'stockfish.js'
    );

    this.setupListeners();
    this.stockfish.postMessage('uci');
  }

  private setupListeners(): void {
    this.stockfish.addEventListener('message', (e) => this.handleEngineStdout(e));
    this.stockfish.addEventListener('error', (err) => console.error(err));
  }

  private handleEngineStdout(e: MessageEvent<string>): void {
    const tokens = e.data.split(' ');

    if (tokens[0] === 'uciok') {
      this.setOption('UCI_AnalyseMode', 'true');
      this.setOption('Analysis Contempt', 'Off');
      this.stockfish.postMessage('ucinewgame');
      this.stockfish.postMessage('isready');
      return;
    }

    if (tokens[0] === 'readyok') {
      this.stockfish.postMessage('go movetime 1000');
      return;
    }

    if (tokens[0] === 'bestmove' && tokens[1]) {
      if (tokens[1] !== this.bestMove) {
        this.bestMove = tokens[1];
        const orig = this.bestMove.slice(0, 2) as SquareKey;
        const dest = this.bestMove.slice(2, 4) as SquareKey;
        // Draw the move hint on the board
        this.boardApi.drawMove(orig, dest, 'paleBlue');
      }
    }
  }

  private setOption(name: string, value: string): void {
    this.stockfish.postMessage(`setoption name ${name} value ${value}`);
  }

  public sendPosition(position: string): void {
    this.stockfish.postMessage(`position startpos moves ${position}`);
    this.stockfish.postMessage('go movetime 2000');
  }
}
```

---

## React Component Integration

Use callbacks inside `boardConfig` to handle player selection and move events, hiding previous arrows and displaying new engine hints:

```jsx
import { useEffect, useRef } from '@wordpress/element';
import { BoardApi } from 'gutemberg-chessboard/src/classes/BoardApi';
import { Engine } from './Engine';

export default function EngineHintsBoard() {
  const boardRef = useRef(null);
  const boardApiRef = useRef(null);
  const engineRef = useRef(null);

  const boardConfig = {
    events: {
      select: () => {
        // Redraw best move hint arrow if the player selects a square
        if (engineRef.current?.bestMove && boardApiRef.current) {
          const best = engineRef.current.bestMove;
          boardApiRef.current.drawMove(
            best.slice(0, 2),
            best.slice(2, 4),
            'paleBlue'
          );
        }
      },
      move: () => {
        // Hide move hints when playing a move
        boardApiRef.current?.hideMoves();
      }
    }
  };

  const handleMove = () => {
    const api = boardApiRef.current;
    if (!api || !engineRef.current) return;

    const history = api.getHistory(true);
    const moves = history.map((m) => (typeof m === 'object' ? m.lan : m));
    engineRef.current.sendPosition(moves.join(' '));
  };

  useEffect(() => {
    if (!boardRef.current) return;

    const boardState = {
      showThreats: false,
      promotionDialogState: { isEnabled: false },
      historyViewerState: { isEnabled: false }
    };

    const emit = (event, payload) => {
      if (event === 'boardCreated') {
        boardApiRef.current = payload;
        engineRef.current = new Engine(payload);
      } else if (event === 'move') {
        handleMove();
      }
    };

    const boardAPI = new BoardApi(boardRef.current, boardState, boardConfig, emit);

    return () => {
      if (boardAPI.board) boardAPI.board.destroy();
    };
  }, []);

  return <div ref={boardRef} />;
}
```
