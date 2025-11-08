# WebSocket Game Server

A multiplayer game server written in Rust using Warp and WebSockets. This server facilitates real-time multiplayer game interactions, including player matching, position synchronization, and event handling.

## Features

- Real-time WebSocket communication
- Player matchmaking system
- Game state synchronization
- Event-based architecture
- Position updates and bullet firing events
- REST endpoints for registration and health checks
- CORS support for web clients

## Prerequisites

- Rust 2021 edition or later
- Cargo package manager

## Dependencies

- tokio (1.28+) - Asynchronous runtime
- warp (0.3) - Web server framework
- serde - Serialization/deserialization
- uuid - Unique identifier generation
- futures - Asynchronous programming utilities

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mp_server
```

2. Build the project:
```bash
cargo build
```

## Running the Server

Start the server with:
```bash
cargo run
```

The server will start and listen for WebSocket connections and HTTP requests.

## API Endpoints

### Health Check
- `GET /health` - Check server health status

### Registration
- `POST /register` - Register a new player
  - Request body: `{ "user_id": "string" }`
  - Response: `{ "url": "ws://127.0.0.1:8000/ws/<uuid>" }`
- `DELETE /register/<id>` - Unregister a player

### WebSocket
- `WS /ws/<id>` - WebSocket connection endpoint for real-time game communication

### Publishing
- `POST /publish` - Publish game events
  - Request body: `{ "topic": "string", "user_id": "string?", "message": "string" }`

## WebSocket Communication

The server handles various types of real-time game messages:

- Game Packets: Position updates
  ```json
  {
    "opponent_id": "string",
    "player_x": float,
    "player_y": float
  }
  ```

- Fire Events
  ```json
  {
    "opponent_id": "string",
    "bullet_type": "string"
  }
  ```

- Topic Subscriptions
  ```json
  {
    "topics": ["string"]
  }
  ```

## Architecture

The server uses a client-based architecture where each connected client is stored in a thread-safe hashmap. The system handles:

- Client registration and connection management
- Real-time message broadcasting
- Player matchmaking
- Game state synchronization
- Event publishing and subscription

## Development

The project follows Rust's standard module structure:
- `main.rs` - Application entry point and type definitions
- `handler.rs` - Request handlers and WebSocket logic

## License

[Add your license information here]
