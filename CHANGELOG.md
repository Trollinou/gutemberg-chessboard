# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [1.0.2] - 2026-06-03

### Changed
- Réorganisation de la barre latérale des réglages de l'éditeur Gutenberg en français sous 3 sections : Configuration, Style de l'échiquier, Mode de jeu.
- Déplacement du champ "Position FEN" au tout début de l'inspecteur de bloc (en dehors de tout panneau pliable) pour une visibilité permanente, et fermeture par défaut de l'onglet Configuration.
- Remplacement des boutons glissants des droits de roque par un tableau de cases à cocher (`CheckboxControl`) parfaitement alignées.
- Valeur par défaut de `viewOnly` passée à `true` et `showEvaluationBar` passée à `false`.
- Refonte des modes de jeu au frontend avec les options : Visualiser, 1 Joueur (couleur synchrone avec l'orientation) et 2 Joueurs.

### Added
- Implémentation d'une boîte de dialogue de promotion de pions dynamique en pur JavaScript pour le frontend (`view.jsx`) dans les modes 1 Joueur et 2 Joueurs.

## [1.0.1] - 2026-06-01

### Added
- Interactive chessboard position editor (setup mode) within WordPress Gutenberg edit mode.
- Visual Piece Palette and Eraser tool integrated inside block settings sidebar (Inspector Controls).
- Settings to customize FEN parameters directly: Active Turn (first move) and Castling Rights.
- Auto-focus selection handler targeting the block container to resolve Chessground stopPropagation event capturing.
- Adaptive styling for the Piece Palette to fit narrow sidebar layouts without scrolling.
- Fixed outline selection coordinates overflow clipping.

## [1.0.0] - 2026-06-01

### Added
- Initial release of the native Gutenberg Chessboard block for WordPress.
- WordPress Gutenberg editor integration with full block controls (FEN position, orientation, coordinates labels, view-only mode, player color, threats analysis).
- React components (`Edit` and `Save`) and metadata registry (`block.json`).
- Seamless client-side rehydration of Chessground and chess.js on the frontend.
- Extracted and integrated default chess piece graphics (SVGs base64).
- Dynamic pawn promotion dialogs in React.
- Fully rewritten documentation site in VitePress targeting the Gutenberg React block framework.
