<?php
/**
 * Plugin Name: Gutenberg Chessboard Local Test
 * Description: Plugin de test local pour le bloc d'échiquier gutemberg-chessboard.
 * Version: 1.0.0
 * Author: Etienne Gagnon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function register_gutemberg_chessboard_test_block() {
    // Enregistre le bloc en lisant le fichier block.json local
    register_block_type( __DIR__ );
}
add_action( 'init', 'register_gutemberg_chessboard_test_block' );
