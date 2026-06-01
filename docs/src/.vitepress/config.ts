export default {
  title: 'gutemberg-chessboard',
  description: 'A native Gutenberg Chessboard block for WordPress.',
  themeConfig: {
    sidebar: [
      {
        text: 'Getting started',
        items: [{ text: 'Quick Start', link: '/getting-started' }],
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Block Attributes', link: '/attributes' },
          { text: 'Callbacks', link: '/callbacks' },
        ],
      },
      {
        text: 'Events',
        items: [
          { text: 'Available Events', link: '/events' },
          { text: 'Board Created', link: '/events/board-created' },
          { text: 'Checkmate', link: '/events/checkmate' },
          { text: 'Stalemate', link: '/events/stalemate' },
          { text: 'Draw', link: '/events/draw' },
          { text: 'Check', link: '/events/check' },
          { text: 'Move', link: '/events/move' },
          { text: 'Promotion', link: '/events/promotion' },
        ],
      },
      {
        text: 'Board API',
        items: [{ text: 'API', link: '/board-api' }],
      },
      {
        text: 'Engines',
        items: [
          { text: 'Play vs Stockfish', link: '/stockfish' },
          {
            text: 'Displaying Engine moves',
            link: '/stockfish-moves',
          },
        ],
      },
      {
        text: 'Contribute',
        items: [
          { text: 'Issues', link: '/issues' },
          { text: 'Contribute', link: '/contribute.md' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/trollinou/gutemberg-chessboard' },
    ],
  },
};
