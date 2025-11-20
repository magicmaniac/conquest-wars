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
