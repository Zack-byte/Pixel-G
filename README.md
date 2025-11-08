# Galaga Arcade

A modern web-based implementation of the classic Galaga arcade game with multiplayer support.

## Project Structure

```
galaga-arcade/
├── client/          # Frontend game client with Node.js server
├── mp-server/       # Rust WebSocket multiplayer server
├── docker/          # Docker configurations
├── docs/            # Documentation
└── scripts/         # Build and utility scripts
```

## Quick Start

### Development Mode

#### Start the game client:
```bash
cd client
npm install
npm run dev
```
The game will be available at http://localhost:8080

#### Start the multiplayer server:
```bash
cd mp-server
cargo run
```
The WebSocket server will run on port 8000

### Production Mode

Using Docker:
```bash
docker-compose -f docker/docker-compose.yml up
```

## Game Features

- **Single Player Mode**: Classic arcade gameplay
- **Endless Mode**: Survive as long as possible with increasing difficulty
- **Multiplayer Mode**: Battle against other players online
- **Customizable Settings**: Volume control and theme selection
- **Responsive Design**: Works on desktop and mobile browsers

## Controls

- **WASD** - Move ship
- **Space/Right Click** - Fire weapons
- **P** - Pause game

## Technology Stack

- **Frontend**: Vanilla JavaScript with ES6 modules
- **Client Server**: Node.js static file server
- **Multiplayer Backend**: Rust with WebSocket support
- **Containerization**: Docker and Docker Compose

## Development

### Client Development
The client uses a modular architecture with separate modules for:
- Game loop and mechanics
- Player controls and movement
- Enemy AI and spawning
- Audio management
- UI/Menu systems
- Combat and collision detection

### Multiplayer Server
The Rust server handles:
- WebSocket connections
- Player matchmaking
- Game state synchronization
- Real-time player movement updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License - see LICENSE file for details

## Author

Zachary Harris (zacharyharris27@gmail.com)