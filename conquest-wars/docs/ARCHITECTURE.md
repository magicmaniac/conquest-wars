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
