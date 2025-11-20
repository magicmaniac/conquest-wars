#!/bin/bash
echo "🚀 Deploying locally..."
cd contracts
sozo build
sozo migrate
echo "✅ Deployed!"
