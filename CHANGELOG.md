# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-01

### Added
- Initial release of the native Gutenberg Chessboard block for WordPress.
- WordPress Gutenberg editor integration with full block controls (FEN position, orientation, coordinates labels, view-only mode, player color, threats analysis).
- React components (`Edit` and `Save`) and metadata registry (`block.json`).
- Seamless client-side rehydration of Chessground and chess.js on the frontend.
- Extracted and integrated default chess piece graphics (SVGs base64).
- Dynamic pawn promotion dialogs in React.
- Fully rewritten documentation site in VitePress targeting the Gutenberg React block framework.
