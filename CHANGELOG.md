# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [1.0.5] - 2026-06-03

### Added
- Ajout d'une info-bulle (tooltip) native au survol de la barre d'évaluation indiquant le score précis (ex : `+1.50`, `-0.75`) ou l'annonce de mat (ex : `Mat #3B` pour les Blancs, `Mat #1N` pour les Noirs).
- Nouvelle méthode d'API `getOrientation()` sur la classe `BoardApi` pour récupérer l'orientation dynamique réelle du plateau.

### Fixed
- Correction du sens de la barre d'évaluation Stockfish cp et mate (les valeurs positives en blanc et négatives en noir étaient précédemment inversées).
- Correction de l'alignement et de la direction de la barre d'évaluation lors de l'orientation/retournement de l'échiquier.
- Résolution du problème de droit de déplacement / synchronisation au lancement d'une nouvelle partie contre Stockfish (permettant enfin de déplacer les pièces et d'empêcher les coups illégaux).

### Refactored
- **Centralisation API** : Déplacement de la logique d'annulation double (`undoMove`), du formatage des pièces capturées (`getFormattedCapturedPieces`), de la différence matérielle (`getMaterialDiffDisplay`) et du message de fin de partie (`getGameOverReason`) depuis la vue front-end vers la classe `BoardApi.ts`.

## [1.0.4] - 2026-06-03

### Added
- Intégration du « Mode libre » (Free Mode) pour déplacer librement les pièces des deux camps.
- Bypass de la validation de tour dans `chess.js` en mode libre via l'inversion dynamique du trait actif dans la FEN.
- Support des promotions de pion pour les deux couleurs en mode libre via le calcul de la couleur réelle de la pièce déplacée.

### Changed
- Masquage automatique des boutons de contrôle (« Nouvelle partie », « Retourner », « Annuler ») sous le plateau en mode libre (en modes Édition et Visiteur).
- Restriction de l'activation du moteur Stockfish uniquement au mode de jeu « 1 Joueur ».
- Correction de l'avertissement de dépréciation de `RangeControl` dans la console de l'éditeur en spécifiant la prop `__next40pxDefaultSize`.

## [1.0.3] - 2026-06-03

### Changed
- Amélioration du système de build pour injecter dynamiquement le numéro de version dans les fichiers d'actifs PHP de test, évitant le cache des navigateurs.
- Standardisation de la taille de police (`14px !important`) sur la zone de statut et les boutons de contrôle pour harmoniser le rendu entre le mode éditeur et le mode visiteur.

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
