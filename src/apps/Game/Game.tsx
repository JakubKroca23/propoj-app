import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, BuildingType, UnitType } from './Engine/GameEngine';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import './Game.css';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  
  // React state mirroring engine variables for UI reactivity
  const [steel, setSteel] = useState(400);
  const [population, setPopulation] = useState(0);
  const [maxPopulation, setMaxPopulation] = useState(5);
  const [wave, setWave] = useState(1);
  const [waveTimer, setWaveTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [secondsPlayed, setSecondsPlayed] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);

  const authStore = useAuthStore();
  const gameStore = useGameStore();

  const userId = authStore.user?.$id || 'guest-id';
  const userName = authStore.user?.name || 'Neznámý strojař';

  useEffect(() => {
    // Načteme sín slávy
    gameStore.loadHighScores();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicializace herního enginu
    const gameEngine = new GameEngine(
      canvasRef.current,
      () => {
        // State update callback
        setSteel(Math.floor(gameEngine.steel));
        setPopulation(gameEngine.currentPopulation);
        setMaxPopulation(gameEngine.maxPopulation);
        setWave(gameEngine.wave);
        setWaveTimer(Math.max(0, Math.floor(gameEngine.waveTimer)));
        setScore(gameEngine.score);
        setSecondsPlayed(gameEngine.secondsPlayed);
      },
      (finalScore, duration, wavesSurvived) => {
        // Game Over callback
        setIsGameOver(true);
        gameStore.saveHighScore(finalScore, duration, wavesSurvived, userId, userName);
      }
    );

    setEngine(gameEngine);

    return () => {
      gameEngine.destroy();
    };
  }, [canvasRef]);

  const handleRestart = () => {
    setIsGameOver(false);
    if (engine) {
      engine.destroy();
    }
    
    // Znovu sestavit engine
    if (!canvasRef.current) return;
    const gameEngine = new GameEngine(
      canvasRef.current,
      () => {
        setSteel(Math.floor(gameEngine.steel));
        setPopulation(gameEngine.currentPopulation);
        setMaxPopulation(gameEngine.maxPopulation);
        setWave(gameEngine.wave);
        setWaveTimer(Math.max(0, Math.floor(gameEngine.waveTimer)));
        setScore(gameEngine.score);
        setSecondsPlayed(gameEngine.secondsPlayed);
      },
      (finalScore, duration, wavesSurvived) => {
        setIsGameOver(true);
        gameStore.saveHighScore(finalScore, duration, wavesSurvived, userId, userName);
      }
    );
    setEngine(gameEngine);
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!engine) return;
    engine.selectedBuildingToBuild = type;
    setSelectedBuilding(type);
  };

  const handleBuildUnit = (type: UnitType) => {
    if (!engine) return;
    engine.buildUnit(type);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-app-container">
      {/* 1. Horní status bar */}
      <div className="game-status-bar">
        <div className="status-item highlight">
          <span className="icon">⚙️</span>
          <span className="label">Montáž s.r.o.</span>
        </div>
        <div className="status-item">
          <span className="icon">🔩</span>
          <span className="label">Ocel:</span>
          <span className="value text-emerald">{steel} t</span>
        </div>
        <div className="status-item">
          <span className="icon">🚜</span>
          <span className="label">Flotila:</span>
          <span className={`value ${population >= maxPopulation ? 'text-rose' : 'text-indigo'}`}>
            {population}/{maxPopulation}
          </span>
        </div>
        <div className="status-item">
          <span className="icon">⚠️</span>
          <span className="label">Vlna:</span>
          <span className="value text-rose">{wave}</span>
        </div>
        <div className="status-item">
          <span className="icon">⏱️</span>
          <span className="label">Příští útok za:</span>
          <span className="value text-amber">{waveTimer}s</span>
        </div>
        <div className="status-item">
          <span className="icon">🏆</span>
          <span className="label">Skóre:</span>
          <span className="value text-purple">{score}</span>
        </div>
        <div className="status-item">
          <span className="icon">🕒</span>
          <span className="value">{formatTime(secondsPlayed)}</span>
        </div>
      </div>

      <div className="game-main-content">
        {/* 2. Herní Canvas */}
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={(e) => engine?.handleMouseDown(e)}
            onMouseMove={(e) => engine?.handleMouseMove(e)}
            onMouseUp={(e) => engine?.handleMouseUp(e)}
            onContextMenu={(e) => engine?.handleContextMenu(e)}
          />

          {/* Nápověda pro stavění budovy */}
          {engine?.selectedBuildingToBuild && (
            <div className="building-placement-hint">
              <span>Kliknutím na mapu umístíte budovu ({engine.selectedBuildingToBuild.toUpperCase()})</span>
            </div>
          )}
        </div>

        {/* 3. Pravý ovládací panel */}
        <div className="game-side-panel">
          <div className="side-section">
            <h3 className="section-title">🏗️ Stavba budov</h3>
            <div className="actions-grid">
              <button
                className={`game-btn ${selectedBuilding === 'hq' ? 'active' : ''}`}
                onClick={() => handleSelectBuilding('hq')}
                title="Výroba Šasi a Jeřábů, sběrné místo oceli."
              >
                <span className="btn-icon">🏭</span>
                <span className="btn-label">Hlavní dílna</span>
                <span className="btn-cost">400🔩</span>
              </button>
              <button
                className={`game-btn ${selectedBuilding === 'assembly' ? 'active' : ''}`}
                onClick={() => handleSelectBuilding('assembly')}
                title="Montáž čelních nakladačů a hasičských plošin."
              >
                <span className="btn-icon">🔧</span>
                <span className="btn-label">Montážní hala</span>
                <span className="btn-cost">200🔩</span>
              </button>
              <button
                className={`game-btn ${selectedBuilding === 'depot' ? 'active' : ''}`}
                onClick={() => handleSelectBuilding('depot')}
                title="Zvyšuje populační limit vozidel o 5."
              >
                <span className="btn-icon">📦</span>
                <span className="btn-label">Sklad dílů</span>
                <span className="btn-cost">100🔩</span>
              </button>
              <button
                className={`game-btn ${selectedBuilding === 'mine' ? 'active' : ''}`}
                onClick={() => handleSelectBuilding('mine')}
                title="Automaticky těží ocel plynule v čase."
              >
                <span className="btn-icon">⛏️</span>
                <span className="btn-label">Ocelový důl</span>
                <span className="btn-cost">150🔩</span>
              </button>
            </div>
          </div>

          <div className="side-section">
            <h3 className="section-title">🔧 Výroba & Montáž</h3>
            <div className="actions-grid">
              <button
                className="game-btn secondary"
                onClick={() => handleBuildUnit('chassis')}
                title="Rychlý sběrač oceli ze Šrotiště."
              >
                <span className="btn-icon">🚜</span>
                <span className="btn-label">Šasi (Worker)</span>
                <span className="btn-cost">50🔩</span>
              </button>
              <button
                className="game-btn secondary"
                onClick={() => handleBuildUnit('crane')}
                title="Jeřábový vůz. Nutný pro dokončení rozestavěných budov."
              >
                <span className="btn-icon">🏗️</span>
                <span className="btn-label">Jeřáb (Builder)</span>
                <span className="btn-cost">75🔩</span>
              </button>
              <button
                className="game-btn secondary"
                onClick={() => handleBuildUnit('loader')}
                title="Čelní nakladač s radlicí. Bojovník na blízko."
              >
                <span className="btn-icon">🚜</span>
                <span className="btn-label">Nakladač (Melee)</span>
                <span className="btn-cost">100🔩</span>
              </button>
              <button
                className="game-btn secondary"
                onClick={() => handleBuildUnit('fire')}
                title="Hasičský vůz s vodním dělem. Bojovník na dálku."
              >
                <span className="btn-icon">🚒</span>
                <span className="btn-label">Hasiči (Ranged)</span>
                <span className="btn-cost">150🔩</span>
              </button>
            </div>
          </div>

          <div className="side-section compact-instructions">
            <h4 className="instructions-title">🎮 Rychlé ovládání:</h4>
            <ul>
              <li><strong>Levé myšítko + tažení</strong>: Výběr více bojových strojů.</li>
              <li><strong>Pravé myšítko</strong>: Přesun vybraných strojů.</li>
              <li><strong>Pravé myšítko na Šrotiště 🔩 (s Šasi)</strong>: Zahájí těžbu oceli.</li>
              <li><strong>Stavba budovy</strong>: Zvolte budovu, klikněte na mapu. Jeřáb 🏗️ musí přijet k staveništi pro jeho dostavění!</li>
            </ul>
          </div>

          <button
            className="game-btn leaderboard-trigger"
            onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
          >
            🏆 {isLeaderboardOpen ? 'Zpět do montáže' : 'Síň slávy (Leaderboard)'}
          </button>
        </div>
      </div>

      {/* 4. Síň slávy (Leaderboard) Overlay */}
      {isLeaderboardOpen && (
        <div className="leaderboard-overlay glass-panel">
          <div className="leaderboard-header">
            <h2>🏆 Síň slávy — Nejlepší strojaři</h2>
            <button className="close-btn" onClick={() => setIsLeaderboardOpen(false)}>×</button>
          </div>
          {gameStore.isLoading ? (
            <div className="leaderboard-loading">Načítání rekordů...</div>
          ) : (
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Pozice</span>
                <span>Jméno</span>
                <span>Skóre</span>
                <span>Přežité vlny</span>
                <span>Doba hry</span>
              </div>
              {gameStore.highScores.length === 0 ? (
                <div className="leaderboard-empty">Zatím žádné rekordy. Buďte první!</div>
              ) : (
                gameStore.highScores.map((scoreItem, idx) => (
                  <div className={`table-row ${scoreItem.userId === userId ? 'current-user-row' : ''}`} key={scoreItem.$id || idx}>
                    <span className="row-rank">#{idx + 1}</span>
                    <span className="row-name">{scoreItem.userName}</span>
                    <span className="row-score text-purple">{scoreItem.score}</span>
                    <span className="row-waves text-rose">{scoreItem.wavesSurvived}</span>
                    <span className="row-duration">{formatTime(scoreItem.durationSeconds)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Game Over / Konec Hry Modal */}
      {isGameOver && (
        <div className="game-over-modal-overlay">
          <div className="game-over-modal glass-panel">
            <h1 className="modal-title text-rose animate-pulse">⚙️ DÍLNA ZNIČENA!</h1>
            <p className="modal-desc">
              Konkurenční sabotéři úspěšně infiltrovali a zničili vaši hlavní dílnu. Výroba byla pozastavena.
            </p>
            <div className="game-results">
              <div className="result-item">
                <span className="label">Finální skóre:</span>
                <span className="value text-purple">{score + steel}</span>
              </div>
              <div className="result-item">
                <span className="label">Doba obrany:</span>
                <span className="value text-indigo">{formatTime(secondsPlayed)}</span>
              </div>
              <div className="result-item">
                <span className="label">Přežité vlny:</span>
                <span className="value text-rose">{wave - 1}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn" onClick={handleRestart}>
                🚀 Spustit novou montáž
              </button>
              <button className="modal-btn secondary" onClick={() => { setIsGameOver(false); setIsLeaderboardOpen(true); }}>
                🏆 Zobrazit Síň slávy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
