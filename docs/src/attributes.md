# Block Attributes

Gutenberg blocks store settings inside attributes. Here are the attributes supported by the `gutemberg-chessboard` block and configurable via the WordPress editor sidebar (Inspector Controls).

## Attributes List

| Attribute | Type | Default | Description |
|---|---|---|---|
| **`fen`** | `string` | `"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"` | The initial chess position in Forsyth-Edwards Notation. |
| **`orientation`** | `string` | `"white"` | The perspective of the board (`white` or `black`). |
| **`coordinates`** | `boolean` | `true` | Show or hide files/ranks labels. |
| **`viewOnly`** | `boolean` | `false` | Read-only mode. If true, user cannot drag pieces. |
| **`playerColor`** | `string` | `"both"` | Moveable color (`both`, `white`, or `black`). |
| **`showThreats`** | `boolean` | `false` | Visual overlays showing possible moves and checks. |
| **`boardConfig`** | `object` | `{}` | Direct configuration object passed to Chessground API. |
