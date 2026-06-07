import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
  const showBar = attributes.useStockfish && attributes.showEvaluationBar;
  const blockProps = useBlockProps.save({
    className: `gutemberg-chessboard-block ${
      showBar ? 'has-evaluation-bar' : ''
    }`,
    'data-fen': attributes.fen,
    'data-orientation': attributes.orientation,
    'data-coordinates': attributes.coordinates,
    'data-view-only': attributes.viewOnly,
    'data-player-color': attributes.playerColor,
    'data-show-threats': attributes.showThreats,
    'data-use-stockfish': attributes.useStockfish,
    'data-stockfish-elo': attributes.stockfishElo,
    'data-show-evaluation-bar': attributes.showEvaluationBar,
    'data-free-mode': attributes.freeMode,
    'data-clock-preset': attributes.clockPreset || 'none',
  });

  return (
    <div {...blockProps}>
      <section className={`main-wrap ${showBar ? 'has-evaluation-bar' : ''}`}>
        {!attributes.viewOnly && (
          <div
            className="captured-clock-top captured-bar"
            style={{
              display:
                attributes.clockPreset && attributes.clockPreset !== 'none'
                  ? 'flex'
                  : 'none',
            }}
          >
            <span className="captured-pieces-clock-opp"></span>
            <div className="game-clock opponent-clock">--:--</div>
          </div>
        )}
        <div className="main-board">
          <div className="chessboard-mount-element"></div>
          {showBar && (
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
          {!attributes.viewOnly && attributes.useStockfish && (
            <div className="chess-config-dialog">
              <div className="config-dialog-content">
                <div className="color-selector">
                  <button
                    type="button"
                    className="color-btn white active"
                    data-color="white"
                  >
                    Blancs
                  </button>
                  <button
                    type="button"
                    className="color-btn random"
                    data-color="random"
                  >
                    Aléatoire
                  </button>
                  <button
                    type="button"
                    className="color-btn black"
                    data-color="black"
                  >
                    Noirs
                  </button>
                </div>
                
                {/* Sélecteur de cadence (Pendule) */}
                <div className="cadence-selector" style={{ marginTop: '12px', textAlign: 'left' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Cadence :</label>
                  <select className="cadence-select" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="none">Sans pendule</option>
                    <option value="1+0">1 min (Bullet)</option>
                    <option value="3+2">3 min + 2 s (Blitz)</option>
                    <option value="5+0">5 min KO (Blitz)</option>
                    <option value="10+5">10 min + 5 s (Rapide)</option>
                    <option value="15+10">15 min + 10 s (Rapide)</option>
                  </select>
                </div>

                <div className="difficulty-selector" style={{ marginTop: '12px' }}>
                  <label>
                    Difficulté :{' '}
                    <span className="elo-value">
                      {attributes.stockfishElo || 1500}
                    </span>{' '}
                    ELO
                  </label>
                  <input
                    type="range"
                    className="elo-slider"
                    min="1320"
                    max="2800"
                    defaultValue={attributes.stockfishElo || 1500}
                  />
                </div>
                <button type="button" className="start-btn">
                  Commencer
                </button>
              </div>
            </div>
          )}
        </div>
        {!attributes.viewOnly && (
          <div
            className="captured-clock-bottom captured-bar"
            style={{
              display:
                attributes.clockPreset && attributes.clockPreset !== 'none'
                  ? 'flex'
                  : 'none',
            }}
          >
            <span className="captured-pieces-clock-player"></span>
            <div className="game-clock player-clock">--:--</div>
          </div>
        )}
        {!attributes.viewOnly && (
          <>
            <div className="chess-status">À vous de jouer</div>
            {!attributes.freeMode && (
              <div className="chess-controls">
                <button type="button" className="control-btn new-game">
                  Nouvelle partie
                </button>
                <button type="button" className="control-btn flip-board">
                  Retourner
                </button>
                <button type="button" className="control-btn undo-move">
                  Annuler
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
