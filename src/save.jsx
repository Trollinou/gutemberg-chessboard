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
        </div>
      </section>
    </div>
  );
}
