import React, { useState, useEffect } from 'react';
import { Swords, Shield, Users, Crown, Map, Zap, Trophy, Github, ExternalLink } from 'lucide-react';

const ConquestWars = () => {
  const [gameState, setGameState] = useState('setup');
  const [players, setPlayers] = useState([
    { id: 1, name: 'Red Empire', color: '#ef4444', armies: 30, territories: 0, active: true },
    { id: 2, name: 'Blue Kingdom', color: '#3b82f6', armies: 30, territories: 0, active: true },
    { id: 3, name: 'Green Alliance', color: '#22c55e', armies: 30, territories: 0, active: false },
    { id: 4, name: 'Yellow Dynasty', color: '#eab308', armies: 30, territories: 0, active: false }
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [attackFrom, setAttackFrom] = useState(null);
  const [phase, setPhase] = useState('deploy');
  const [reinforcements, setReinforcements] = useState(5);
  const [battleLog, setBattleLog] = useState([]);

  const territories = [
    { id: 1, name: 'North Wasteland', x: 150, y: 50, armies: 0, owner: null, neighbors: [2, 4, 5] },
    { id: 2, name: 'Eastern Peaks', x: 350, y: 80, armies: 0, owner: null, neighbors: [1, 3, 6] },
    { id: 3, name: 'Dragon Isles', x: 500, y: 120, armies: 0, owner: null, neighbors: [2, 7] },
    { id: 4, name: 'Central Plains', x: 100, y: 180, armies: 0, owner: null, neighbors: [1, 5, 8, 9] },
    { id: 5, name: 'Capital City', x: 250, y: 160, armies: 0, owner: null, neighbors: [1, 4, 6, 9, 10] },
    { id: 6, name: 'Mountain Pass', x: 400, y: 180, armies: 0, owner: null, neighbors: [2, 5, 7, 10, 11] },
    { id: 7, name: 'Coastal Fortress', x: 550, y: 200, armies: 0, owner: null, neighbors: [3, 6, 12] },
    { id: 8, name: 'Western Woods', x: 80, y: 320, armies: 0, owner: null, neighbors: [4, 9, 13] },
    { id: 9, name: 'Valley Kingdom', x: 200, y: 300, armies: 0, owner: null, neighbors: [4, 5, 8, 10, 14] },
    { id: 10, name: 'Trade Hub', x: 320, y: 290, armies: 0, owner: null, neighbors: [5, 6, 9, 11, 14, 15] },
    { id: 11, name: 'Desert Outpost', x: 450, y: 310, armies: 0, owner: null, neighbors: [6, 7, 10, 12, 15] },
    { id: 12, name: 'Port City', x: 580, y: 330, armies: 0, owner: null, neighbors: [7, 11, 16] },
    { id: 13, name: 'Dark Forest', x: 120, y: 420, armies: 0, owner: null, neighbors: [8, 14] },
    { id: 14, name: 'Ancient Ruins', x: 250, y: 410, armies: 0, owner: null, neighbors: [9, 10, 13, 15] },
    { id: 15, name: 'Volcano Base', x: 380, y: 420, armies: 0, owner: null, neighbors: [10, 11, 14, 16] },
    { id: 16, name: 'Southern Isles', x: 520, y: 440, armies: 0, owner: null, neighbors: [12, 15] }
  ];

  const [territoryStates, setTerritoryStates] = useState(territories);

  useEffect(() => {
    if (gameState === 'setup') {
      const initialSetup = territories.map((t, idx) => ({
        ...t,
        owner: idx % players.filter(p => p.active).length,
        armies: 3
      }));
      setTerritoryStates(initialSetup);
      updatePlayerStats(initialSetup);
      setGameState('playing');
    }
  }, []);

  const updatePlayerStats = (terrStates) => {
    const activePlayers = players.filter(p => p.active);
    const updatedPlayers = activePlayers.map(p => ({
      ...p,
      territories: terrStates.filter(t => t.owner === p.id - 1).length
    }));
    setPlayers(prev => prev.map(p => {
      const updated = updatedPlayers.find(up => up.id === p.id);
      return updated || p;
    }));
  };

  const handleTerritoryClick = (territory) => {
    const activePlayers = players.filter(p => p.active);
    const currentPlayerObj = activePlayers[currentPlayer];

    if (phase === 'deploy') {
      if (territory.owner === currentPlayer && reinforcements > 0) {
        const updated = territoryStates.map(t =>
          t.id === territory.id ? { ...t, armies: t.armies + 1 } : t
        );
        setTerritoryStates(updated);
        setReinforcements(reinforcements - 1);
        
        if (reinforcements === 1) {
          setPhase('attack');
          addLog(`${currentPlayerObj.name} finished deploying reinforcements`);
        }
      }
    } else if (phase === 'attack') {
      if (!attackFrom) {
        if (territory.owner === currentPlayer && territory.armies > 1) {
          setAttackFrom(territory);
          setSelectedTerritory(territory);
        }
      } else {
        if (territory.owner !== currentPlayer && territory.neighbors.includes(attackFrom.id)) {
          performAttack(attackFrom, territory);
          setAttackFrom(null);
          setSelectedTerritory(null);
        } else if (territory.id === attackFrom.id) {
          setAttackFrom(null);
          setSelectedTerritory(null);
        }
      }
    }
  };

  const rollDice = (count) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
  };

  const performAttack = (from, to) => {
    const activePlayers = players.filter(p => p.active);
    const attackerDice = rollDice(Math.min(3, from.armies - 1));
    const defenderDice = rollDice(Math.min(2, to.armies));

    let attackerLosses = 0;
    let defenderLosses = 0;

    for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
      if (attackerDice[i] > defenderDice[i]) {
        defenderLosses++;
      } else {
        attackerLosses++;
      }
    }

    const updated = territoryStates.map(t => {
      if (t.id === from.id) {
        return { ...t, armies: t.armies - attackerLosses };
      }
      if (t.id === to.id) {
        const newArmies = t.armies - defenderLosses;
        if (newArmies <= 0) {
          const moveArmies = Math.floor(from.armies / 2);
          addLog(`${activePlayers[currentPlayer].name} conquered ${to.name}!`);
          return { ...t, owner: currentPlayer, armies: moveArmies };
        }
        return { ...t, armies: newArmies };
      }
      return t;
    });

    const conqueredId = updated.find(t => t.id === to.id);
    if (conqueredId.owner === currentPlayer) {
      const conqueredFrom = updated.find(t => t.id === from.id);
      const moveArmies = Math.floor(conqueredFrom.armies / 2);
      updated.find(t => t.id === from.id).armies -= moveArmies;
    }

    setTerritoryStates(updated);
    updatePlayerStats(updated);
    
    addLog(`Battle: ${from.name} → ${to.name} | Attacker 🎲: [${attackerDice}] Defender 🎲: [${defenderDice}]`);
    
    // Check for victory after conquest
    checkVictory(updated);
  };

  const addLog = (message) => {
    setBattleLog(prev => [message, ...prev].slice(0, 5));
  };

  const checkVictory = (terrStates) => {
    const activePlayers = players.filter(p => p.active);
    for (let i = 0; i < activePlayers.length; i++) {
      const playerTerritories = terrStates.filter(t => t.owner === i).length;
      if (playerTerritories === territories.length) {
        setGameState('victory');
        addLog(`🎉 ${activePlayers[i].name} has conquered the world!`);
        return true;
      }
    }
    return false;
  };

  const endTurn = () => {
    // Check for victory before ending turn
    if (checkVictory(territoryStates)) {
      return;
    }

    const activePlayers = players.filter(p => p.active);
    const nextPlayer = (currentPlayer + 1) % activePlayers.length;
    setCurrentPlayer(nextPlayer);
    
    const playerTerritories = territoryStates.filter(t => t.owner === nextPlayer).length;
    const newReinforcements = Math.max(3, Math.floor(playerTerritories / 3));
    
    setReinforcements(newReinforcements);
    setPhase('deploy');
    setAttackFrom(null);
    setSelectedTerritory(null);
    addLog(`${activePlayers[nextPlayer].name}'s turn begins with ${newReinforcements} reinforcements`);
  };

  const skipToAttack = () => {
    setPhase('attack');
    addLog(`${players.filter(p => p.active)[currentPlayer].name} skipped deployment`);
  };

  const activePlayers = players.filter(p => p.active);
  const currentPlayerObj = activePlayers[currentPlayer];
  const winner = activePlayers.find((p, idx) => territoryStates.filter(t => t.owner === idx).length === territories.length);

  // Victory Screen
  if (gameState === 'victory' && winner) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-8 p-12 bg-slate-800/80 rounded-3xl border-4 border-yellow-400 shadow-2xl">
          <Crown className="w-32 h-32 text-yellow-400 mx-auto animate-bounce" />
          <div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Victory!
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: winner.color }}
              />
              <p className="text-4xl font-bold">{winner.name}</p>
            </div>
            <p className="text-2xl text-gray-300 mb-8">
              has conquered all territories!
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Play Again
            </button>
            <a
              href="https://github.com/MAGICMANIAC/conquest-wars"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Conquest Wars
              </h1>
              <Map className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex gap-3">
              <a 
                href="https://github.com/MAGICMANIAC/conquest-wars" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-600"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="text-sm bg-purple-800/50 px-4 py-2 rounded-lg border border-purple-600">
                Built on Starknet with Dojo
              </div>
            </div>
          </div>

          {/* Current Player Info */}
          <div className="bg-gradient-to-r from-purple-800/80 to-blue-800/80 p-4 rounded-xl border-2 border-purple-500 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: currentPlayerObj.color }}
                />
                <div>
                  <div className="text-2xl font-bold">{currentPlayerObj.name}</div>
                  <div className="text-sm opacity-80 flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    {territoryStates.filter(t => t.owner === currentPlayer).length} territories
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                {phase === 'deploy' && (
                  <div className="bg-green-600/30 border-2 border-green-400 px-6 py-3 rounded-lg">
                    <div className="text-xs uppercase tracking-wider">Deploy Phase</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      {reinforcements} armies
                    </div>
                  </div>
                )}
                
                {phase === 'attack' && (
                  <div className="bg-red-600/30 border-2 border-red-400 px-6 py-3 rounded-lg">
                    <div className="text-xs uppercase tracking-wider">Attack Phase</div>
                    <div className="text-xl font-bold flex items-center gap-2">
                      <Swords className="w-5 h-5" />
                      Choose targets
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          
          {/* Game Map */}
          <div className="flex-1 bg-slate-800/50 rounded-xl p-6 border border-purple-500/30 relative overflow-auto">
            <svg width="700" height="550" className="mx-auto">
              {/* Draw connections */}
              {territoryStates.map(terr => 
                terr.neighbors.map(neighborId => {
                  const neighbor = territoryStates.find(t => t.id === neighborId);
                  return (
                    <line
                      key={`${terr.id}-${neighborId}`}
                      x1={terr.x}
                      y1={terr.y}
                      x2={neighbor.x}
                      y2={neighbor.y}
                      stroke="#475569"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  );
                })
              )}

              {/* Draw territories */}
              {territoryStates.map(terr => {
                const owner = activePlayers[terr.owner];
                const isSelected = selectedTerritory?.id === terr.id;
                const canAttack = attackFrom && terr.neighbors.includes(attackFrom.id) && terr.owner !== currentPlayer;
                
                return (
                  <g key={terr.id}>
                    {/* Glow effect for attackable territories */}
                    {canAttack && (
                      <circle
                        cx={terr.x}
                        cy={terr.y}
                        r="42"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        opacity="0.6"
                        className="animate-pulse"
                      />
                    )}
                    
                    {/* Territory circle */}
                    <circle
                      cx={terr.x}
                      cy={terr.y}
                      r="35"
                      fill={owner ? owner.color : '#374151'}
                      stroke={isSelected ? '#fbbf24' : '#1e293b'}
                      strokeWidth={isSelected ? '4' : '2'}
                      className="cursor-pointer transition-all hover:stroke-white hover:stroke-4"
                      onClick={() => handleTerritoryClick(terr)}
                      opacity={terr.owner === currentPlayer ? '1' : '0.7'}
                    />
                    
                    {/* Army count */}
                    <text
                      x={terr.x}
                      y={terr.y}
                      textAnchor="middle"
                      dy=".3em"
                      className="text-2xl font-bold pointer-events-none"
                      fill="white"
                      stroke="#000"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {terr.armies}
                    </text>
                    
                    {/* Territory name */}
                    <text
                      x={terr.x}
                      y={terr.y + 50}
                      textAnchor="middle"
                      className="text-xs font-semibold pointer-events-none"
                      fill="white"
                      stroke="#000"
                      strokeWidth="2"
                      paintOrder="stroke"
                    >
                      {terr.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Phase Instructions */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-4 rounded-lg border border-purple-500/30">
              {phase === 'deploy' && (
                <div>
                  <div className="font-bold mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Deploy Phase
                  </div>
                  <div className="text-sm opacity-80">
                    Click your territories to place {reinforcements} reinforcements. 
                    {reinforcements > 0 && <button onClick={skipToAttack} className="ml-2 underline hover:text-yellow-400">Skip to Attack</button>}
                  </div>
                </div>
              )}
              
              {phase === 'attack' && !attackFrom && (
                <div>
                  <div className="font-bold mb-1 flex items-center gap-2">
                    <Swords className="w-4 h-4" />
                    Attack Phase
                  </div>
                  <div className="text-sm opacity-80">
                    Select one of your territories with 2+ armies to attack from.
                  </div>
                </div>
              )}
              
              {phase === 'attack' && attackFrom && (
                <div>
                  <div className="font-bold mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Attacking from {attackFrom.name}
                  </div>
                  <div className="text-sm opacity-80">
                    Click an adjacent enemy territory to attack, or click {attackFrom.name} again to cancel.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-80 flex flex-col gap-4">
            
            {/* Players */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
              <div className="font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players
              </div>
              <div className="space-y-2">
                {activePlayers.map((player, idx) => (
                  <div 
                    key={player.id}
                    className={`p-3 rounded-lg border-2 ${
                      idx === currentPlayer 
                        ? 'border-yellow-400 bg-yellow-400/10' 
                        : 'border-slate-600 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: player.color }}
                        />
                        <div className="font-semibold text-sm">{player.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-60">Territories</div>
                        <div className="font-bold">{player.territories}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Battle Log */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30 flex-1 overflow-hidden">
              <div className="font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Battle Log
              </div>
              <div className="space-y-2 text-xs overflow-y-auto h-32">
                {battleLog.map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-700/50 rounded border border-slate-600">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
              <button
                onClick={endTurn}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                End Turn
              </button>
              
              <div className="mt-3 text-xs text-center opacity-60">
                {phase === 'deploy' ? 'Place all armies to attack' : 'Attack enemies or end turn'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConquestWars;
