# Directives de Développement (AGENTS.md) - Gutenberg Chessboard

Ce document définit les normes et les meilleures pratiques pour tout agent d'intelligence artificielle ou développeur travaillant sur le bloc Gutenberg `gutemberg-chessboard`.

---

## 1. Architecture du Bloc

Le bloc est conçu comme un composant Gutenberg natif utilisant **React** (via l'abstraction WordPress `@wordpress/element`) et s'appuie sur :
*   **Chessground** : La bibliothèque graphique pour l'échiquier.
*   **chess.js** : Le moteur de règles d'échecs (logique de jeu, validation des coups, calcul des menaces).

### Structure des Fichiers
*   `src/block.json` : Métadonnées du bloc, définition des attributs et scripts.
*   `src/index.jsx` : Point d'entrée pour l'enregistrement du bloc (`registerBlockType`).
*   `src/edit.jsx` : Interface d'édition dans l'administration WordPress (Editeur de blocs).
*   `src/save.jsx` : Structure HTML statique enregistrée dans la base de données WordPress pour le frontend.
*   `src/classes/BoardApi.ts` : API d'intégration entre Gutenberg, Chessground et chess.js.
*   `src/components/` : Composants React internes au bloc (ex: `PromotionDialog`).

---

## 2. Bonnes Pratiques WordPress Gutenberg

Tout développement ou modification doit respecter strictement les règles suivantes :

### A. Déclaration et Utilisation des Attributs (`block.json`)
*   **Source de vérité** : Les données persistantes (FEN, orientation, etc.) doivent être définies comme des attributs dans `block.json`. Ne jamais stocker de données de configuration persistantes uniquement dans le state React (`useState`).
*   **Attributs typés** : Tous les attributs doivent posséder un type (`string`, `boolean`, `object`, etc.) et une valeur par défaut cohérente.
*   **Synchronisation** : Les modifications d'attributs dans l'éditeur doivent exclusivement passer par la fonction `setAttributes` fournie par Gutenberg.

### B. Accessibilité et balisage sémantique (`useBlockProps`)
*   **Éditeur (`edit.jsx`)** : Toujours utiliser `const blockProps = useBlockProps();` et l'injecter sur l'élément conteneur (`<div {...blockProps}>`).
*   **Frontend (`save.jsx`)** : Toujours utiliser `const blockProps = useBlockProps.save();` pour s'assurer que WordPress applique correctement les classes, alignements et styles personnalisés.
*   **Attributs Data** : Passer les configurations nécessaires au frontend via des attributs HTML `data-*` dans le composant `Save` (ex: `data-fen={attributes.fen}`).

### C. Gestion du Cycle de Vie et Intégration de Bibliothèques Tierces
*   **Nettoyage du DOM (Cleanup)** : Les bibliothèques manipulant directement le DOM comme *Chessground* doivent être instanciées dans un hook `useEffect`. Vous devez **impérativement** retourner une fonction de nettoyage pour détruire l'instance (ex: `boardAPI.board.destroy()`) afin de prévenir les fuites de mémoire lors du démontage ou du re-rendu dans l'éditeur de blocs.
*   **Refs React** : Utiliser `useRef` pour cibler l'élément du DOM où l'échiquier doit être monté (`boardRef`). Ne jamais utiliser `document.querySelector` pour cibler des éléments internes du bloc.

### D. Interface Utilisateur (UI) WordPress
*   Utiliser les composants officiels du package `@wordpress/components` (`PanelBody`, `ToggleControl`, `SelectControl`, `TextControl`) à l'intérieur de `<InspectorControls>` pour assurer une intégration visuelle transparente avec l'interface WordPress.
*   Respecter le design system officiel de WordPress.

### E. Internationalisation (i18n)
*   Déclarer le `textdomain` dans `block.json` (`"textdomain": "gutemberg-chessboard"`).
*   Utiliser les fonctions de traduction de `@wordpress/i18n` (ex: `__('Chessboard Settings', 'gutemberg-chessboard')`) pour toutes les chaînes de caractères visibles par l'utilisateur.

### F. Version d'API (apiVersion dans `block.json`)
*   **API Version 2** : Le bloc doit impérativement rester enregistré avec `"apiVersion": 2` dans `block.json`. Ne pas passer à la version 3, car le rendu sous forme d'iframe (introduit par l'API v3) perturbe les calculs de coordonnées de souris/tactiles de *Chessground*, provoquant des décalages lors du glisser-déposer des pièces dans l'éditeur de blocs.

---

## 3. Flux Frontend et Hydratation
Le bloc Gutenberg est divisé en deux parties :
1.  **Le rendu statique (`save.jsx`)** : Génère un markup HTML simple contenant des attributs `data-*`.
2.  **L'hydratation frontend (Script d'intégration)** : Un script JS doit s'exécuter sur le frontend, parser les éléments avec la classe `.gutemberg-chessboard-block`, lire les attributs `data-*` et instancier *Chessground* et *chess.js* pour rendre l'échiquier interactif pour les visiteurs.

---

## 4. Règles de Codage et Outillage
*   **TypeScript** : Le code TypeScript doit être typé de manière stricte. Éviter le type `any`.
*   **Formating & Lenting** : Respecter les configurations de Prettier et ESLint du projet. Lancer `npm run lint` et `npm run format` avant de soumettre des modifications.
*   **Build** : Utiliser `npm run build` pour compiler le bloc via Vite. S'assurer que les dépendances WordPress (`@wordpress/*`, `react`, `react-dom`) sont marquées comme externes (`external` dans `rollupOptions`) pour ne pas surcharger le bundle final.
