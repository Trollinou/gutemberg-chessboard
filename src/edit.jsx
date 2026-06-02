import React from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  TextControl,
  ToggleControl,
  SelectControl,
  Button,
  RangeControl,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { BoardApi } from './classes/BoardApi';
import PromotionDialog from './components/PromotionDialog';

export default function Edit({ attributes, setAttributes, clientId }) {
  const blockProps = useBlockProps();
  const boardRef = useRef(null);
  const boardApiRef = useRef(null);
  const [selectedPiece, setSelectedPiece] = useState(null); // { role, color } or 'eraser' or null

  const selectedPieceRef = useRef(selectedPiece);
  useEffect(() => {
    selectedPieceRef.current = selectedPiece;
  }, [selectedPiece]);

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

  const lastFenRef = useRef(attributes.fen);

  // Initialize board once on mount
  useEffect(() => {
    if (!boardRef.current) return;

    // Force editor/setup mode configurations
    const boardConfig = {
      fen: attributes.fen,
      orientation: attributes.orientation,
      coordinates: attributes.coordinates,
      viewOnly: false, // always editable in block editor
      movable: {
        free: true,
        color: 'both',
      },
      draggable: {
        deleteOnDropOff: true,
      },
      events: {
        select: (key) => {
          if (selectedPieceRef.current && boardApiRef.current) {
            if (selectedPieceRef.current === 'eraser') {
              boardApiRef.current.removePiece(key);
            } else {
              boardApiRef.current.putPiece(
                {
                  type:
                    selectedPieceRef.current.role === 'knight'
                      ? 'n'
                      : selectedPieceRef.current.role[0],
                  color: selectedPieceRef.current.color === 'white' ? 'w' : 'b',
                },
                key
              );
            }
          }
        },
      },
      ...attributes.boardConfig,
    };

    const mockProps = {
      boardConfig,
      playerColor: attributes.playerColor,
      reactiveConfig: attributes.reactiveConfig,
    };

    const boardStateProxy = new Proxy(boardStateRef.current, {
      set(target, prop, value) {
        target[prop] = value;
        setBoardState({ ...target });
        return true;
      },
    });

    const emit = (event, val) => {
      if (event === 'move') {
        lastFenRef.current = val.after;
        setAttributes({ fen: val.after });
      }
    };

    const boardAPI = new BoardApi(
      boardRef.current,
      boardStateProxy,
      mockProps,
      emit
    );
    boardApiRef.current = boardAPI;

    if (attributes.showThreats) {
      boardAPI.drawMoves();
    }

    return () => {
      if (boardAPI.board) {
        boardAPI.board.destroy();
      }
    };
  }, []);

  // Sync orientation
  useEffect(() => {
    if (boardApiRef.current) {
      boardApiRef.current.setConfig({ orientation: attributes.orientation });
    }
  }, [attributes.orientation]);

  // Sync coordinates
  useEffect(() => {
    if (boardApiRef.current) {
      boardApiRef.current.setConfig({ coordinates: attributes.coordinates });
    }
  }, [attributes.coordinates]);

  // Sync FEN when modified externally (e.g. from Inspector controls or reset)
  useEffect(() => {
    if (boardApiRef.current && attributes.fen !== lastFenRef.current) {
      lastFenRef.current = attributes.fen;
      boardApiRef.current.setPosition(attributes.fen);
    }
  }, [attributes.fen]);

  useEffect(() => {
    if (boardApiRef.current) {
      if (attributes.showThreats) {
        boardApiRef.current.drawMoves();
      } else {
        boardApiRef.current.hideMoves();
      }
    }
  }, [attributes.showThreats]);

  // FEN component helpers
  const getFenPart = (partIndex, defaultVal) => {
    const parts = (attributes.fen || '').split(' ');
    return parts[partIndex] || defaultVal;
  };

  const setFenPart = (partIndex, value) => {
    const parts = (
      attributes.fen ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    ).split(' ');
    parts[partIndex] = value;
    const newFen = parts.join(' ');
    lastFenRef.current = newFen;
    setAttributes({ fen: newFen });
    if (boardApiRef.current) {
      boardApiRef.current.setPosition(newFen);
    }
  };

  const activeColor = getFenPart(1, 'w');
  const castling = getFenPart(2, 'KQkq');

  const updateCastling = (flag, checked) => {
    let current = getFenPart(2, 'KQkq');
    if (current === '-') current = '';
    if (checked) {
      if (!current.includes(flag)) {
        let newCastling = '';
        if (flag === 'K' || current.includes('K')) newCastling += 'K';
        if (flag === 'Q' || current.includes('Q')) newCastling += 'Q';
        if (flag === 'k' || current.includes('k')) newCastling += 'k';
        if (flag === 'q' || current.includes('q')) newCastling += 'q';
        current = newCastling || '-';
      }
    } else {
      current = current.replace(flag, '');
    }
    if (!current) current = '-';
    setFenPart(2, current);
  };

  const handleResetBoard = () => {
    const defaultFen =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    lastFenRef.current = defaultFen;
    setAttributes({ fen: defaultFen });
    if (boardApiRef.current) {
      boardApiRef.current.setPosition(defaultFen);
    }
  };

  const handleClearBoard = () => {
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
    lastFenRef.current = emptyFen;
    setAttributes({ fen: emptyFen });
    if (boardApiRef.current) {
      boardApiRef.current.setPosition(emptyFen);
    }
  };

  const roles = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];

  const renderPalettePiece = (role, color) => {
    const isActive =
      selectedPiece &&
      selectedPiece.role === role &&
      selectedPiece.color === color;
    return (
      <button
        key={`${role}-${color}`}
        type="button"
        className={`editor-palette-piece ${isActive ? 'active' : ''}`}
        onClick={() => {
          if (isActive) {
            setSelectedPiece(null);
          } else {
            setSelectedPiece({ role, color });
          }
        }}
        title={`Place ${color} ${role}`}
      >
        <cg-board
          className="editor-palette-board"
          style={{ backgroundImage: 'none' }}
        >
          <piece className={`${role} ${color} piece-inner`} />
        </cg-board>
      </button>
    );
  };

  const renderEraser = (withLabel = false) => {
    const isActive = selectedPiece === 'eraser';
    return (
      <button
        type="button"
        className={`editor-palette-eraser ${isActive ? 'active' : ''}`}
        onClick={() => {
          if (isActive) {
            setSelectedPiece(null);
          } else {
            setSelectedPiece('eraser');
          }
        }}
        title="Remove piece on click"
      >
        🗑️ {withLabel && 'Gomme (Effacer une pièce)'}
      </button>
    );
  };

  const wrapClasses = [
    'main-wrap',
    boardState.promotionDialogState.isEnabled ? 'disabledBoard' : '',
    boardState.historyViewerState.isEnabled ? 'viewingHistory' : '',
    attributes.useStockfish && attributes.showEvaluationBar
      ? 'has-evaluation-bar'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...blockProps}
      onMouseDownCapture={() => {
        if (window.wp?.data?.dispatch) {
          window.wp.data.dispatch('core/block-editor').selectBlock(clientId);
        }
      }}
    >
      <InspectorControls>
        <PanelBody title="Chessboard Settings" initialOpen={true}>
          <TextControl
            __next40pxDefaultSize
            label="FEN Position"
            value={attributes.fen}
            onChange={(val) => {
              lastFenRef.current = val;
              setAttributes({ fen: val });
            }}
          />
          <SelectControl
            __next40pxDefaultSize
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
            label="View Only (Read-Only on Frontend)"
            checked={attributes.viewOnly}
            onChange={(val) => setAttributes({ viewOnly: val })}
          />
          <SelectControl
            __next40pxDefaultSize
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
          <ToggleControl
            label="Enable Stockfish"
            checked={attributes.useStockfish}
            onChange={(val) => setAttributes({ useStockfish: val })}
          />
          {attributes.useStockfish && (
            <>
              <RangeControl
                label="Stockfish Difficulty (ELO)"
                value={attributes.stockfishElo}
                onChange={(val) => setAttributes({ stockfishElo: val })}
                min={1320}
                max={2800}
                step={10}
              />
              <ToggleControl
                label="Show Evaluation Bar"
                checked={attributes.showEvaluationBar}
                onChange={(val) => setAttributes({ showEvaluationBar: val })}
              />
            </>
          )}
          <PanelBody title="Board Actions" initialOpen={true}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                isDestructive
                isSecondary
                onClick={handleClearBoard}
                style={{ flex: 1 }}
              >
                Clear Board
              </Button>
              <Button
                isSecondary
                onClick={handleResetBoard}
                style={{ flex: 1 }}
              >
                Reset Board
              </Button>
            </div>
          </PanelBody>
          <PanelBody
            title="Piece Palette (Sélectionner puis poser)"
            initialOpen={true}
          >
            <div
              className="editor-palette-container"
              style={{
                marginTop: 0,
                padding: 0,
                border: 'none',
                background: 'none',
              }}
            >
              <div className="editor-palette-grid-sidebar">
                <div className="editor-palette-row-sidebar">
                  {roles.map((role) => renderPalettePiece(role, 'white'))}
                </div>
                <div className="editor-palette-row-sidebar">
                  {roles.map((role) => renderPalettePiece(role, 'black'))}
                </div>
                <div className="editor-palette-row-eraser">
                  {renderEraser(true)}
                </div>
              </div>
            </div>
          </PanelBody>
          <SelectControl
            __next40pxDefaultSize
            label="Active Turn (Trait aux)"
            value={activeColor}
            options={[
              { label: 'White', value: 'w' },
              { label: 'Black', value: 'b' },
            ]}
            onChange={(val) => setFenPart(1, val)}
          />
          <PanelBody title="Castling Rights (Roques)" initialOpen={false}>
            <ToggleControl
              label="White King side (O-O)"
              checked={castling.includes('K')}
              onChange={(val) => updateCastling('K', val)}
            />
            <ToggleControl
              label="White Queen side (O-O-O)"
              checked={castling.includes('Q')}
              onChange={(val) => updateCastling('Q', val)}
            />
            <ToggleControl
              label="Black King side (o-o)"
              checked={castling.includes('k')}
              onChange={(val) => updateCastling('k', val)}
            />
            <ToggleControl
              label="Black Queen side (o-o-o)"
              checked={castling.includes('q')}
              onChange={(val) => updateCastling('q', val)}
            />
          </PanelBody>
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
          {attributes.useStockfish && attributes.showEvaluationBar && (
            <div className="evaluation-bar">
              <div
                className="evaluation-bar-fill"
                style={{
                  marginTop: attributes.orientation === 'white' ? 'auto' : '0',
                  marginBottom:
                    attributes.orientation === 'white' ? '0' : 'auto',
                }}
              ></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
