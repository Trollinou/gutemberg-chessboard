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
  });

  return (
    <div {...blockProps}>
      <section className={`main-wrap ${showBar ? 'has-evaluation-bar' : ''}`}>
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
                <div className="difficulty-selector">
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
          <>
            <div className="chess-status">À vous de jouer</div>
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
          </>
        )}
      </section>
    </div>
  );
}
