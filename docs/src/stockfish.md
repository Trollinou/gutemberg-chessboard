# Play vs Stockfish

You can play against the Stockfish engine by leveraging the programmatic APIs like `move` and custom events from `BoardApi`.

This setup uses [stockfish.js](https://github.com/lichess-org/stockfish.js) (either a webassembly or javascript implementation depending on the browser) running in a background web worker.

---

## Setup

`gutemberg-chessboard` does not ship with engine support out of the box, but it is easy to interface it using the `BoardApi` instance.

### 1. Install stockfish.js

```bash
npm install stockfish.js
```

### 2. Move Stockfish assets to your public folder

```bash
# Bash
cp node_modules/stockfish.js/stockfish.* public/

# Powershell
Copy-Item -Path .\node_modules\stockfish.js\stockfish.* -Destination .\public\
```

---

## Engine Communication Class

Create a helper class to communicate with the Stockfish web worker and handle UCI protocols:

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
      this.stockfish.postMessage('go movetime 1500');
      return;
    }

    if (tokens[0] === 'bestmove' && tokens[1]) {
      if (tokens[1] !== this.bestMove) {
        this.bestMove = tokens[1];
        if (this.boardApi.getTurnColor() === 'black') {
          this.boardApi.move({
            from: this.bestMove.slice(0, 2) as SquareKey,
            to: this.bestMove.slice(2, 4) as SquareKey,
          });
        }
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

Now, instantiate the `Engine` and connect it via the `boardCreated` and `move` events:

```jsx
import { useEffect, useRef } from '@wordpress/element';
import { BoardApi } from 'gutemberg-chessboard/src/classes/BoardApi';
import { Engine } from './Engine';

export default function PlayVsStockfish() {
  const boardRef = useRef(null);
  const boardApiRef = useRef(null);
  const engineRef = useRef(null);

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

    const boardAPI = new BoardApi(boardRef.current, boardState, { playerColor: 'white' }, emit);

    return () => {
      if (boardAPI.board) boardAPI.board.destroy();
    };
  }, []);

  return <div ref={boardRef} />;
}
```
