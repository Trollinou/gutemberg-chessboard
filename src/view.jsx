import { BoardApi } from './classes/BoardApi';

document.addEventListener('DOMContentLoaded', async () => {
  const blocks = document.querySelectorAll('.gutemberg-chessboard-block');

  for (const block of blocks) {
    const mountElement = block.querySelector('.chessboard-mount-element');
    if (!mountElement) continue;

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

    let makeStockfishMove = () => {
      if (boardAPI.getIsGameOver()) return;
      const turnColor = boardAPI.getTurnColor();
      const positionCmd = getEnginePositionCommand();

      if (turnColor === currentStockfishColor) {
        if (stockfishManager) {
          if (clockSettings.preset !== 'none') {
            const timeParams = `wtime ${clockSettings.wtime} winc ${clockSettings.winc} btime ${clockSettings.btime} binc ${clockSettings.binc}`;
            stockfishManager.startOpponentMove(positionCmd, timeParams);
          } else {
            stockfishManager.startOpponentMove(positionCmd, 5000);
          }
        }
      } else {
        if (stockfishManager) {
          stockfishManager.startEvaluation(positionCmd);
        }
      }
    };
    let updateEvaluationBar = () => {};
    let currentStockfishColor = null;
    let currentStockfishElo = stockfishElo;
    let stockfishManager = null;
    let lastScoreType = 'cp';
    let lastScoreValue = 0;
    let lastSuggestedMove = '';
    let isHintEnabled = false;

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
        statusElement.textContent = boardAPI.getGameOverReason();
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

    // Clock Settings & State Variables
    const initialClockPreset = block.getAttribute('data-clock-preset') || 'none';
    const clockSettings = {
      preset: initialClockPreset,
      wtime: 0,
      btime: 0,
      winc: 0,
      binc: 0,
    };
    let activeClockColor = null;
    let clockInterval = null;
    let timerTenths = 0;

    const initClockSettings = (preset) => {
      clockSettings.preset = preset;
      if (preset === '1+0') {
        clockSettings.wtime = 60000;
        clockSettings.btime = 60000;
        clockSettings.winc = 0;
        clockSettings.binc = 0;
      } else if (preset === '3+2') {
        clockSettings.wtime = 180000;
        clockSettings.btime = 180000;
        clockSettings.winc = 2000;
        clockSettings.binc = 2000;
      } else if (preset === '5+0') {
        clockSettings.wtime = 300000;
        clockSettings.btime = 300000;
        clockSettings.winc = 0;
        clockSettings.binc = 0;
      } else if (preset === '10+5') {
        clockSettings.wtime = 600000;
        clockSettings.btime = 600000;
        clockSettings.winc = 5000;
        clockSettings.binc = 5000;
      } else if (preset === '15+10') {
        clockSettings.wtime = 900000;
        clockSettings.btime = 900000;
        clockSettings.winc = 10000;
        clockSettings.binc = 10000;
      } else {
        clockSettings.wtime = 0;
        clockSettings.btime = 0;
        clockSettings.winc = 0;
        clockSettings.binc = 0;
      }
    };
    initClockSettings(initialClockPreset);

    const formatClockTime = (timeMs) => {
      if (timeMs <= 0) return '00:00';
      const totalSeconds = timeMs / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);

      if (totalSeconds < 10) {
        const tenths = Math.floor((timeMs % 1000) / 100);
        return `${seconds}.${tenths}`;
      }

      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const updateClockDisplays = () => {
      const orientation = boardAPI.getOrientation();
      const oppColor = orientation === 'white' ? 'black' : 'white';
      const playerClockEl = block.querySelector('.player-clock');
      const opponentClockEl = block.querySelector('.opponent-clock');

      if (playerClockEl) {
        const playerTime = orientation === 'white' ? clockSettings.wtime : clockSettings.btime;
        playerClockEl.textContent = formatClockTime(playerTime);
        playerClockEl.classList.toggle('active', activeClockColor === orientation);
      }
      if (opponentClockEl) {
        const opponentTime = oppColor === 'white' ? clockSettings.wtime : clockSettings.btime;
        opponentClockEl.textContent = formatClockTime(opponentTime);
        opponentClockEl.classList.toggle('active', activeClockColor === oppColor);
      }
    };

    const handleTimeOut = (flaggedColor) => {
      stopTimer();
      boardAPI.setConfig({ viewOnly: true });
      activeClockColor = null;

      const winner = flaggedColor === 'white' ? 'Noirs' : 'Blancs';
      if (statusElement) {
        statusElement.textContent = `🏁 Perdu au temps ! Les ${winner} ont gagné.`;
      }
      updateClockDisplays();
    };

    const startTimer = () => {
      if (clockInterval) return;
      clockInterval = setInterval(() => {
        timerTenths++;

        if (clockSettings.preset !== 'none' && activeClockColor) {
          if (activeClockColor === 'white') {
            clockSettings.wtime = Math.max(0, clockSettings.wtime - 100);
            if (clockSettings.wtime <= 0) {
              handleTimeOut('white');
            }
          } else {
            clockSettings.btime = Math.max(0, clockSettings.btime - 100);
            if (clockSettings.btime <= 0) {
              handleTimeOut('black');
            }
          }
          updateClockDisplays();
        }
      }, 100);
    };

    const stopTimer = () => {
      if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
      }
    };

    // Initialize clock display at load
    updateClockDisplays();

    const initialFen =
      fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // Helper to build position command
    const getEnginePositionCommand = () => {
      const history = boardAPI.getHistory(true) || [];
      const movesStr = history
        .map((m) => m.from + m.to + (m.promotion ? m.promotion : ''))
        .join(' ');
      return movesStr
        ? `position startpos moves ${movesStr}`
        : `position fen ${initialFen}`;
    };

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
        const { StockfishManager } = await import('./classes/stockfishManager.ts');
        stockfishManager = new StockfishManager(workerUrl);

        stockfishManager.setCallbacks({
          onBestMove: (bestMove) => {
            const from = bestMove.slice(0, 2);
            const to = bestMove.slice(2, 4);
            const promotion =
              bestMove.length > 4 ? bestMove.charAt(4) : undefined;
            boardAPI.move({ from, to, promotion });
          },
          onEvaluation: (scoreType, scoreValue) => {
            updateEvaluationBar(scoreType, scoreValue);
          },
          onHint: (bestMove) => {
            lastSuggestedMove = bestMove;
            if (isHintEnabled) {
              const from = bestMove.slice(0, 2);
              const to = bestMove.slice(2, 4);
              boardAPI.drawMove(from, to, 'green');
            }
          }
        });

        // Initialize both workers
        stockfishManager.initEvaluationWorker();
        stockfishManager.initOpponentWorker(currentStockfishElo);

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

          // Read chosen cadence select option
          const cadenceSelect = configDialog.querySelector('.cadence-select');
          const chosenPreset = cadenceSelect ? cadenceSelect.value : 'none';
          clockSettings.preset = chosenPreset;

          // Configure Preset parameters
          if (chosenPreset === '1+0') {
            clockSettings.wtime = 60000;
            clockSettings.btime = 60000;
            clockSettings.winc = 0;
            clockSettings.binc = 0;
          } else if (chosenPreset === '3+2') {
            clockSettings.wtime = 180000;
            clockSettings.btime = 180000;
            clockSettings.winc = 2000;
            clockSettings.binc = 2000;
          } else if (chosenPreset === '5+0') {
            clockSettings.wtime = 300000;
            clockSettings.btime = 300000;
            clockSettings.winc = 0;
            clockSettings.binc = 0;
          } else if (chosenPreset === '10+5') {
            clockSettings.wtime = 600000;
            clockSettings.btime = 600000;
            clockSettings.winc = 5000;
            clockSettings.binc = 5000;
          } else if (chosenPreset === '15+10') {
            clockSettings.wtime = 900000;
            clockSettings.btime = 900000;
            clockSettings.winc = 10000;
            clockSettings.binc = 10000;
          } else {
            clockSettings.wtime = 0;
            clockSettings.btime = 0;
            clockSettings.winc = 0;
            clockSettings.binc = 0;
          }

          // Toggle display of clocks
          const topBar = block.querySelector('.captured-clock-top');
          const bottomBar = block.querySelector('.captured-clock-bottom');
          if (topBar && bottomBar) {
            if (chosenPreset !== 'none') {
              topBar.style.display = 'flex';
              bottomBar.style.display = 'flex';
            } else {
              topBar.style.display = 'none';
              bottomBar.style.display = 'none';
            }
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
          if (stockfishManager) {
            stockfishManager.initOpponentWorker(currentStockfishElo);
            stockfishManager.setOpponentElo(currentStockfishElo);
          }

          updateStatus();
          // Reset evaluation bar to equal position at start of a new game
          updateEvaluationBar('cp', 0);

          stopTimer();
          timerTenths = 0;
          activeClockColor = null;
          updateClockDisplays();

          // Ask Stockfish to move if Stockfish plays White
          if (playerChosenColor === 'black') {
            activeClockColor = 'white';
            startTimer();
            makeStockfishMove();
          } else {
            activeClockColor = 'white'; // Turn is white
          }
        });
      }
    }

    // Control buttons event listeners
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        stopTimer();
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
        updateClockDisplays();
      });
    }

    if (undoMoveBtn) {
      undoMoveBtn.addEventListener('click', () => {
        boardAPI.undoMove(useStockfish);
        // Reset timers active state or revert plies
        updateStatus();
      });
    }

    // Replace emit to handle timer ticks and moves
    const newEmit = (event, val) => {
      if (event === 'move') {
        updateStatus();

        const turnColor = boardAPI.getTurnColor();
        const plyCount = boardAPI.getCurrentPlyNumber();

        // Increment Fischer Time
        const justFinishedColor = turnColor === 'white' ? 'black' : 'white';
        if (clockSettings.preset !== 'none' && plyCount > 1) {
          if (justFinishedColor === 'white') {
            clockSettings.wtime += clockSettings.winc;
            if (plyCount === 80) clockSettings.wtime += 30000;
          } else {
            clockSettings.btime += clockSettings.binc;
            if (plyCount === 81) clockSettings.btime += 30000;
          }
        }

        if (plyCount === 1) {
          startTimer();
        }

        activeClockColor = turnColor;
        updateClockDisplays();

        setTimeout(() => {
          if (boardAPI.getTurnColor() === currentStockfishColor) {
            const positionCmd = getEnginePositionCommand();
            if (clockSettings.preset !== 'none') {
              const timeParams = `wtime ${clockSettings.wtime} winc ${clockSettings.winc} btime ${clockSettings.btime} binc ${clockSettings.binc}`;
              stockfishManager.startOpponentMove(positionCmd, timeParams);
            } else {
              stockfishManager.startOpponentMove(positionCmd, 5000);
            }
          } else {
            stockfishManager.startEvaluation(getEnginePositionCommand());
          }
        }, 100);
      } else if (['check', 'checkmate', 'draw', 'stalemate'].includes(event)) {
        stopTimer();
        updateStatus();
      }
    };

    // Patch emit on boardAPI
    boardAPI.emit = newEmit;

    // Initial status check
    updateStatus();

    if (showThreats) {
      boardAPI.drawMoves();
    }
  }
});
