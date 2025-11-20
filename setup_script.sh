#!/bin/bash

echo "🎮 Setting up Conquest Wars project..."

# Create project structure
mkdir -p conquest-wars/{src/{models,systems},client/src/{components,hooks},scripts}
cd conquest-wars

echo "📁 Creating project files..."

# Create README
cat > README.md << 'EOF'
# Conquest Wars - Risk-Style Game on Starknet

A fully on-chain strategy game built with Cairo and Dojo on Starknet.

## Quick Start

1. Install Dojo:
   curl -L https://install.dojoengine.org | bash && dojoup

2. Build contracts:
   sozo build

3. Start local node:
   katana --disable-fee

4. Deploy:
   sozo migrate

5. Start client:
   cd client && npm install && npm run dev

## Features
- 16 territories across strategic map
- Turn-based combat with dice mechanics
- 2-4 player support
- Deploy and attack phases
EOF

# Create Scarb.toml
cat > Scarb.toml << 'EOF'
[package]
name = "conquest_wars"
version = "0.1.0"
edition = "2023_11"

[dependencies]
dojo = { git = "https://github.com/dojoengine/dojo", tag = "v0.7.0" }

[[target.dojo]]

[tool.dojo]
initializer_class_hash = "0xbeef"
EOF

# Create lib.cairo
cat > src/lib.cairo << 'EOF'
mod models {
    mod game;
    mod player;
    mod territory;
}

mod systems {
    mod actions;
    mod battle;
}
EOF

# Create game model
cat > src/models/game.cairo << 'EOF'
use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    game_id: u32,
    current_player: u8,
    phase: u8,
    turn_number: u32,
    winner: u8,
    is_finished: bool,
    player_count: u8,
}
EOF

# Create player model
cat > src/models/player.cairo << 'EOF'
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
    eliminated: bool,
}
EOF

# Create territory model
cat > src/models/territory.cairo << 'EOF'
#[derive(Model, Copy, Drop, Serde)]
struct Territory {
    #[key]
    game_id: u32,
    #[key]
    territory_id: u8,
    owner: u8,
    armies: u8,
    name: felt252,
    x: u16,
    y: u16,
}
EOF

# Create client package.json
cat > client/package.json << 'EOF'
{
  "name": "conquest-wars-client",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
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
EOF

# Create vite config
cat > client/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})
EOF

# Create index.html
cat > client/index.html << 'EOF'
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
EOF

# Create main.jsx
cat > client/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create index.css
cat > client/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
EOF

# Create tailwind config
cat > client/tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

# Create postcss config
cat > client/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
target/
node_modules/
dist/
.env
.DS_Store
Scarb.lock
EOF

# Create deploy script
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying Conquest Wars..."
sozo build
sozo migrate --name conquest_wars
echo "✅ Deployed!"
EOF

chmod +x scripts/deploy.sh

echo ""
echo "✅ Project setup complete!"
echo ""
echo "📝 Next steps:"
echo "   cd conquest-wars"
echo "   sozo build              # Build Cairo contracts"
echo "   katana --disable-fee    # Start local node"
echo "   sozo migrate            # Deploy contracts"
echo "   cd client && npm install && npm run dev"
echo ""
echo "🎮 Have fun building!"
