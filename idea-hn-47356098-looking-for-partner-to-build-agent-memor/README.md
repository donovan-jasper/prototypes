# VectorMind

VectorMind is a high-performance, bare-metal memory platform for autonomous AI agents, utilizing Vector Symbolic Architecture to enable O(1) constant-time SIMD operations for complex graph traversals.

This prototype demonstrates the core concepts using a simplified tech stack (Node.js, Express, SQLite, Vanilla JS) with a conceptual VSA library. Future iterations plan to integrate Zig and Erlang for optimized performance.

## Core Features Implemented in Prototype:
1.  **Vector Symbolic Architecture (VSA) Implementation**: Basic VSA operations (create, bind, bundle, similarity) using the `hyperdimensional` library.
2.  **Graph Traversal Engine**: Ability to add nodes (represented by VSA vectors) and edges, and perform a basic Breadth-First Search (BFS) traversal.
3.  **Agent Memory Management**: Store and retrieve agent memories, where memories are represented as nodes in the graph with associated VSA vectors. Retrieval can involve finding memories similar to a query vector.

## Tech Stack
*   **Frontend**: Vanilla HTML/CSS/JS
*   **Backend**: Node.js/Express
*   **Database**: SQLite
*   **VSA Library**: `hyperdimensional` (conceptual implementation)

## File Structure
