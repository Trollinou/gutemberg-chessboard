const { build } = require('vite');
const { resolve } = require('path');
const { copyFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } = require('fs');

const isWatch = process.argv.includes('--watch');

// Custom post-build copy logic
function postBuildCopy() {
  try {
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    // Copy and rename Stockfish files
    copyFileSync(
      resolve(__dirname, '../node_modules/stockfish/bin/stockfish-18-lite-single.js'),
      'dist/stockfish.js'
    );
    copyFileSync(
      resolve(__dirname, '../node_modules/stockfish/bin/stockfish-18-lite-single.wasm'),
      'dist/stockfish.wasm'
    );

    if (!existsSync('test/dist')) {
      mkdirSync('test/dist', { recursive: true });
    }

    const filesToCopy = [
      'gutemberg-chessboard.js',
      'gutemberg-chessboard-view.js',
      'style.css',
      'stockfish.js',
      'stockfish.wasm'
    ];
    
    filesToCopy.forEach(file => {
      if (existsSync(`dist/${file}`)) {
        copyFileSync(`dist/${file}`, `test/dist/${file}`);
      }
    });

    const editorAssetContent = `<?php
return array(
    'dependencies' => array(
        'wp-blocks',
        'wp-element',
        'wp-components',
        'wp-block-editor',
        'wp-i18n',
    ),
    'version'      => '1.0.0',
);
`;
    writeFileSync('test/dist/gutemberg-chessboard.asset.php', editorAssetContent, 'utf8');

    const viewAssetContent = `<?php
return array(
    'dependencies' => array(
        'wp-element',
    ),
    'version'      => '1.0.0',
);
`;
    writeFileSync('test/dist/gutemberg-chessboard-view.asset.php', viewAssetContent, 'utf8');

    if (existsSync('src/block.json')) {
      const blockJson = JSON.parse(readFileSync('src/block.json', 'utf8'));
      blockJson.editorScript = 'file:./dist/gutemberg-chessboard.js';
      blockJson.editorStyle = 'file:./dist/style.css';
      blockJson.style = 'file:./dist/style.css';
      blockJson.viewScript = 'file:./dist/gutemberg-chessboard-view.js';
      writeFileSync('test/block.json', JSON.stringify(blockJson, null, 2), 'utf8');
    }
    console.log('✓ Successfully built and copied files to the test/ directory.');
  } catch (err) {
    console.error('Error in postBuildCopy:', err);
  }
}

// Watcher plugin to trigger copy on rebuilds
const copyPlugin = {
  name: 'copy-plugin',
  closeBundle() {
    postBuildCopy();
  }
};

async function run() {
  const commonConfig = {
    configFile: false,
    plugins: [copyPlugin],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src')
      }
    }
  };

  // 1. Build Editor block script
  await build({
    ...commonConfig,
    build: {
      watch: isWatch ? {} : null,
      lib: {
        entry: resolve(__dirname, '../src/index.jsx'),
        name: 'GutenbergChessboard',
        formats: ['iife'],
        fileName: () => 'gutemberg-chessboard.js',
      },
      outDir: 'dist',
      emptyOutDir: !isWatch,
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          '@wordpress/blocks',
          '@wordpress/block-editor',
          '@wordpress/components',
          '@wordpress/element',
          '@wordpress/i18n',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            '@wordpress/blocks': 'wp.blocks',
            '@wordpress/block-editor': 'wp.blockEditor',
            '@wordpress/components': 'wp.components',
            '@wordpress/element': 'wp.element',
            '@wordpress/i18n': 'wp.i18n',
          }
        }
      }
    }
  });

  // 2. Build Frontend View script
  await build({
    ...commonConfig,
    build: {
      watch: isWatch ? {} : null,
      lib: {
        entry: resolve(__dirname, '../src/view.jsx'),
        name: 'GutenbergChessboardView',
        formats: ['iife'],
        fileName: () => 'gutemberg-chessboard-view.js',
      },
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          '@wordpress/element',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            '@wordpress/element': 'wp.element',
          }
        }
      }
    }
  });
}

run().catch(console.error);
