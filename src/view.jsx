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

    const freeMode = block.getAttribute('data-free-mode') === 'true';

    // If using Stockfish, the board starts in viewOnly until "Commencer" is clicked
    const initialViewOnly = useStockfish ? true : viewOnly;

    const boardConfig = {
      fen,
      orientation,
      coordinates,
      viewOnly: initialViewOnly,
    };

    const mockProps = {
      boardConfig,
      playerColor,
      reactiveConfig: false,
      freeMode,
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
    let updateEvaluationBar = () => {};
    let currentStockfishColor = null;
    let currentStockfishElo = stockfishElo;
    let stockfishWorker = null;
    let lastScoreType = 'cp';
    let lastScoreValue = 0;

    // DOM Elements for Visitor Interface
    const configDialog = block.querySelector('.chess-config-dialog');
    const colorBtns = block.querySelectorAll('.color-btn');
    const eloSlider = block.querySelector('.elo-slider');
    const eloValueDisplay = block.querySelector('.elo-value');
    const startBtn = block.querySelector('.start-btn');
    const statusElement = block.querySelector('.chess-status');
    const newGameBtn = block.querySelector('.control-btn.new-game');
    const flipBoardBtn = block.querySelector('.control-btn.flip-board');
    const undoMoveBtn = block.querySelector('.control-btn.undo-move');

    // Status updater
    const updateStatus = () => {
      if (!statusElement) return;

      if (
        useStockfish &&
        configDialog &&
        configDialog.style.display !== 'none'
      ) {
        statusElement.textContent =
          'Choisissez vos options et commencez la partie.';
        return;
      }

      if (boardAPI.getIsGameOver()) {
        if (boardAPI.getIsCheckmate()) {
          const loserColor = boardAPI.getTurnColor();
          const winnerText = loserColor === 'white' ? 'Noirs' : 'Blancs';
          statusElement.textContent = `Échec et mat ! Les ${winnerText} ont gagné. Partie terminée.`;
        } else if (boardAPI.getIsStalemate()) {
          statusElement.textContent = 'Pat ! Partie nulle.';
        } else if (boardAPI.getIsThreefoldRepetition()) {
          statusElement.textContent = 'Partie nulle - Répétition de position !';
        } else if (boardAPI.getIsInsufficientMaterial()) {
          statusElement.textContent = 'Partie nulle - Matériel insuffisant !';
        } else if (boardAPI.getIsDraw()) {
          statusElement.textContent =
            'Partie nulle - Règle des 50 coups ou accord !';
        }
        return;
      }

      if (boardAPI.getIsCheck()) {
        const inCheckColor =
          boardAPI.getTurnColor() === 'white' ? 'Blancs' : 'Noirs';
        statusElement.textContent = `Échec ! Au tour des ${inCheckColor}.`;
      } else {
        const turnColor = boardAPI.getTurnColor();
        if (useStockfish) {
          if (turnColor === currentStockfishColor) {
            statusElement.textContent = 'Le moteur réfléchit...';
          } else {
            statusElement.textContent = 'À vous de jouer.';
          }
        } else {
          statusElement.textContent = `Au tour des ${
            turnColor === 'white' ? 'Blancs' : 'Noirs'
          }.`;
        }
      }
    };

    const emit = (event, _val) => {
      if (event === 'move') {
        updateStatus();
        setTimeout(() => {
          makeStockfishMove();
        }, 100);
      } else if (['check', 'checkmate', 'draw', 'stalemate'].includes(event)) {
        updateStatus();
      }
    };

    const boardAPI = new BoardApi(mountElement, state, mockProps, emit);
    block.boardAPI = boardAPI;

    const initialFen =
      fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    if (useStockfish) {
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

      try {
        stockfishWorker = new Worker(workerUrl);

        // Configure Stockfish
        stockfishWorker.postMessage('uci');
        stockfishWorker.postMessage('ucinewgame');
        stockfishWorker.postMessage(
          'setoption name UCI_LimitStrength value true'
        );
        stockfishWorker.postMessage(
          `setoption name UCI_Elo value ${currentStockfishElo}`
        );
        stockfishWorker.postMessage('isready');

        makeStockfishMove = () => {
          if (boardAPI.getIsGameOver()) return;
          const turnColor = boardAPI.getTurnColor(); // 'white' or 'black'
          if (turnColor === currentStockfishColor) {
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

        updateEvaluationBar = (scoreType, scoreValue) => {
          if (scoreType !== undefined) {
            lastScoreType = scoreType;
            lastScoreValue = scoreValue;
          }

          const barFill = block.querySelector('.evaluation-bar-fill');
          if (!barFill) return;
          const barContainer = block.querySelector('.evaluation-bar');

          let scoreFromWhite = 0;
          if (lastScoreType === 'cp') {
            scoreFromWhite =
              currentStockfishColor === 'white' ? lastScoreValue : -lastScoreValue;
          } else if (lastScoreType === 'mate') {
            const isWhiteAdvantage =
              (currentStockfishColor === 'white' && lastScoreValue > 0) ||
              (currentStockfishColor === 'black' && lastScoreValue < 0);
            scoreFromWhite = isWhiteAdvantage ? 1000 : -1000;
          }

          if (barContainer) {
            let tooltipText = '';
            if (lastScoreType === 'cp') {
              const evalFromWhite = scoreFromWhite / 100;
              const sign = evalFromWhite > 0 ? '+' : '';
              tooltipText = `${sign}${evalFromWhite.toFixed(2)}`;
            } else if (lastScoreType === 'mate') {
              const isWhiteAdvantage =
                (currentStockfishColor === 'white' && lastScoreValue > 0) ||
                (currentStockfishColor === 'black' && lastScoreValue < 0);
              const absMoves = Math.abs(lastScoreValue);
              const sideChar = isWhiteAdvantage ? 'B' : 'N';
              tooltipText = `Mat #${absMoves}${sideChar}`;
            }
            barContainer.setAttribute('title', tooltipText);
          }

          const clampedScore = Math.max(-1000, Math.min(1000, scoreFromWhite));
          const percentageWhite = 50 + (clampedScore / 1000) * 50;
          const currentOrientation = boardAPI.getOrientation();

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
      } catch (err) {
        console.error('Stockfish Worker failed to load:', err);
      }
    }

    // Set up Visitor interface event listeners
    if (useStockfish && configDialog) {
      // Color selector click handlers
      colorBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          colorBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      // Elo slider dynamic text change
      if (eloSlider && eloValueDisplay) {
        eloSlider.addEventListener('input', (e) => {
          eloValueDisplay.textContent = e.target.value;
        });
      }

      // Start game click handler
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          const activeColorBtn = block.querySelector('.color-btn.active');
          const chosenColor = activeColorBtn
            ? activeColorBtn.getAttribute('data-color')
            : 'white';
          const playerChosenColor =
            chosenColor === 'random'
              ? Math.random() < 0.5
                ? 'white'
                : 'black'
              : chosenColor;

          currentStockfishColor =
            playerChosenColor === 'white' ? 'black' : 'white';

          if (eloSlider) {
            currentStockfishElo = parseInt(eloSlider.value, 10);
          }

          // Hide configuration dialog
          configDialog.style.display = 'none';

          // Update player color first to ensure state synchronization
          mockProps.playerColor = playerChosenColor;

          // Reset board position and orientation, and enable interactivity
          boardAPI.resetBoard();
          boardAPI.setConfig({
            viewOnly: false,
            orientation: playerChosenColor,
            fen: boardAPI.getFen(),
          });

          // Configure Stockfish level strength and new game ELO
          if (stockfishWorker) {
            stockfishWorker.postMessage('ucinewgame');
            stockfishWorker.postMessage(
              'setoption name UCI_LimitStrength value true'
            );
            stockfishWorker.postMessage(
              `setoption name UCI_Elo value ${currentStockfishElo}`
            );
            stockfishWorker.postMessage('isready');
          }

          updateStatus();
          // Reset evaluation bar to equal position at start of a new game
          updateEvaluationBar('cp', 0);
          // Ask Stockfish to move if Stockfish plays White
          makeStockfishMove();
        });
      }
    }

    // Control buttons event listeners
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        boardAPI.resetBoard();
        if (useStockfish && configDialog) {
          boardAPI.setConfig({ viewOnly: true });
          configDialog.style.display = 'flex';
        }
        updateStatus();
      });
    }

    if (flipBoardBtn) {
      flipBoardBtn.addEventListener('click', () => {
        boardAPI.toggleOrientation();
        updateEvaluationBar();
      });
    }

    if (undoMoveBtn) {
      undoMoveBtn.addEventListener('click', () => {
        if (useStockfish) {
          const turnColor = boardAPI.getTurnColor();
          if (turnColor === currentStockfishColor) {
            boardAPI.undoLastMove();
          } else {
            boardAPI.undoLastMove();
            boardAPI.undoLastMove();
          }
        } else {
          boardAPI.undoLastMove();
        }
        updateStatus();
      });
    }

    // Initial status check
    updateStatus();

    if (showThreats) {
      boardAPI.drawMoves();
    }
  });
});
