import React, { useState, useEffect, useMemo } from 'react';
import { Swords, Shield, Users, Crown, Map, Zap, Trophy, Github, ExternalLink, ArrowRight, Skull } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  color: string;
  active: boolean;
  eliminated?: boolean;
}

interface Territory {
  id: number;
  name: string;
  x: number;
  y: number;
  neighbors: number[];
}

interface TerritoryState extends Territory {
  armies: number;
  owner: number | null; // index in activePlayers
}

const initialTerritories: Territory[] = [
  { id: 1, name: 'North Wasteland', x: 150, y: 50, neighbors: [2, 4, 5] },
  { id: 2, name: 'Eastern Peaks', x: 350, y: 80, neighbors: [1, 3, 6] },
  { id: 3, name: 'Dragon Isles', x: 500, y: 120, neighbors: [2, 7] },
  { id: 4, name: 'Central Plains', x: 100, y: 180, neighbors: [1, 5, 8, 9] },
  { id: 5, name: 'Capital City', x: 250, y: 160, neighbors: [1, 4, 6, 9, 10] },
  { id: 6, name: 'Mountain Pass', x: 400, y: 180, neighbors: [2, 5, 7, 10, 11] },
  { id: 7, name: 'Coastal Fortress', x: 550, y: 200, neighbors: [3, 6, 12] },
  { id: 8, name: 'Western Woods', x: 80, y: 320, neighbors: [4, 9, 13] },
  { id: 9, name: 'Valley Kingdom', x: 200, y: 300, neighbors: [4, 5, 8, 10, 14] },
  { id: 10, name: 'Trade Hub', x: 320, y: 290, neighbors: [5, 6, 9, 11, 14, 15] },
  { id: 11, name: 'Desert Outpost', x: 450, y: 310, neighbors: [6, 7, 10, 12, 15] },
  { id: 12, name: 'Port City', x: 580, y: 330, neighbors: [7, 11, 16] },
  { id: 13, name: 'Dark Forest', x: 120, y: 420, neighbors: [8, 14] },
  { id: 14, name: 'Ancient Ruins', x: 250, y: 410, neighbors: [9, 10, 13, 15] },
  { id: 15, name: 'Volcano Base', x: 380, y: 420, neighbors: [10, 11, 14, 16] },
  { id: 16, name: 'Southern Isles', x: 520, y: 440, neighbors: [12, 15] },
];

export default function ConquestWars() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'victory'>('setup');
  const [phase, setPhase] = useState<'deploy' | 'attack' | 'fortify'>('deploy');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Red Empire', color: '#ef4444', active: true },
    { id: 2, name: 'Blue Kingdom', color: '#3b82f6', active: true },
    { id: 3, name: 'Green Alliance', color: '#22c55e', active: false },
    { id: 4, name: 'Yellow Dynasty', color: '#eab308', active: false },
  ]);

  const activePlayers = useMemo(() => players.filter(p => p.active && !p.eliminated), [players]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const currentPlayer = activePlayers[currentPlayerIdx];

  const [territoryStates, setTerritoryStates] = useState<TerritoryState[]>(
    initialTerritories.map(t => ({ ...t, armies: 0, owner: null }))
  );

  const [selectedFrom, setSelectedFrom] = useState<TerritoryState | null>(null);
  const [selectedTo, setSelectedTo] = useState<TerritoryState | null>(null);
  const [reinforcements, setReinforcements] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [diceAnimation, setDiceAnimation] = useState<{ attacker: number[]; defender: number[] } | null>(null);

  // Initial setup
  useEffect(() => {
    if (gameState !== 'setup') return;

    const activeCount = activePlayers.length;
    const armiesPerPlayer = activeCount === 2 ? 40 : activeCount === 3 ? 35 : 30;

    let territoryIndex = 0;
    const setupTerritories = initialTerritories.map(t => {
      const ownerIdx = territoryIndex % activeCount;
      territoryIndex++;
      return { ...t, owner: ownerIdx, armies: 3 };
    });

    // Distribute remaining armies randomly
    const remaining = activeCount * (armiesPerPlayer - 3 * (16 / activeCount));
    let extraTerritories = [...setupTerritories];
    for (let i = 0; i < remaining; i++) {
      const randTerr = extraTerritories[Math.floor(Math.random() * 16)];
      if (randTerr.owner !== null) {
        randTerr.armies++;
      }
    }

    setTerritoryStates(extraTerritories);
    calculateReinforcements(extraTerritories, 0);
    setGameState('playing');
    addLog('Game started! Initial territories claimed.');
  }, [gameState, activePlayers.length]);

  const playerTerritories = useMemo(() => {
    return territoryStates.reduce((acc, t) => {
      if (t.owner !== null) acc[t.owner] = (acc[t.owner] || 0) + 1;
      return acc;
    }, [] as number[]);
  }, [territoryStates]);

  const calculateReinforcements = (territories: TerritoryState[], playerIdx: number) => {
    const territoriesOwned = territories.filter(t => t.owner === playerIdx).length;
    const base = Math.max(3, Math.floor(territoriesOwned / 3));
    // Future: continent bonuses here
    setReinforcements(base);
  };

  const addLog = (msg: string) => {
    setBattleLog(prev => [msg, ...prev].slice(0, 8));
  };

  const rollDice = (count: number): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
  };

  const performAttack = (from: TerritoryState, to: TerritoryState) => {
    const attackerDiceCount = Math.min(3, from.armies - 1);
    const defenderDiceCount = Math.min(2, to.armies);

    const attackerRolls = rollDice(attackerDiceCount);
    const defenderRolls = rollDice(defenderDiceCount);

    setDiceAnimation({ attacker: attackerRolls, defender: defenderRolls });

    let attackerLosses = 0;
    let defenderLosses = 0;

    for (let i = 0; i < Math.min(attackerRolls.length, defenderRolls.length); i++) {
      if (attackerRolls[i] > defenderRolls[i]) defenderLosses++;
      else attackerLosses++;
    }

    setTimeout(() => {
      setDiceAnimation(null);
      const newTerritories = territoryStates.map(t => {
        if (t.id === from.id) return { ...t, armies: t.armies - attackerLosses };
        if (t.id === to.id) {
          const newArmies = t.armies - defenderLosses;
          if (newArmies <= 0) {
            addLog(`⚔️ ${currentPlayer.name} conquered ${to.name}!`);
            return { ...t, owner: currentPlayerIdx, armies: attackerDiceCount };
          }
          return { ...t, armies: newArmies };
        }
        return t;
      });

      // Move armies after conquest
      if (newTerritories.find(t => t.id === to.id)?.owner === currentPlayerIdx) {
        const fromTerr = newTerritories.find(t => t.id === from.id)!;
        fromTerr.armies -= attackerDiceCount;
        newTerritories.find(t => t.id === to.id)!.armies += attackerDiceCount - 1;
      }

      setTerritoryStates(newTerritories);
      checkEliminations(newTerritories);
      checkVictory(newTerritories);
      addLog(`Battle: ${from.name} → ${to.name} | A:[${attackerRolls.join()}] D:[${defenderRolls.join()}]`);
    }, 1200);
  };

  const checkEliminations = (territories: TerritoryState[]) => {
    const ownedCounts = territories.reduce((acc, t) => {
      if (t.owner !== null) acc[t.owner] = (acc[t.owner] || 0) + 1;
      return acc;
    }, [] as number[]);

    setPlayers(prev => prev.map(p => {
      const idx = activePlayers.findIndex(ap => ap.id === p.id);
      if (idx !== -1 && ownedCounts[idx] === 0) {
        addLog(`💀 ${p.name} has been eliminated!`);
        return { ...p, eliminated: true };
      }
      return p;
    }));
  };

  const checkVictory = (territories: TerritoryState[]) => {
    const winnerIdx = ownedCounts.findIndex(count => count === 16);
    if (winnerIdx !== -1 && activePlayers[winnerIdx]) {
      setGameState('victory');
      addLog(`🎉 ${activePlayers[winnerIdx].name} conquered the world!`);
    }
  };

  const endTurn = () => {
    const nextIdx = (currentPlayerIdx + 1) % activePlayers.length;
    setCurrentPlayerIdx(nextIdx);
    setPhase('deploy');
    setSelectedFrom(null);
    setSelectedTo(null);
    calculateReinforcements(territoryStates, nextIdx);
    addLog(`${activePlayers[nextIdx].name}'s turn — ${reinforcements} reinforcements`);
  };

  const handleTerritoryClick = (terr: TerritoryState) => {
    if (!currentPlayer || terr.owner === null) return;

    if (phase === 'deploy' && terr.owner === currentPlayerIdx && reinforcements > 0) {
      setTerritoryStates(prev => prev.map(t =>
        t.id === terr.id ? { ...t, armies: t.armies + 1 } : t
      ));
      setReinforcements(r => r - 1);
      if (reinforcements === 1) addLog(`${currentPlayer.name} finished deploying`);
    }

    else if (phase === 'attack') {
      if (!selectedFrom && terr.owner === currentPlayerIdx && terr.armies > 1) {
        setSelectedFrom(terr);
      } else if (selectedFrom?.id === terr.id) {
        setSelectedFrom(null);
      } else if (selectedFrom && terr.owner !== currentPlayerIdx && selectedFrom.neighbors.includes(terr.id)) {
        performAttack(selectedFrom, terr);
        setSelectedFrom(null);
      }
    }

    else if (phase === 'fortify') {
      if (!selectedFrom && terr.owner === currentPlayerIdx && terr.armies > 1) {
        setSelectedFrom(terr);
      } else if (selectedFrom && terr.owner === currentPlayerIdx && selectedFrom.neighbors.includes(terr.id)) {
        setSelectedTo(terr);
        // Fortify happens on End Turn or separate button
      } else if (selectedFrom?.id === terr.id) {
        setSelectedFrom(null);
        setSelectedTo(null);
      }
    }
  };

  const winner = activePlayers.find((_, idx) => playerTerritories[idx] === 16);

  if (gameState === 'victory' && winner) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-8 p-12 bg-slate-800/90 backdrop-blur rounded-3xl border-4 border-yellow-500 shadow-2xl">
          <Trophy className="w-32 h-32 text-yellow-400 mx-auto animate-pulse" />
          <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            TOTAL VICTORY
          </h1>
          <div className="flex items-center justify-center gap-6 text-4xl">
            <div className="w-20 h-20 rounded-full border-8 border-white shadow-2xl" style={{ backgroundColor: winner.color }} />
            <div className="font-bold">{winner.name}</div>
          </div>
          <p className="text-2xl text-gray-300">has conquered all territories!</p>
          <div className="flex gap-6 justify-center mt-10">
            <button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-500 px-10 py-5 rounded-xl font-bold text-xl transition transform hover:scale-110">
              Play Again
            </button>
            <a href="https://github.com" className="bg-slate-700 hover:bg-slate-600 px-8 py-5 rounded-xl font-bold text-xl flex items-center gap-3 transition">
              <Github /> GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
        <div className="max-w-screen-2xl mx-auto">
          <header className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <Crown className="w-10 h-10 text-yellow-400" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Conquest Wars
                </h1>
              </div>
              <div className="text-sm bg-purple-800/50 px-4 py-2 rounded-lg border border-purple-600">
                Classic Risk-style • Built with React + Tailwind
              </div>
            </div>

            {/* Current Turn */}
            {currentPlayer && (
              <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 p-6 rounded-2xl border-2 border-purple-500 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl" style={{ backgroundColor: currentPlayer.color }} />
                    <div>
                      <h2 className="text-3xl font-bold">{currentPlayer.name}'s Turn</h2>
                      <p className="text-lg opacity-90">{playerTerritories[currentPlayerIdx]} territories</p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-center">
                    {phase === 'deploy' && (
                      <div className="bg-emerald-600/30 border-2 border-emerald-400 px-8 py-4 rounded-xl text-center">
                        <div className="text-sm font-bold uppercase">Deploy</div>
                        <div className="text-3xl font-bold">{reinforcements} <Shield className="inline w-8 h-8" /></div>
                      </div>
                    )}
                    {phase === 'attack' && (
                      <div className="bg-red-600/30 border-2 border-red-400 px-8 py-4 rounded-xl">
                        <Swords className="w-12 h-12 mx-auto" />
                        <div className="text-sm font-bold uppercase">Attack Phase</div>
                      </div>
                    )}
                    {phase === 'fortify' && (
                      <div className="bg-blue-600/30 border-2 border-blue-400 px-8 py-4 rounded-xl">
                        <ArrowRight className="w-12 h-12 mx-auto" />
                        <div className="text-sm font-bold uppercase">Fortify</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3 bg-slate-800/60 rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden">
              <svg viewBox="0 0 700 550" className="w-full h-auto">
                {/* Connections */}
                {territoryStates.flatMap(terr =>
                  terr.neighbors.map(nid => {
                    const n = territoryStates.find(t => t.id === nid);
                    if (!n || terr.id >= nid) return null;
                    return (
                      <line
                        key={`${terr.id}-${nid}`}
                        x1={terr.x} y1={terr.y}
                        x2={n.x} y2={n.y}
                        stroke="#475569"
                        strokeWidth="3"
                        opacity="0.4"
                      />
                    );
                  })
                )}

                {/* Attack Arrow */}
                {phase === 'attack' && selectedFrom && selectedTo && (
                  <path
                    d={`M ${selectedFrom.x} ${selectedFrom.y} L ${selectedTo.x} ${selectedTo.y}`}
                    stroke="#ef4444"
                    strokeWidth="6"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    opacity="0.8"
                    className="animate-pulse"
                  />
                )}

                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Territories */}
                {territoryStates.map(terr => {
                  const owner = terr.owner !== null ? activePlayers[terr.owner] : null;
                  const isSelected = selectedFrom?.id === terr.id;
                  const isTarget = phase === 'attack' && selectedFrom && selectedFrom.neighbors.includes(terr.id) && terr.owner !== currentPlayerIdx;
                  const isFortifyTarget = phase === 'fortify' && selectedFrom && selectedFrom.neighbors.includes(terr.id) && terr.owner === currentPlayerIdx;

                  return (
                    <g key={terr.id} className="cursor-pointer" onClick={() => handleTerritoryClick(terr)}>
                      {/* Glow */}
                      {(isTarget || isFortifyTarget) && (
                        <circle cx={terr.x} cy={terr.y} r="45" fill="none" stroke={isTarget ? '#ef4444' : '#22d3ee'} strokeWidth="4" opacity="0.7">
                          <animate attributeName="r" values="40;50;40" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}

                      <circle
                        cx={terr.x} cy={terr.y} r="38"
                        fill={owner ? owner.color : '#1e293b'}
                        stroke={isSelected ? '#fbbf24' : owner ? '#000' : '#475569'}
                        strokeWidth={isSelected ? 6 : 3}
                        className="transition-all hover:r-42"
                      />

                      <text x={terr.x} y={terr.y + 8} textAnchor="middle" className="text-2xl font-bold fill-white" stroke="#000" strokeWidth="4" paintOrder="stroke">
                        {terr.armies}
                      </text>

                      <text x={terr.x} y={terr.y + 58} textAnchor="middle" className="text-xs font-bold fill-gray-300">
                        {terr.name}
                      </text>
                    </g>
                  );
                })}

                {/* Dice Animation */}
                {diceAnimation && (
                  <g transform="translate(300, 250)">
                    <text x="0" y="-40" textAnchor="middle" className="text-3xl font-bold fill-red-400">⚔️ BATTLE ⚔️</text>
                    <text x="-80" y="0" className="text-4xl">{diceAnimation.attacker.map((d, i) => <tspan key={i} x="-80" dy={i === 0 ? 0 : 50}>{'🎲 '.repeat(d)}</tspan>)}</text>
                    <text x="80" y="0" className="text-4xl">{diceAnimation.defender.map((d, i) => <tspan key={i} x="80" dy={i === 0 ? 0 : 50}>{'🎲 '.repeat(d)}</tspan>)}</text>
                  </g>
                )}
              </svg>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur p-4 rounded-xl border border-purple-500/50">
                {phase === 'deploy' && (
                  <p className="text-lg font-semibold">🛡️ Click your territories to deploy {reinforcements} armies {reinforcements > 0 && <button onClick={() => setPhase('attack')} className="ml-3 underline text-yellow-400 hover:text-yellow-300">Skip →</button>}</p>
                )}
                {phase === 'attack' && !selectedFrom && <p className="text-lg font-semibold">⚔️ Select a territory with 2+ armies to attack from</p>}
                {phase === 'attack' && selectedFrom && <p className="text-lg font-semibold text-red-400">→ Click an adjacent enemy territory to attack (or reclick to cancel)</p>}
                {phase === 'fortify' && <p className="text-lg font-semibold text-cyan-400">Move armies: select source → destination (one move per turn)</p>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Players */}
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users /> Players</h3>
                {activePlayers.map((p, idx) => (
                  <div key={p.id} className={`p-4 rounded-lg mb-3 border-2 ${idx === currentPlayerIdx ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-600'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: p.color }} />
                        <span className="font-semibold">{p.name}</span>
                        {playerTerritories[idx] === 0 && <Skull className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{playerTerritories[idx] || 0}</div>
                        <div className="text-xs opacity-70">territories</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Battle Log */}
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-purple-500/30 flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Zap /> Battle Log</h3>
                <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                  {battleLog.length === 0 && <p className="text-gray-500 italic">No battles yet...</p>}
                  {battleLog.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-700/50 rounded border border-slate-600">{log}</div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {phase === 'deploy' && reinforcements === 0 && (
                  <button onClick={() => setPhase('attack')} className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold text-xl transition transform hover:scale-105">
                    <Swords className="inline mr-2" /> Begin Attacks
                  </button>
                )}
                {phase === 'attack' && (
                  <button onClick={() => setPhase('fortify')} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-xl transition transform hover:scale-105">
                    <ArrowRight className="inline mr-2" /> Fortify Phase
                  </button>
                )}
                {phase === 'fortify' && (
                  <button onClick={endTurn} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold text-xl transition transform hover:scale-105">
                    End Turn →
                  </button>
                )}
                {phase !== 'fortify' && (
                  <button onClick={endTurn} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 rounded-xl font-bold text-xl transition transform hover:scale-105">
                    End Turn Early
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
