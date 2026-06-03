import { BoardApi } from './classes/BoardApi';

document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.gutemberg-chessboard-block');

  blocks.forEach((block) => {
    const mountElement = block.querySelector('.chessboard-mount-element');
    if (!mountElement) return;

    // Read attributes from data-* attributes
    const fen = block.getAttribute('data-fen');
    const orientation = block.getAttribute('data-orientation') || 'white';
    const coordinates = block.getAttribute('data-coordinates') !== 'false';
    const viewOnly = block.getAttribute('data-view-only') === 'true';
    const playerColor = block.getAttribute('data-player-color') || 'both';
    const showThreats = block.getAttribute('data-show-threats') === 'true';
    const useStockfish = block.getAttribute('data-use-stockfish') === 'true';
    const stockfishElo = parseInt(
      block.getAttribute('data-stockfish-elo') || '1500',
      10
    );

    const boardConfig = {
      fen,
      orientation,
      coordinates,
      viewOnly,
    };

    const mockProps = {
      boardConfig,
      playerColor,
      reactiveConfig: false,
    };

    const promotionPieces = [
      { name: 'Queen', data: 'q' },
      { name: 'Knight', data: 'n' },
      { name: 'Rook', data: 'r' },
      { name: 'Bishop', data: 'b' },
    ];

    // Minimal state for frontend interaction
    const state = {
      showThreats,
      _promotionDialogState: { isEnabled: false },
      get promotionDialogState() {
        return this._promotionDialogState;
      },
      set promotionDialogState(val) {
        this._promotionDialogState = val;
        if (val && val.isEnabled) {
          const mainBoard = block.querySelector('.main-board');
          if (!mainBoard) return;

          const existingDialog = mainBoard.querySelector('.promotion-dialog');
          if (existingDialog) existingDialog.remove();

          const dialog = document.createElement('dialog');
          dialog.className = 'promotion-dialog';
          dialog.setAttribute('open', '');

          promotionPieces.forEach((piece) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `${piece.name.toLowerCase()} ${val.color}`;
            btn.setAttribute('aria-label', piece.name);

            const selectPiece = (e) => {
              e.preventDefault();
              val.callback(piece.data);
              dialog.remove();
              state._promotionDialogState = { isEnabled: false };
            };

            btn.addEventListener('click', selectPiece);
            btn.addEventListener('touchstart', selectPiece);
            dialog.appendChild(btn);
          });

          mainBoard.appendChild(dialog);
        }
      },
      historyViewerState: { isEnabled: false },
    };

    let makeStockfishMove = () => {};

    const emit = (event, val) => {
      if (event === 'move') {
        setTimeout(() => {
          makeStockfishMove();
        }, 100);
      }
    };

    const boardAPI = new BoardApi(mountElement, state, mockProps, emit);

    const stockfishColor =
      playerColor === 'white'
        ? 'black'
        : playerColor === 'black'
        ? 'white'
        : null;

    if (useStockfish && stockfishColor) {
      const viewScript = document.querySelector(
        'script[src*="gutemberg-chessboard-view.js"]'
      );
      let workerUrl = '';
      if (viewScript) {
        workerUrl = viewScript.src.replace(
          'gutemberg-chessboard-view.js',
          'stockfish.js'
        );
      } else {
        workerUrl =
          '/wp-content/plugins/gutemberg-chessboard/dist/stockfish.js';
      }

      const stockfishWorker = new Worker(workerUrl);
      const initialFen =
        fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

      // Configure Stockfish
      stockfishWorker.postMessage('uci');
      stockfishWorker.postMessage('ucinewgame');
      stockfishWorker.postMessage(
        'setoption name UCI_LimitStrength value true'
      );
      stockfishWorker.postMessage(
        `setoption name UCI_Elo value ${stockfishElo}`
      );
      stockfishWorker.postMessage('isready');

      makeStockfishMove = () => {
        if (boardAPI.getIsGameOver()) return;
        const turnColor = boardAPI.getTurnColor(); // 'white' or 'black'
        if (turnColor === stockfishColor) {
          const history = boardAPI.getHistory(true) || [];
          const movesStr = history
            .map((m) => m.from + m.to + (m.promotion ? m.promotion : ''))
            .join(' ');
          const positionCommand = movesStr
            ? `position fen ${initialFen} moves ${movesStr}`
            : `position fen ${initialFen}`;

          stockfishWorker.postMessage(positionCommand);
          stockfishWorker.postMessage('go movetime 1500');
        }
      };

      const updateEvaluationBar = (scoreType, scoreValue) => {
        const barFill = block.querySelector('.evaluation-bar-fill');
        if (!barFill) return;

        let scoreFromWhite = 0;
        if (scoreType === 'cp') {
          scoreFromWhite =
            stockfishColor === 'white' ? scoreValue : -scoreValue;
        } else if (scoreType === 'mate') {
          const isWhiteAdvantage =
            (stockfishColor === 'white' && scoreValue > 0) ||
            (stockfishColor === 'black' && scoreValue < 0);
          scoreFromWhite = isWhiteAdvantage ? 1000 : -1000;
        }

        const clampedScore = Math.max(-1000, Math.min(1000, scoreFromWhite));
        const percentageWhite = 50 + (clampedScore / 1000) * 50;
        const currentOrientation =
          block.getAttribute('data-orientation') || 'white';

        if (currentOrientation === 'white') {
          barFill.style.height = `${percentageWhite}%`;
          barFill.style.marginTop = 'auto';
          barFill.style.marginBottom = '0';
        } else {
          barFill.style.height = `${percentageWhite}%`;
          barFill.style.marginTop = '0';
          barFill.style.marginBottom = 'auto';
        }
      };

      stockfishWorker.onmessage = (event) => {
        const line = event.data;

        // Parse evaluation information
        if (line.startsWith('info ')) {
          const parts = line.split(' ');
          const scoreIndex = parts.indexOf('score');
          if (scoreIndex !== -1 && scoreIndex + 2 < parts.length) {
            const scoreType = parts[scoreIndex + 1]; // 'cp' or 'mate'
            const scoreValue = parseInt(parts[scoreIndex + 2], 10);
            if (scoreType === 'cp') {
              updateEvaluationBar('cp', scoreValue);
            } else if (scoreType === 'mate') {
              updateEvaluationBar('mate', scoreValue);
            }
          }
        }

        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          const bestMove = parts[1];
          if (bestMove && bestMove !== '(none)') {
            const from = bestMove.slice(0, 2);
            const to = bestMove.slice(2, 4);
            const promotion =
              bestMove.length > 4 ? bestMove.charAt(4) : undefined;
            boardAPI.move({ from, to, promotion });
          }
        }
      };

      // Check for first move
      makeStockfishMove();
    }

    if (showThreats) {
      boardAPI.drawMoves();
    }
  });
});
