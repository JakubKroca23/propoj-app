export interface Position {
  x: number;
  y: number;
}

export type UnitType = 'chassis' | 'crane' | 'loader' | 'fire';
export type BuildingType = 'hq' | 'assembly' | 'depot' | 'mine';
export type GameFaction = 'player' | 'enemy';

export interface GameUnit {
  id: string;
  type: UnitType;
  faction: GameFaction;
  x: number;
  y: number;
  targetX: number | null;
  targetY: number | null;
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
  attackCooldown: number;
  selected?: boolean;
  angle: number;
  // Pro těžbu oceli
  carryingSteel: number;
  isMining: boolean;
  targetMineId: string | null;
}

export interface GameBuilding {
  id: string;
  type: BuildingType;
  x: number; // grid X
  y: number; // grid Y
  width: number; // grid šířka
  height: number; // grid výška
  hp: number;
  maxHp: number;
  isConstructing: boolean;
  constructionProgress: number; // 0 až 100
}

export interface SteelNode {
  id: string;
  x: number;
  y: number;
  steelLeft: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  damage: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  
  // Game State
  public units: GameUnit[] = [];
  public buildings: GameBuilding[] = [];
  public steelNodes: SteelNode[] = [];
  public particles: Particle[] = [];
  public projectiles: Projectile[] = [];
  
  public steel = 400;
  public maxPopulation = 5;
  public currentPopulation = 0;
  public wave = 1;
  public waveTimer = 30; // 30 vteřin do další vlny
  public score = 0;
  public isGameOver = false;
  public isVictory = false;
  public secondsPlayed = 0;
  
  // Grid settings
  private gridCols = 20;
  private gridRows = 15;
  private tileSize = 40; // 800 x 600 px herní plocha
  
  // Interaction state
  public selectedBuildingToBuild: BuildingType | null = null;
  private selectionStart: Position | null = null;
  private selectionEnd: Position | null = null;
  private isSelecting = false;
  
  // Callbacks pro React UI
  private onStateChange: (engine: GameEngine) => void;
  private onGameOver: (finalScore: number, seconds: number, waves: number) => void;
  
  private lastTime = 0;
  private gameTimeAccumulator = 0;
  private waveTimeAccumulator = 0;

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange: (engine: GameEngine) => void,
    onGameOver: (finalScore: number, seconds: number, waves: number) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Nelze inicializovat Canvas 2D kontext.');
    this.ctx = context;
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    
    this.initGame();
    this.startLoop();
  }

  private initGame() {
    this.units = [];
    this.buildings = [];
    this.steelNodes = [];
    this.particles = [];
    this.projectiles = [];
    this.steel = 400;
    this.maxPopulation = 5;
    this.currentPopulation = 0;
    this.wave = 1;
    this.waveTimer = 30;
    this.score = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.secondsPlayed = 0;
    
    // 1. Založení Hlavní dílny (HQ) na souřadnicích (2, 5)
    this.buildings.push({
      id: 'hq-1',
      type: 'hq',
      x: 2,
      y: 5,
      width: 3,
      height: 3,
      hp: 1000,
      maxHp: 1000,
      isConstructing: false,
      constructionProgress: 100,
    });
    
    // 2. Přidání počátečních jednotek: 2x Šasi (dělníci), 1x Jeřáb (stavitel)
    this.spawnUnit('chassis', 'player', 200, 200);
    this.spawnUnit('chassis', 'player', 200, 260);
    this.spawnUnit('crane', 'player', 150, 230);
    
    // 3. Rozmístění ocelových šrotišť (Steel Nodes) na mapě
    this.steelNodes.push({ id: 'steel-1', x: 10, y: 3, steelLeft: 2000 });
    this.steelNodes.push({ id: 'steel-2', x: 14, y: 11, steelLeft: 2000 });
    this.steelNodes.push({ id: 'steel-3', x: 18, y: 2, steelLeft: 1500 });
    this.steelNodes.push({ id: 'steel-4', x: 17, y: 7, steelLeft: 1500 });

    this.recalculateLimits();
  }

  private startLoop() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      
      if (!this.isGameOver) {
        this.update(dt);
      }
      this.render();
      
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private recalculateLimits() {
    // Každé HQ dává +5, každý Depot dává +5
    const builtHq = this.buildings.filter(b => b.type === 'hq' && !b.isConstructing).length;
    const builtDepots = this.buildings.filter(b => b.type === 'depot' && !b.isConstructing).length;
    this.maxPopulation = builtHq * 5 + builtDepots * 5;
    
    // Aktuální populace
    this.currentPopulation = this.units.filter(u => u.faction === 'player').length;
    this.onStateChange(this);
  }

  private spawnUnit(type: UnitType, faction: GameFaction, x: number, y: number) {
    const id = `${type}-${faction}-${Math.random().toString(36).substr(2, 9)}`;
    let hp = 100;
    let speed = 1.8;
    let size = 10;
    
    if (type === 'chassis') {
      hp = 80;
      speed = 2.0;
    } else if (type === 'crane') {
      hp = 100;
      speed = 1.5;
    } else if (type === 'loader') {
      hp = 150;
      speed = 1.7;
    } else if (type === 'fire') {
      hp = 90;
      speed = 1.6;
    }

    // Pro nepřátele škálujeme HP a sílu s vlnami
    if (faction === 'enemy') {
      hp = 60 + this.wave * 12;
      speed = 1.1 + (this.wave * 0.05);
    }

    this.units.push({
      id,
      type,
      faction,
      x,
      y,
      targetX: null,
      targetY: null,
      hp,
      maxHp: hp,
      speed,
      size,
      attackCooldown: 0,
      angle: 0,
      carryingSteel: 0,
      isMining: false,
      targetMineId: null,
    });
    
    this.recalculateLimits();
  }

  private update(dt: number) {
    // 1. Časomíra hry a vln
    this.gameTimeAccumulator += dt;
    if (this.gameTimeAccumulator >= 1.0) {
      this.secondsPlayed += 1;
      this.gameTimeAccumulator -= 1.0;
    }

    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.spawnEnemyWave();
    }

    // 2. Těžební budovy dolů produkují automaticky ocel
    this.buildings.forEach(b => {
      if (b.type === 'mine' && !b.isConstructing) {
        // Těží 5 oceli každé 2 vteřiny
        if (!b.hp) return;
        this.steel += dt * 3.5; // plynule
      }
    });

    // 3. Update střel
    this.projectiles = this.projectiles.filter(proj => {
      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 10) {
        // Zásah v cílové pozici (najít nejbližšího nepřítele k cíli)
        const targetUnit = this.units.find(u => Math.hypot(u.x - proj.targetX, u.y - proj.targetY) < 30);
        if (targetUnit) {
          targetUnit.hp -= proj.damage;
          this.createExplosion(targetUnit.x, targetUnit.y, proj.color, 8);
        }
        return false;
      }
      
      const angle = Math.atan2(dy, dx);
      proj.x += Math.cos(angle) * proj.speed * dt * 60;
      proj.y += Math.sin(angle) * proj.speed * dt * 60;
      return true;
    });

    // 4. Update jednotek
    this.units = this.units.filter(unit => {
      if (unit.hp <= 0) {
        // Smrt jednotky
        this.createExplosion(unit.x, unit.y, unit.faction === 'player' ? '#FF5555' : '#777777', 15);
        if (unit.faction === 'enemy') {
          this.score += 150 + this.wave * 20;
        }
        setTimeout(() => this.recalculateLimits(), 0);
        return false;
      }

      // Pohyb a orientace
      if (unit.targetX !== null && unit.targetY !== null) {
        const dx = unit.targetX - unit.x;
        const dy = unit.targetY - unit.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 5) {
          unit.angle = Math.atan2(dy, dx);
          unit.x += Math.cos(unit.angle) * unit.speed * dt * 60;
          unit.y += Math.sin(unit.angle) * unit.speed * dt * 60;
        } else {
          // Jednotka dorazila do cíle
          unit.targetX = null;
          unit.targetY = null;
          
          // Pokud je to Šasi a těžilo, pokračuje v těžbě / vykládání
          if (unit.type === 'chassis' && unit.isMining) {
            if (unit.carryingSteel > 0) {
              // Dovezl ocel do HQ -> vyložit!
              this.steel += unit.carryingSteel;
              this.createExplosion(unit.x, unit.y, '#10B981', 6);
              unit.carryingSteel = 0;
              // Jet zpět k dolu
              if (unit.targetMineId) {
                const mine = this.steelNodes.find(m => m.id === unit.targetMineId);
                if (mine) {
                  unit.targetX = mine.x * this.tileSize + this.tileSize / 2;
                  unit.targetY = mine.y * this.tileSize + this.tileSize / 2;
                }
              }
            } else {
              // Dojel k dolu -> vytěžit!
              if (unit.targetMineId) {
                const mine = this.steelNodes.find(m => m.id === unit.targetMineId);
                if (mine && mine.steelLeft > 0) {
                  const amount = Math.min(25, mine.steelLeft);
                  mine.steelLeft -= amount;
                  unit.carryingSteel = amount;
                  // Jet zpět do HQ
                  const hq = this.buildings.find(b => b.type === 'hq');
                  if (hq) {
                    unit.targetX = hq.x * this.tileSize + (hq.width * this.tileSize) / 2;
                    unit.targetY = hq.y * this.tileSize + (hq.height * this.tileSize) / 2;
                  }
                } else {
                  // Důl je prázdný
                  unit.isMining = false;
                  unit.targetMineId = null;
                }
              }
            }
          }
        }
      }

      // AI Boj a Cooldown
      if (unit.attackCooldown > 0) {
        unit.attackCooldown -= dt;
      }

      // AI nepřátel: jedou rovnou k Hlavní dílně (HQ) a útočí na budovy / hráče
      if (unit.faction === 'enemy') {
        const targetHq = this.buildings.find(b => b.type === 'hq');
        if (targetHq) {
          const hqPxX = targetHq.x * this.tileSize + (targetHq.width * this.tileSize) / 2;
          const hqPxY = targetHq.y * this.tileSize + (targetHq.height * this.tileSize) / 2;
          const distToHq = Math.hypot(hqPxX - unit.x, hqPxY - unit.y);
          
          // Pokud je daleko od HQ a nemá jiný cíl, jede k němu
          if (distToHq > 120 && unit.targetX === null) {
            unit.targetX = hqPxX + (Math.random() - 0.5) * 60;
            unit.targetY = hqPxY + (Math.random() - 0.5) * 60;
          }

          // Najít nejbližší hráčovu budovu nebo jednotku na útok
          let closestPlayerTarget: { x: number; y: number; hp: number } | null = null;
          let closestDist = 99999;
          
          this.buildings.forEach(b => {
            const bX = b.x * this.tileSize + (b.width * this.tileSize) / 2;
            const bY = b.y * this.tileSize + (b.height * this.tileSize) / 2;
            const dist = Math.hypot(bX - unit.x, bY - unit.y);
            if (dist < closestDist) {
              closestDist = dist;
              closestPlayerTarget = b;
            }
          });

          this.units.forEach(u => {
            if (u.faction === 'player') {
              const dist = Math.hypot(u.x - unit.x, u.y - unit.y);
              if (dist < closestDist) {
                closestDist = dist;
                closestPlayerTarget = u;
              }
            }
          });

          if (closestPlayerTarget && closestDist < 80) {
            // Zastavit se a útočit
            unit.targetX = null;
            unit.targetY = null;
            if (unit.attackCooldown <= 0) {
              (closestPlayerTarget as any).hp -= 10 + this.wave;
              unit.attackCooldown = 1.5;
              this.createExplosion((closestPlayerTarget as any).x || ((closestPlayerTarget as any).x * this.tileSize + 60), (closestPlayerTarget as any).y || ((closestPlayerTarget as any).y * this.tileSize + 60), '#FF3333', 5);
            }
          }
        }
      }

      // Hráčovi bojovníci útočí automaticky na nejbližší sabotéry
      if (unit.faction === 'player' && (unit.type === 'loader' || unit.type === 'fire')) {
        const closestEnemy = this.units.find(u => u.faction === 'enemy' && Math.hypot(u.x - unit.x, u.y - unit.y) < 180);
        if (closestEnemy && unit.attackCooldown <= 0) {
          if (unit.type === 'loader') {
            // Melee narážení
            if (Math.hypot(closestEnemy.x - unit.x, closestEnemy.y - unit.y) < 50) {
              closestEnemy.hp -= 20;
              unit.attackCooldown = 1.0;
              this.createExplosion(closestEnemy.x, closestEnemy.y, '#F59E0B', 8);
            } else {
              // Jet k němu
              unit.targetX = closestEnemy.x;
              unit.targetY = closestEnemy.y;
            }
          } else if (unit.type === 'fire') {
            // Ranged stříkání vody
            this.projectiles.push({
              id: Math.random().toString(),
              x: unit.x,
              y: unit.y,
              targetX: closestEnemy.x,
              targetY: closestEnemy.y,
              speed: 4,
              color: '#3B82F6',
              damage: 15,
            });
            unit.attackCooldown = 1.2;
            this.createExplosion(unit.x, unit.y, '#3B82F6', 4);
          }
        }
      }

      return true;
    });

    // 5. Update budov
    this.buildings = this.buildings.filter(b => {
      if (b.hp <= 0) {
        // Zničení budovy
        this.createExplosion(
          b.x * this.tileSize + (b.width * this.tileSize) / 2,
          b.y * this.tileSize + (b.height * this.tileSize) / 2,
          '#CC3333',
          30
        );
        
        // Pokud padlo HQ, je to game over!
        if (b.type === 'hq') {
          this.isGameOver = true;
          this.onGameOver(this.score + this.steel, this.secondsPlayed, this.wave);
        }
        
        setTimeout(() => this.recalculateLimits(), 0);
        return false;
      }

      // Výstavba budovy
      if (b.isConstructing) {
        // Najít jeřáb (Builder) stojící blízko stavby
        const builderNearby = this.units.find(u => u.type === 'crane' && Math.hypot(u.x - (b.x * this.tileSize + 60), u.y - (b.y * this.tileSize + 60)) < 100);
        if (builderNearby) {
          b.constructionProgress += dt * 15; // 15% za vteřinu
          this.createExplosion(builderNearby.x, builderNearby.y, '#6C47FF', 1);
          if (b.constructionProgress >= 100) {
            b.constructionProgress = 100;
            b.isConstructing = false;
            this.createExplosion(b.x * this.tileSize + 60, b.y * this.tileSize + 60, '#22C55E', 20);
            setTimeout(() => this.recalculateLimits(), 0);
          }
        }
      }

      return true;
    });

    // 6. Update částic (Particles)
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      return p.life > 0;
    });

    this.onStateChange(this);
  }

  private spawnEnemyWave() {
    this.waveTimer = 30; // Nových 30 vteřin
    
    // Spawne se 2 + wave * 1.5 sabotérů
    const count = Math.min(10, 2 + this.wave);
    const spawnPoints = [
      { x: 10, y: 10 },
      { x: 790, y: 10 },
      { x: 790, y: 590 },
      { x: 10, y: 590 }
    ];

    for (let i = 0; i < count; i++) {
      const pt = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      // Trošku rozptýlit souřadnice
      const rx = pt.x + (Math.random() - 0.5) * 40;
      const ry = pt.y + (Math.random() - 0.5) * 40;
      
      this.spawnUnit('chassis', 'enemy', rx, ry);
      this.createExplosion(rx, ry, '#CC0000', 10);
    }

    this.wave += 1;
    this.onStateChange(this);
  }

  private createExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      const life = Math.random() * 0.4 + 0.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        life,
        maxLife: life,
      });
    }
  }

  // Interakce a kreslení
  private render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    
    // 1. Kreslení jemné cyberpunkové mřížky na pozadí
    this.ctx.strokeStyle = 'rgba(108, 71, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let c = 0; c <= this.gridCols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.tileSize, 0);
      this.ctx.lineTo(c * this.tileSize, h);
      this.ctx.stroke();
    }
    for (let r = 0; r <= this.gridRows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.tileSize);
      this.ctx.lineTo(w, r * this.tileSize);
      this.ctx.stroke();
    }

    // 2. Kreslení Šrotišť (Steel Nodes)
    this.steelNodes.forEach(node => {
      if (node.steelLeft <= 0) return;
      const pxX = node.x * this.tileSize;
      const pxY = node.y * this.tileSize;
      
      // Zářící aura oceli
      this.ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      this.ctx.beginPath();
      this.ctx.arc(pxX + this.tileSize/2, pxY + this.tileSize/2, this.tileSize * 0.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Kreslení kovového šrotu
      this.ctx.fillStyle = '#10B981';
      this.ctx.strokeStyle = '#047857';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(pxX + 8, pxY + 8, this.tileSize - 16, this.tileSize - 16);
      this.ctx.strokeRect(pxX + 8, pxY + 8, this.tileSize - 16, this.tileSize - 16);

      // Kreslení piktogramu šrotu ⚙️
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '16px Outfit';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🔩', pxX + this.tileSize / 2, pxY + this.tileSize / 2);

      // Zbývající ocel
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.font = '10px Inter';
      this.ctx.fillText(`${node.steelLeft} t`, pxX + this.tileSize / 2, pxY + this.tileSize + 8);
    });

    // 3. Kreslení Budov
    this.buildings.forEach(b => {
      const pxX = b.x * this.tileSize;
      const pxY = b.y * this.tileSize;
      const pxW = b.width * this.tileSize;
      const pxH = b.height * this.tileSize;
      
      this.ctx.fillStyle = b.isConstructing ? 'rgba(108, 71, 255, 0.2)' : 'rgba(13, 15, 26, 0.8)';
      this.ctx.strokeStyle = b.type === 'hq' ? '#6C47FF' : b.type === 'assembly' ? '#3B82F6' : b.type === 'depot' ? '#F59E0B' : '#10B981';
      this.ctx.lineWidth = 3;
      
      // Kreslení zaobleného skleněného panelu budovy
      this.ctx.beginPath();
      this.ctx.roundRect(pxX + 4, pxY + 4, pxW - 8, pxH - 8, 8);
      this.ctx.fill();
      this.ctx.stroke();

      // Piktogram budovy
      let emoji = '🏢';
      let title = 'HQ';
      if (b.type === 'hq') { emoji = '🏭'; title = 'Dílna'; }
      else if (b.type === 'assembly') { emoji = '🔧'; title = 'Hala'; }
      else if (b.type === 'depot') { emoji = '📦'; title = 'Sklad'; }
      else if (b.type === 'mine') { emoji = '⛏️'; title = 'Důl'; }

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `${pxW * 0.28}px Outfit`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(emoji, pxX + pxW/2, pxY + pxH/2 - 10);

      // Název budovy
      this.ctx.font = '11px Inter';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillText(title, pxX + pxW/2, pxY + pxH/2 + 20);

      // HP Bar nebo progress bar stavby
      if (b.isConstructing) {
        // Kreslení fialového progress baru
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(pxX + 10, pxY + pxH - 18, pxW - 20, 6);
        this.ctx.fillStyle = '#6C47FF';
        this.ctx.fillRect(pxX + 10, pxY + pxH - 18, (pxW - 20) * (b.constructionProgress / 100), 6);
      } else {
        // Kreslení standardního HP baru
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(pxX + 10, pxY + pxH - 18, pxW - 20, 4);
        const hpPct = b.hp / b.maxHp;
        this.ctx.fillStyle = hpPct > 0.5 ? '#10B981' : hpPct > 0.2 ? '#F59E0B' : '#EF4444';
        this.ctx.fillRect(pxX + 10, pxY + pxH - 18, (pxW - 20) * hpPct, 4);
      }
    });

    // 4. Kreslení Jednotek
    this.units.forEach(unit => {
      this.ctx.save();
      this.ctx.translate(unit.x, unit.y);
      this.ctx.rotate(unit.angle);
      
      // Výběrový neonový kroužek
      if (unit.selected) {
        this.ctx.strokeStyle = '#6C47FF';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([4, 2]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, unit.size * 1.6, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // Kreslení samotného piktogramu vozidla
      let emoji = '🚗';
      let color = '#3B82F6';
      
      if (unit.faction === 'enemy') {
        emoji = '🚒'; // Sabotér
        color = '#EF4444';
      } else {
        if (unit.type === 'chassis') { emoji = '🚜'; color = '#8B91B0'; }
        else if (unit.type === 'crane') { emoji = '🏗️'; color = '#6C47FF'; }
        else if (unit.type === 'loader') { emoji = '🚜'; color = '#F59E0B'; }
        else if (unit.type === 'fire') { emoji = '🚒'; color = '#3B82F6'; }
      }

      // Vykreslení těla
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, unit.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Vykreslení piktogramu emoji
      this.ctx.rotate(-unit.angle); // emoji držíme vodorovně
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `${unit.size * 1.3}px Inter`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(emoji, 0, 0);

      this.ctx.restore();

      // HP Bar nad jednotkou
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.fillRect(unit.x - 12, unit.y - unit.size - 8, 24, 3);
      const hpPct = unit.hp / unit.maxHp;
      this.ctx.fillStyle = unit.faction === 'enemy' ? '#EF4444' : '#10B981';
      this.ctx.fillRect(unit.x - 12, unit.y - unit.size - 8, 24 * hpPct, 3);

      // Indikátor nesené oceli
      if (unit.carryingSteel > 0) {
        this.ctx.fillStyle = '#10B981';
        this.ctx.font = 'bold 9px Inter';
        this.ctx.fillText(`+${unit.carryingSteel}🔩`, unit.x, unit.y - unit.size - 14);
      }
    });

    // 5. Kreslení Střel (Projectiles)
    this.projectiles.forEach(proj => {
      this.ctx.fillStyle = proj.color;
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 6. Kreslení Částic (Particles)
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 7. Fog of War Mask (Jednoduchý overlay s otvory)
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(10, 15, 26, 0.82)'; // Temná noc
    
    // Vytvoříme offscreen maskování na canvasu
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = 'rgba(10, 15, 26, 0.82)';
      tCtx.fillRect(0, 0, w, h);
      
      // Vyřízneme kruhy viditelnosti
      tCtx.globalCompositeOperation = 'destination-out';
      
      // Viditelnost budov
      this.buildings.forEach(b => {
        const bX = b.x * this.tileSize + (b.width * this.tileSize) / 2;
        const bY = b.y * this.tileSize + (b.height * this.tileSize) / 2;
        tCtx.beginPath();
        tCtx.arc(bX, bY, 180, 0, Math.PI * 2);
        tCtx.fill();
      });

      // Viditelnost jednotek
      this.units.forEach(u => {
        if (u.faction === 'player') {
          tCtx.beginPath();
          tCtx.arc(u.x, u.y, 110, 0, Math.PI * 2);
          tCtx.fill();
        }
      });
      
      this.ctx.drawImage(tempCanvas, 0, 0);
    }
    this.ctx.restore();

    // 8. Kreslení výběrového neonového obdélníku (Drag selection box)
    if (this.isSelecting && this.selectionStart && this.selectionEnd) {
      this.ctx.strokeStyle = '#6C47FF';
      this.ctx.fillStyle = 'rgba(108, 71, 255, 0.1)';
      this.ctx.lineWidth = 1.5;
      
      const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
      const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
      const width = Math.abs(this.selectionStart.x - this.selectionEnd.x);
      const height = Math.abs(this.selectionStart.y - this.selectionEnd.y);
      
      this.ctx.fillRect(x, y, width, height);
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  // Event Handlery pro ovládání myší
  public handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Kliknutí levým tlačítkem
    if (e.button === 0) {
      // Pokud máme zvolenou budovu ke stavění, umístíme ji na mřížku
      if (this.selectedBuildingToBuild) {
        this.placeBuilding(x, y);
        return;
      }
      
      // Start drag selection
      this.selectionStart = { x, y };
      this.selectionEnd = { x, y };
      this.isSelecting = true;
    }
  }

  public handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.isSelecting || !this.selectionStart) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.selectionEnd = { x, y };
  }

  public handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0 || !this.isSelecting || !this.selectionStart || !this.selectionEnd) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.selectionEnd = { x, y };
    this.isSelecting = false;
    
    const dx = Math.abs(this.selectionStart.x - this.selectionEnd.x);
    const dy = Math.abs(this.selectionStart.y - this.selectionEnd.y);
    
    if (dx < 10 && dy < 10) {
      // Jednoduché kliknutí na jednotku pro výběr
      let clickedUnit = false;
      this.units.forEach(u => {
        u.selected = false;
        if (u.faction === 'player' && Math.hypot(u.x - x, u.y - y) < u.size * 2) {
          u.selected = true;
          clickedUnit = true;
        }
      });
      
      if (!clickedUnit) {
        // Kliknutí do prázdna zruší výběr
        this.units.forEach(u => { u.selected = false; });
      }
    } else {
      // Výběr tažením (drag selection) – vybírá pouze vlastní jednotky
      const minX = Math.min(this.selectionStart.x, this.selectionEnd.x);
      const maxX = Math.max(this.selectionStart.x, this.selectionEnd.x);
      const minY = Math.min(this.selectionStart.y, this.selectionEnd.y);
      const maxY = Math.max(this.selectionStart.y, this.selectionEnd.y);
      
      this.units.forEach(u => {
        if (u.faction === 'player') {
          u.selected = u.x >= minX && u.x <= maxX && u.y >= minY && u.y <= maxY;
        }
      });
    }

    this.onStateChange(this);
  }

  // Pravé kliknutí: přesun vybraných jednotek nebo akce (těžba, útok)
  public handleContextMenu(e: React.MouseEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Zjistit, jestli jsme klikli na ocelové šrotiště (steel node)
    const clickedMine = this.steelNodes.find(n => Math.hypot(n.x * this.tileSize + this.tileSize/2 - x, n.y * this.tileSize + this.tileSize/2 - y) < this.tileSize * 0.8);
    
    this.units.forEach(u => {
      if (u.selected && u.faction === 'player') {
        if (clickedMine && u.type === 'chassis') {
          // Začít těžit ocel!
          u.isMining = true;
          u.targetMineId = clickedMine.id;
          u.targetX = clickedMine.x * this.tileSize + this.tileSize / 2;
          u.targetY = clickedMine.y * this.tileSize + this.tileSize / 2;
          this.createExplosion(u.x, u.y, '#10B981', 5);
        } else {
          // Obyčejný přesun
          u.isMining = false;
          u.targetMineId = null;
          u.targetX = x + (Math.random() - 0.5) * 30; // mírný rozptyl
          u.targetY = y + (Math.random() - 0.5) * 30;
          this.createExplosion(x, y, '#6C47FF', 3);
        }
      }
    });

    this.onStateChange(this);
  }

  // Stavění budov
  private placeBuilding(pxX: number, pxY: number) {
    if (!this.selectedBuildingToBuild) return;
    
    // Převod na grid souřadnice
    const gX = Math.floor(pxX / this.tileSize);
    const gY = Math.floor(pxY / this.tileSize);
    
    let size = 2; // výchozí Depot, Mine
    let cost = 100;
    
    if (this.selectedBuildingToBuild === 'hq') {
      size = 3;
      cost = 400;
    } else if (this.selectedBuildingToBuild === 'assembly') {
      size = 3;
      cost = 200;
    } else if (this.selectedBuildingToBuild === 'mine') {
      size = 2;
      cost = 150;
    } else if (this.selectedBuildingToBuild === 'depot') {
      size = 2;
      cost = 100;
    }

    if (this.steel < cost) {
      alert('Nedostatek oceli!');
      this.selectedBuildingToBuild = null;
      this.onStateChange(this);
      return;
    }

    // Ochrana hranic mapy
    if (gX + size > this.gridCols || gY + size > this.gridRows) {
      alert('Budova se nevejde na mapu!');
      return;
    }

    // Ověřit, zda je místo volné (nekryje se s jinou budovou)
    let overlap = false;
    this.buildings.forEach(b => {
      if (
        gX < b.x + b.width &&
        gX + size > b.x &&
        gY < b.y + b.height &&
        gY + size > b.y
      ) {
        overlap = true;
      }
    });

    if (overlap) {
      alert('Místo je již obsazené!');
      return;
    }

    // Postavit budovu (jako staveniště, vyžaduje přítomnost jeřábu)
    this.steel -= cost;
    this.buildings.push({
      id: `${this.selectedBuildingToBuild}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.selectedBuildingToBuild,
      x: gX,
      y: gY,
      width: size,
      height: size,
      hp: size * 200,
      maxHp: size * 200,
      isConstructing: true,
      constructionProgress: 0,
    });

    this.selectedBuildingToBuild = null;
    this.onStateChange(this);
  }

  // Výroba strojů v Montážní hale
  public buildUnit(type: UnitType) {
    let cost = 50;
    if (type === 'chassis') cost = 50;
    else if (type === 'crane') cost = 75;
    else if (type === 'loader') cost = 100;
    else if (type === 'fire') cost = 150;

    if (this.steel < cost) {
      alert('Nedostatek oceli na montáž vozu!');
      return;
    }

    if (this.currentPopulation >= this.maxPopulation) {
      alert('Dosažen maximální populační limit! Postavte Sklad součástek.');
      return;
    }

    // Najít příslušnou budovu pro zrození
    let spawnBuilding = this.buildings.find(b => !b.isConstructing && (type === 'chassis' || type === 'crane' ? b.type === 'hq' : b.type === 'assembly'));
    if (!spawnBuilding) {
      alert(`Musíte mít postavenou a dokončenou ${type === 'chassis' || type === 'crane' ? 'Hlavní dílnu' : 'Montážní halu'}!`);
      return;
    }

    this.steel -= cost;
    const px = spawnBuilding.x * this.tileSize + (spawnBuilding.width * this.tileSize) / 2;
    const py = spawnBuilding.y * this.tileSize + (spawnBuilding.height * this.tileSize) + 15;
    
    this.spawnUnit(type, 'player', px, py);
    this.createExplosion(px, py, '#6C47FF', 10);
  }
}
