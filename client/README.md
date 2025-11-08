# Galaga Client

Frontend game client for Galaga Arcade with integrated Node.js static server.

## Structure

```
client/
├── src/                    # Game source code
│   ├── core/              # Core game modules
│   ├── modes/             # Game modes (endless, multiplayer)
│   ├── legacy/            # Legacy reference code
│   └── main.js            # Main entry point
├── assets/                # Game assets
│   ├── sprites/           # Player, enemy, cloud images
│   ├── audio/             # Sound effects and music
│   └── data/              # Game data files
├── public/                # Static HTML/CSS
│   ├── index.html         # Main HTML file
│   └── styles.css         # Game styles
└── server.js              # Node.js static file server
```

## Development

```bash
# Install dependencies
npm install

# Run development server with auto-reload
npm run dev

# Run with browser-sync for live reload
npm run sync
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run sync` - Start browser-sync for live reloading
- `npm run lint` - Run ESLint on source files
- `npm run format` - Format code with Prettier

## Server Configuration

The Node.js server runs on port 8080 by default and serves:
- Static HTML/CSS from `/public`
- JavaScript modules from `/src`
- Game assets from `/assets`

## Environment Variables

- `PORT` - Server port (default: 8080)
- `HOST` - Server host (default: 0.0.0.0)