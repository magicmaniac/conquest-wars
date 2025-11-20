#!/bin/bash
echo "🚀 Deploying Conquest Wars..."
sozo build
sozo migrate --name conquest_wars
echo "✅ Deployed!"
