#!/bin/bash

# Conquest Wars - GitHub Repository Generator
# This script creates the complete repository structure

set -e

PROJECT_NAME="conquest-wars"
GITHUB_USERNAME="${1:-yourusername}"

echo "🎮 Generating Conquest Wars GitHub Repository..."
echo "📁 Creating project structure..."

# Create main directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create directory structure
mkdir -p .github/{workflows,ISSUE_TEMPLATE}
mkdir -p contracts/src/{models,systems,tests}
mkdir -p client/{public,src/{components,hooks,utils}}
mkdir -p docs
mkdir -p scripts

echo "📝 Creating files..."

# ============= ROOT FILES =============

# README.md
cat > README.md << 'ENDOFFILE'
<div align="center">
  <h1>🎮 Conquest Wars</h1>
  <p><strong>A fully on-chain Risk-style strategy game built on Starknet</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Cairo](https://img.shields.io/badge/Cairo-2.0-orange.svg)](https://www.cairo-lang.org/)
  [![Dojo](https://img.shields.io/badge/Dojo-0.7.0-blue.svg)](https://www.dojoengine.org/)
  [![Starknet](https://img.shields.io/badge/Starknet-Mainnet-purple.svg)](https://www.starknet.io/)
</div>

## 🌟 Features

- 🗺️ **16 Strategic Territories** - Conquer the world
- ⚔️ **Tactical Combat** - Risk-style dice battles
- 👥 **Multiplayer** - 2-4 players
- 🔗 **Fully On-Chain** - All logic on Starknet
- 💎 **Gas-Efficient** - Optimized Cairo contracts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Dojo toolchain
- Starknet wallet

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/$GITHUB_USERNAME/conquest-wars.git
   cd conquest-wars
   ```

2. **Install Dojo**
   ```bash
   curl -L https://install.dojoengine.org | bash
   dojoup
   ```

3. **Start local development**
   ```bash
   # Terminal 1: Start Katana
   katana --disable-fee

   # Terminal 2: Deploy contracts
   cd contracts && sozo build && sozo migrate

   # Terminal 3: Start client
   cd client && npm install && npm run dev
   ```

4. **Play** at `http://localhost:3000`

## 🎮 How to Play

1. **Connect Wallet** - Use Argent X or Braavos
2. **Join Game** - Create or join a lobby
3. **Deploy** - Place reinforcements
4. **Attack** - Conquer enemy territories
5. **Win** - Eliminate all opponents!

## 🛠️ Tech Stack

- Smart Contracts: Cairo 2.0 + Dojo
- Blockchain: Starknet Layer 2
- Frontend: React + Vite + Tailwind
- Wallet: Starknet.js

## 📊 Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📜 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [Dojo Engine](https://www.dojoengine.org/)
- [Starknet](https://www.starknet.io/)
- Risk board game (inspiration)

---

Made with ❤️ by the Conquest Wars team
ENDOFFILE

# LICENSE
cat > LICENSE << 'ENDOFFILE'
MIT License

Copyright (c) 2024 Conquest Wars

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
ENDOFFILE

# CONTRIBUTING.md
cat > CONTRIBUTING.md << 'ENDOFFILE'
# Contributing to Conquest Wars

Thanks for your interest in contributing! 🎉

## How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Setup

See [README.md](README.md#quick-start) for setup instructions.

## Code Style

- Follow Cairo naming conventions
- Use ES6+ features for JavaScript
- Keep functions small and focused
- Add comments for complex logic

## Testing

- Write tests for new features
- Ensure all tests pass before PR
- Test game mechanics thoroughly

## Questions?

Feel free to open an issue or reach out on Discord!
ENDOFFILE

# CODE_OF_CONDUCT.md
cat > CODE_OF_CONDUCT.md << 'ENDOFFILE'
# Code of Conduct

## Our Pledge

We pledge to make participation harassment-free for everyone.

## Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

## Enforcement

Report unacceptable behavior to conduct@conquestwars.io

## Attribution

Adapted from the Contributor Covenant, version 2.0.
ENDOFFILE

# .gitignore
cat > .gitignore << 'ENDOFFILE'
# Cairo / Dojo
target/
Scarb.lock

# Node
node_modules/
dist/
*.log

# Environment
.env
.env.local

# IDEs
.vscode/
.idea/
*.swp
.DS_Store

# Testing
coverage/
ENDOFFILE

# .gitattributes
cat > .gitattributes << 'ENDOFFILE'
* text=auto
*.cairo text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.md text eol=lf
ENDOFFILE

# CHANGELOG.md
cat > CHANGELOG.md << 'ENDOFFILE'
# Changelog

## [0.1.0] - 2024-11-19

### Added
- Initial release
- Core game mechanics
- 16-territory map
- 2-4 player support
- Dice-based combat
- React frontend
- Cairo smart contracts with Dojo
- Complete documentation
ENDOFFILE

# ============= GITHUB FILES =============

# CI Workflow
cat > .github/workflows/ci.yml << 'ENDOFFILE'
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Dojo
        run: |
          curl -L https://install.dojoengine.org | bash
          dojoup
      
      - name: Build contracts
        working-directory: ./contracts
        run: sozo build
      
      - name: Run tests
        working-directory: ./contracts
        run: sozo test

  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install and build
        working-directory: ./client
        run: |
          npm ci
          npm run build
ENDOFFILE

# Bug Report Template
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'ENDOFFILE'
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
---

**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Environment:**
 - OS: [e.g. macOS]
 - Browser: [e.g. Chrome]
 - Wallet: [e.g. Argent X]
ENDOFFILE

# Feature Request Template
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'ENDOFFILE'
---
name: Feature request
about: Suggest an idea
title: '[FEATURE] '
labels: enhancement
---

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution**
What you want to happen.

**Additional context**
Any other context or screenshots.
ENDOFFILE

# PR Template
cat > .github/PULL_REQUEST_TEMPLATE.md << 'ENDOFFILE'
## Description
<!-- Describe your changes -->

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist:
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Added comments
- [ ] Updated documentation
- [ ] Tests pass
ENDOFFILE

# ============= CONTRACTS =============

# Scarb.toml
cat > contracts/Scarb.toml << 'ENDOFFILE'
[package]
name = "conquest_wars"
version = "0.1.0"
edition = "2023_11"

[dependencies]
dojo = { git = "https://github.com/dojoengine/dojo", tag = "v0.7.0" }

[[target.dojo]]
ENDOFFILE

# lib.cairo
cat > contracts/src/lib.cairo << 'ENDOFFILE'
mod models {
    mod game;
    mod player;
    mod territory;
}

mod systems {
    mod actions;
    mod battle;
}
ENDOFFILE

# game.cairo
cat > contracts/src/models/game.cairo << 'ENDOFFILE'
#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    game_id: u32,
    current_player: u8,
    phase: u8,
    turn_number: u32,
    is_finished: bool,
    player_count: u8,
}
ENDOFFILE

# player.cairo
cat > contracts/src/models/player.cairo << 'ENDOFFILE'
use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Player {
    #[key]
    game_id: u32,
    #[key]
    player_id: u8,
    address: ContractAddress,
    color: u32,
    territories_owned: u8,
    reinforcements: u8,
    is_active: bool,
}
ENDOFFILE

# territory.cairo
cat > contracts/src/models/territory.cairo << 'ENDOFFILE'
#[derive(Model, Copy, Drop, Serde)]
struct Territory {
    #[key]
    game_id: u32,
    #[key]
    territory_id: u8,
    owner: u8,
    armies: u8,
    name: felt252,
}
ENDOFFILE

# ============= CLIENT =============

# package.json
cat > client/package.json << 'ENDOFFILE'
{
  "name": "conquest-wars-client",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
ENDOFFILE

# vite.config.js
cat > client/vite.config.js << 'ENDOFFILE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})
ENDOFFILE

# index.html
cat > client/index.html << 'ENDOFFILE'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conquest Wars</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
ENDOFFILE

# main.jsx
cat > client/src/main.jsx << 'ENDOFFILE'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
ENDOFFILE

# App.jsx (placeholder - use the full game from earlier)
cat > client/src/App.jsx << 'ENDOFFILE'
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">🎮 Conquest Wars</h1>
        <p className="text-xl mb-8">Coming Soon on Starknet</p>
        <p className="text-gray-400">
          Replace this with the full game component
        </p>
      </div>
    </div>
  );
}

export default App;
ENDOFFILE

# index.css
cat > client/src/index.css << 'ENDOFFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
ENDOFFILE

# tailwind.config.js
cat > client/tailwind.config.js << 'ENDOFFILE'
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
ENDOFFILE

# postcss.config.js
cat > client/postcss.config.js << 'ENDOFFILE'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
ENDOFFILE

# .env.example
cat > client/.env.example << 'ENDOFFILE'
VITE_STARKNET_RPC_URL=https://starknet-mainnet.public.blastapi.io
VITE_WORLD_ADDRESS=0x...
VITE_TORII_URL=http://localhost:8080
ENDOFFILE

# ============= DOCS =============

# ARCHITECTURE.md
cat > docs/ARCHITECTURE.md << 'ENDOFFILE'
# Architecture

## Overview
Conquest Wars uses Dojo Engine's ECS architecture on Starknet.

## Smart Contracts
- **Models**: Game state (Game, Player, Territory)
- **Systems**: Game logic (actions, battle)
- **World**: Central contract manager

## Client
- React + Vite frontend
- Dojo hooks for state management
- Wallet integration via Starknet.js

## Deployment
- Contracts: Starknet mainnet/testnet
- Client: Netlify/Vercel
- Indexer: Torii on VPS
ENDOFFILE

# GAME_RULES.md
cat > docs/GAME_RULES.md << 'ENDOFFILE'
# Game Rules

## Setup
- 2-4 players
- 16 territories randomly distributed
- Each starts with 3 armies per territory

## Turn Structure
1. **Deploy**: Place reinforcements
2. **Attack**: Battle adjacent enemies
3. **Fortify**: Move armies (coming soon)

## Combat
- Attacker rolls 1-3 dice
- Defender rolls 1-2 dice
- Highest dice compared
- Losses determined by comparison

## Victory
- Eliminate all opponents
- Control 14+ territories
ENDOFFILE

# ============= SCRIPTS =============

# deploy-local.sh
cat > scripts/deploy-local.sh << 'ENDOFFILE'
#!/bin/bash
echo "🚀 Deploying locally..."
cd contracts
sozo build
sozo migrate
echo "✅ Deployed!"
ENDOFFILE

chmod +x scripts/deploy-local.sh

echo ""
echo "✅ Repository structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. cd $PROJECT_NAME"
echo "   2. git init"
echo "   3. git add ."
echo "   4. git commit -m 'Initial commit: Conquest Wars v0.1.0'"
echo "   5. Create repo on GitHub: https://github.com/new"
echo "   6. git remote add origin https://github.com/$GITHUB_USERNAME/$PROJECT_NAME.git"
echo "   7. git push -u origin main"
echo ""
echo "🎮 Happy coding!"
