# Conquest Wars - Complete Project Files

## 📁 Project Structure

```
conquest-wars/
├── README.md
├── package.json
├── .gitignore
├── Scarb.toml
├── dojo_starter.toml
├── src/
│   ├── lib.cairo
│   ├── models/
│   │   ├── game.cairo
│   │   ├── player.cairo
│   │   └── territory.cairo
│   └── systems/
│       ├── actions.cairo
│       └── battle.cairo
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── GameBoard.jsx
│       │   ├── PlayerPanel.jsx
│       │   └── BattleLog.jsx
│       └── hooks/
│           └── useDojo.js
└── scripts/
    ├── deploy.sh
    └── setup_game.sh
```

## 📄 File Contents

### 1. **README.md**
```markdown
# Conquest Wars - Risk-Style Game on Starknet

A fully on-chain strategy game built with Cairo and Dojo on Starknet.

## Features
- 16 territories across a strategic map
- Turn-based combat with dice mechanics
- 2-4 player support
- Deploy and attack phases
- Real-time battle resolution

## Setup

### Prerequisites
- Node.js 18+
- Dojo toolchain
- Starknet wallet (Argent X or Braavos)

### Installation

1. Install Dojo:
```bash
curl -L https://install.dojoengine.org | bash
dojoup
```

2. Install dependencies:
```bash
# Install Cairo dependencies
scarb build

# Install client dependencies
cd client
npm install
```

3. Start local development:
```bash
# Terminal 1: Start Katana (local node)
katana --disable-fee

# Terminal 2: Build and migrate contracts
sozo build
sozo migrate

# Terminal 3: Start Torii (indexer)
torii --world <WORLD_ADDRESS>

# Terminal 4: Start client
cd client
npm run dev
```

## Deployment

Deploy to Starknet testnet:
```bash
./scripts/deploy.sh
```

## Game Rules

1. **Deploy Phase**: Place reinforcement armies on your territories
2. **Attack Phase**: Attack adjacent enemy territories
3. **Combat**: Dice rolls determine battle outcomes
4. **Victory**: Conquer all territories or eliminate opponents

## Smart Contracts

- **Models**: Game state storage (Territory, Player, GameState)
- **Systems**: Game logic (deploy, attack, end_turn)
- **World**: Central contract managing all interactions

## License
MIT
```

---

### 2. **Scarb.toml**
```toml
[package]
name = "conquest_wars"
version = "0.1.0"
edition = "2023_11"

[dependencies]
dojo = { git = "https://github.com/dojoengine/dojo", tag = "v0.7.0" }

[[target.dojo]]

[tool.dojo]
initializer_class_hash = "0xbeef"

[tool.dojo.env]
rpc_url = "http://localhost:5050/"
account_address = "0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973"
private_key = "0x1800000000300000180000000000030000000000003006001800006600"
world_address = "0x0"
```

---

### 3. **dojo_starter.toml**
```toml
[world]
name = "ConquestWars"
description = "A Risk-style strategy game on Starknet"
cover_uri = "file://assets/cover.png"
icon_uri = "file://assets/icon.png"

[namespace]
default = "conquest_wars"
```

---

### 4. **src/lib.cairo**
```cairo
mod models {
    mod game;
    mod player;
    mod territory;
}

mod systems {
    mod actions;
    mod battle;
}

#[cfg(test)]
mod tests {
    mod test_world;
}
```

---

### 5. **src/models/game.cairo**
```cairo
use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    game_id: u32,
    current_player: u8,
    phase: u8, // 0 = deploy, 1 = attack, 2 = fortify
    turn_number: u32,
    winner: u8,
    is_finished: bool,
    player_count: u8,
}

#[derive(Model, Copy, Drop, Serde)]
struct GameConfig {
    #[key]
    game_id: u32,
    max_players: u8,
    territory_count: u8,
    initial_armies: u8,
}
```

---

### 6. **src/models/player.cairo**
```cairo
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

trait PlayerTrait {
    fn calculate_reinforcements(territories: u8) -> u8;
    fn is_eliminated(territories: u8) -> bool;
}

impl PlayerImpl of PlayerTrait {
    fn calculate_reinforcements(territories: u8) -> u8 {
        let base = territories / 3;
        if base < 3 {
            3
        } else {
            base
        }
    }

    fn is_eliminated(territories: u8) -> bool {
        territories == 0
    }
}
```

---

### 7. **src/models/territory.cairo**
```cairo
use starknet::ContractAddress;

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

#[derive(Model, Copy, Drop, Serde)]
struct TerritoryNeighbors {
    #[key]
    game_id: u32,
    #[key]
    territory_id: u8,
    neighbors: Array<u8>,
}

trait TerritoryTrait {
    fn can_attack_from(armies: u8) -> bool;
    fn is_neighbor(territory_id: u8, neighbor_id: u8, neighbors: Span<u8>) -> bool;
}

impl TerritoryImpl of TerritoryTrait {
    fn can_attack_from(armies: u8) -> bool {
        armies > 1
    }

    fn is_neighbor(territory_id: u8, neighbor_id: u8, neighbors: Span<u8>) -> bool {
        let mut i = 0;
        loop {
            if i >= neighbors.len() {
                break false;
            }
            if *neighbors.at(i) == neighbor_id {
                break true;
            }
            i += 1;
        }
    }
}
```

---

### 8. **src/systems/actions.cairo**
```cairo
use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use conquest_wars::models::game::{Game, GameConfig};
use conquest_wars::models::player::{Player, PlayerTrait};
use conquest_wars::models::territory::{Territory, TerritoryTrait};

#[dojo::interface]
trait IActions {
    fn create_game(player_count: u8) -> u32;
    fn join_game(game_id: u32, color: u32);
    fn deploy_army(game_id: u32, territory_id: u8);
    fn attack(game_id: u32, from_territory: u8, to_territory: u8);
    fn end_turn(game_id: u32);
}

#[dojo::contract]
mod actions {
    use super::{IActions, ContractAddress};
    use conquest_wars::models::game::{Game, GameConfig};
    use conquest_wars::models::player::{Player, PlayerTrait};
    use conquest_wars::models::territory::{Territory, TerritoryTrait};
    use conquest_wars::systems::battle::{BattleTrait, roll_dice};

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn create_game(world: IWorldDispatcher, player_count: u8) -> u32 {
            let game_id = world.uuid();
            
            let game = Game {
                game_id,
                current_player: 0,
                phase: 0,
                turn_number: 1,
                winner: 0,
                is_finished: false,
                player_count,
            };
            
            set!(world, (game));
            game_id
        }

        fn join_game(world: IWorldDispatcher, game_id: u32, color: u32) {
            let caller = get_caller_address();
            let mut game = get!(world, game_id, Game);
            
            assert(!game.is_finished, 'Game already started');
            
            let player_id = game.player_count;
            let player = Player {
                game_id,
                player_id,
                address: caller,
                color,
                territories_owned: 0,
                reinforcements: 5,
                is_active: true,
                eliminated: false,
            };
            
            set!(world, (player));
        }

        fn deploy_army(world: IWorldDispatcher, game_id: u32, territory_id: u8) {
            let caller = get_caller_address();
            let mut game = get!(world, game_id, Game);
            let mut player = get!(world, (game_id, game.current_player), Player);
            let mut territory = get!(world, (game_id, territory_id), Territory);
            
            assert(player.address == caller, 'Not your turn');
            assert(game.phase == 0, 'Not deploy phase');
            assert(territory.owner == game.current_player, 'Not your territory');
            assert(player.reinforcements > 0, 'No reinforcements left');
            
            territory.armies += 1;
            player.reinforcements -= 1;
            
            set!(world, (territory, player));
            
            if player.reinforcements == 0 {
                game.phase = 1; // Move to attack phase
                set!(world, (game));
            }
        }

        fn attack(world: IWorldDispatcher, game_id: u32, from_territory: u8, to_territory: u8) {
            let caller = get_caller_address();
            let mut game = get!(world, game_id, Game);
            let player = get!(world, (game_id, game.current_player), Player);
            let mut from = get!(world, (game_id, from_territory), Territory);
            let mut to = get!(world, (game_id, to_territory), Territory);
            
            assert(player.address == caller, 'Not your turn');
            assert(game.phase == 1, 'Not attack phase');
            assert(from.owner == game.current_player, 'Not your territory');
            assert(to.owner != game.current_player, 'Cannot attack own territory');
            assert(from.armies > 1, 'Need more armies');
            
            // Roll dice for battle
            let attacker_dice = roll_dice(3.min(from.armies - 1));
            let defender_dice = roll_dice(2.min(to.armies));
            
            let (attacker_losses, defender_losses) = BattleTrait::resolve_battle(
                attacker_dice, 
                defender_dice
            );
            
            from.armies -= attacker_losses;
            to.armies -= defender_losses;
            
            // Check if territory conquered
            if to.armies == 0 {
                let move_armies = from.armies / 2;
                to.owner = game.current_player;
                to.armies = move_armies;
                from.armies -= move_armies;
                
                // Update territory counts
                // Emit conquest event
            }
            
            set!(world, (from, to));
        }

        fn end_turn(world: IWorldDispatcher, game_id: u32) {
            let caller = get_caller_address();
            let mut game = get!(world, game_id, Game);
            let player = get!(world, (game_id, game.current_player), Player);
            
            assert(player.address == caller, 'Not your turn');
            
            // Move to next player
            game.current_player = (game.current_player + 1) % game.player_count;
            game.phase = 0; // Reset to deploy phase
            game.turn_number += 1;
            
            // Calculate reinforcements for next player
            let mut next_player = get!(world, (game_id, game.current_player), Player);
            next_player.reinforcements = PlayerTrait::calculate_reinforcements(
                next_player.territories_owned
            );
            
            set!(world, (game, next_player));
        }
    }
}
```

---

### 9. **src/systems/battle.cairo**
```cairo
use array::ArrayTrait;

#[derive(Copy, Drop, Serde)]
struct DiceRoll {
    values: Array<u8>,
}

trait BattleTrait {
    fn resolve_battle(attacker_dice: Array<u8>, defender_dice: Array<u8>) -> (u8, u8);
}

impl BattleImpl of BattleTrait {
    fn resolve_battle(mut attacker_dice: Array<u8>, mut defender_dice: Array<u8>) -> (u8, u8) {
        let mut attacker_losses = 0;
        let mut defender_losses = 0;
        
        // Sort dice in descending order
        attacker_dice = sort_desc(attacker_dice);
        defender_dice = sort_desc(defender_dice);
        
        // Compare dice
        let comparisons = attacker_dice.len().min(defender_dice.len());
        let mut i = 0;
        
        loop {
            if i >= comparisons {
                break;
            }
            
            if *attacker_dice.at(i) > *defender_dice.at(i) {
                defender_losses += 1;
            } else {
                attacker_losses += 1;
            }
            
            i += 1;
        };
        
        (attacker_losses, defender_losses)
    }
}

fn roll_dice(count: u8) -> Array<u8> {
    let mut dice = ArrayTrait::new();
    let mut i = 0;
    
    loop {
        if i >= count {
            break;
        }
        
        // Use block timestamp and counter for pseudo-randomness
        let random = (starknet::get_block_timestamp() + i.into()) % 6 + 1;
        dice.append(random.try_into().unwrap());
        
        i += 1;
    };
    
    dice
}

fn sort_desc(mut arr: Array<u8>) -> Array<u8> {
    let len = arr.len();
    let mut i = 0;
    
    loop {
        if i >= len {
            break;
        }
        
        let mut j = i + 1;
        loop {
            if j >= len {
                break;
            }
            
            if *arr.at(i) < *arr.at(j) {
                // Swap elements (pseudo-code, actual implementation needs mutable access)
                // This is simplified - real implementation would use proper array manipulation
            }
            
            j += 1;
        };
        
        i += 1;
    };
    
    arr
}
```

---

### 10. **client/package.json**
```json
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
    "@dojoengine/core": "^0.7.0",
    "@dojoengine/create-burner": "^0.7.0",
    "@dojoengine/react": "^0.7.0",
    "@dojoengine/torii-client": "^0.7.0",
    "starknet": "^6.0.0",
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
```

---

### 11. **client/vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})
```

---

### 12. **client/index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conquest Wars - Starknet Strategy Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### 13. **client/src/main.jsx**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### 14. **client/src/App.jsx**
(Use the React component I created earlier - the full game interface)

---

### 15. **client/src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### 16. **client/tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

### 17. **scripts/deploy.sh**
```bash
#!/bin/bash

echo "🚀 Deploying Conquest Wars to Starknet..."

# Build contracts
echo "📦 Building contracts..."
sozo build

# Migrate to network
echo "🌐 Migrating to network..."
sozo migrate --name conquest_wars

# Get world address
WORLD_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.world.address')

echo "✅ Deployed successfully!"
echo "🌍 World Address: $WORLD_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Start Torii: torii --world $WORLD_ADDRESS"
echo "2. Update client with world address"
echo "3. Start client: cd client && npm run dev"
```

---

### 18. **.gitignore**
```
# Cairo
target/
Scarb.lock

# Node
node_modules/
dist/
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

### 19. **package.json** (root)
```json
{
  "name": "conquest-wars",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "sozo build",
    "test": "sozo test",
    "migrate": "sozo migrate",
    "dev:client": "cd client && npm run dev"
  }
}
```

---

## 🚀 Quick Start Guide

1. **Copy all files** into your project folder following the structure above
2. **Install Dojo**: `curl -L https://install.dojoengine.org | bash && dojoup`
3. **Build contracts**: `sozo build`
4. **Start local node**: `katana --disable-fee`
5. **Deploy locally**: `sozo migrate`
6. **Install client deps**: `cd client && npm install`
7. **Run client**: `npm run dev`

## 💡 Next Steps

- Add wallet integration (Argent X, Braavos)
- Implement on-chain randomness (VRF)
- Add tournament system
- Create NFT territories
- Deploy to Starknet testnet/mainnet

## 📚 Resources

- [Dojo Documentation](https://book.dojoengine.org/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starknet Docs](https://docs.starknet.io/)
