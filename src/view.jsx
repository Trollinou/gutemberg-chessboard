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

    // Minimal state for frontend interaction
    const state = {
      showThreats,
      promotionDialogState: { isEnabled: false },
      historyViewerState: { isEnabled: false },
    };

    const emit = (event, val) => {
      // Handle frontend events if needed (e.g. piece moves)
    };

    const boardAPI = new BoardApi(mountElement, state, mockProps, emit);

    if (showThreats) {
      boardAPI.drawMoves();
    }
  });
});
