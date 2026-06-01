import React from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { BoardApi } from './classes/BoardApi';
import PromotionDialog from './components/PromotionDialog';

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();
  const boardRef = useRef(null);
  const boardApiRef = useRef(null);

  // Vue reactive equivalent state
  const [boardState, setBoardState] = useState({
    showThreats: attributes.showThreats,
    promotionDialogState: { isEnabled: false },
    historyViewerState: { isEnabled: false },
  });

  const boardStateRef = useRef(boardState);
  useEffect(() => {
    boardStateRef.current = boardState;
  }, [boardState]);

  // Sync state with showThreats attribute
  useEffect(() => {
    setBoardState((prev) => ({ ...prev, showThreats: attributes.showThreats }));
  }, [attributes.showThreats]);

  useEffect(() => {
    if (!boardRef.current) return;

    const boardConfig = {
      fen: attributes.fen,
      orientation: attributes.orientation,
      coordinates: attributes.coordinates,
      viewOnly: attributes.viewOnly,
      ...attributes.boardConfig,
    };

    const mockProps = {
      boardConfig,
      playerColor: attributes.playerColor,
      reactiveConfig: attributes.reactiveConfig,
    };

    // Proxy to intercept mutations in BoardApi.ts
    const boardStateProxy = new Proxy(boardStateRef.current, {
      set(target, prop, value) {
        target[prop] = value;
        setBoardState({ ...target });
        return true;
      },
    });

    const emit = (event, val) => {
      if (event === 'move') {
        setAttributes({ fen: val.after });
      }
    };

    const boardAPI = new BoardApi(boardRef.current, boardStateProxy, mockProps, emit);
    boardApiRef.current = boardAPI;

    if (attributes.showThreats) {
      boardAPI.drawMoves();
    }

    return () => {
      if (boardAPI.board) {
        boardAPI.board.destroy();
      }
    };
  }, [
    attributes.fen,
    attributes.orientation,
    attributes.coordinates,
    attributes.viewOnly,
    attributes.playerColor,
  ]);

  useEffect(() => {
    if (boardApiRef.current) {
      if (attributes.showThreats) {
        boardApiRef.current.drawMoves();
      } else {
        boardApiRef.current.hideMoves();
      }
    }
  }, [attributes.showThreats]);

  const wrapClasses = [
    'main-wrap',
    boardState.promotionDialogState.isEnabled ? 'disabledBoard' : '',
    boardState.historyViewerState.isEnabled ? 'viewingHistory' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title="Chessboard Settings" initialOpen={true}>
          <TextControl
            label="FEN Position"
            value={attributes.fen}
            onChange={(val) => setAttributes({ fen: val })}
          />
          <SelectControl
            label="Orientation"
            value={attributes.orientation}
            options={[
              { label: 'White', value: 'white' },
              { label: 'Black', value: 'black' },
            ]}
            onChange={(val) => setAttributes({ orientation: val })}
          />
          <ToggleControl
            label="Show Coordinates"
            checked={attributes.coordinates}
            onChange={(val) => setAttributes({ coordinates: val })}
          />
          <ToggleControl
            label="View Only (Read-Only)"
            checked={attributes.viewOnly}
            onChange={(val) => setAttributes({ viewOnly: val })}
          />
          <SelectControl
            label="Player Color"
            value={attributes.playerColor}
            options={[
              { label: 'Both', value: 'both' },
              { label: 'White', value: 'white' },
              { label: 'Black', value: 'black' },
            ]}
            onChange={(val) => setAttributes({ playerColor: val })}
          />
          <ToggleControl
            label="Show Threats"
            checked={attributes.showThreats}
            onChange={(val) => setAttributes({ showThreats: val })}
          />
        </PanelBody>
      </InspectorControls>

      <section className={wrapClasses}>
        <div className="main-board">
          {boardState.promotionDialogState.isEnabled && (
            <PromotionDialog
              state={boardState.promotionDialogState}
              onPromotionSelected={() => {
                setBoardState((prev) => ({
                  ...prev,
                  promotionDialogState: { isEnabled: false },
                }));
              }}
            />
          )}
          <div ref={boardRef}></div>
        </div>
      </section>
    </div>
  );
}
