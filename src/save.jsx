import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
  const blockProps = useBlockProps.save({
    className: 'gutemberg-chessboard-block',
    'data-fen': attributes.fen,
    'data-orientation': attributes.orientation,
    'data-coordinates': attributes.coordinates,
    'data-view-only': attributes.viewOnly,
    'data-player-color': attributes.playerColor,
    'data-show-threats': attributes.showThreats,
  });

  return (
    <div {...blockProps}>
      <section className="main-wrap">
        <div className="main-board">
          <div className="chessboard-mount-element"></div>
        </div>
      </section>
    </div>
  );
}
