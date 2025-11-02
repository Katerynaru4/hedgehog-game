import { GameController } from './src/core/GameController.js';
import { UIRenderer } from './src/ui/UIRenderer.js';
import { RNG } from './src/utils/RNG.js';
import mapData from './src/data/map.json';

class GameUI {
  constructor(mapWidth, mapHeight) {
    this.hedgehogEl = document.getElementById('hedgehog');
    this.animationLayer = document.getElementById('animation-layer');
    this.energyFill = document.getElementById('energy-fill');
    this.chatContainer = document.getElementById('chat-container');
    this.objectsLayer = document.getElementById('objects-layer');
    this.worldTrack = document.getElementById('world-track');
    this.worldDecorations = document.getElementById('world-decorations');
    this.livesEl = document.getElementById('lives');
    this.currentObjects = new Map();

    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.cellSize = 120;
    this.worldWidth = 100000;

    this.worldTrack.style.width = `${this.worldWidth}px`;

    this.initializeDecorations();
    this.initializeHedgehog();
  }

  initializeDecorations() {
    this.worldDecorations.innerHTML = '';
    const trees = ['🌲', '🌳'];
    const smallPlants = ['🌿', '🍄', '🌸', '🪨'];

    for (let i = 0; i < this.worldWidth / 80; i += 1) {
      const isTree = Math.random() > 0.4;
      const emoji = isTree
        ? trees[Math.floor(Math.random() * trees.length)]
        : smallPlants[Math.floor(Math.random() * smallPlants.length)];

      const decor = document.createElement('div');
      decor.textContent = emoji;

      const size = isTree ? 45 + Math.random() * 25 : 25 + Math.random() * 15;
      const leftPos = i * 80 + Math.random() * 60;
      const bottomPos = isTree
        ? 70 + Math.random() * 30
        : 82 + Math.random() * 8;

      decor.style.cssText = `
        position: absolute;
        font-size: ${size}px;
        left: ${leftPos}px;
        bottom: ${bottomPos}px;
        opacity: ${isTree ? 0.7 : 0.5};
        z-index: ${isTree ? 1 : 0};
      `;

      this.worldDecorations.appendChild(decor);
    }
  }

  initializeObjects(controller) {
    this.objectsLayer.innerHTML = '';
    this.currentObjects.clear();

    controller.world.food.forEach((value, key) => {
      const [x, y] = key.split(',').map(Number);
      const foodData = mapData.food.find((f) => f.x === x && f.y === y);
      this.addObject(x, y, key, foodData?.emoji || '🍎', 'food');
    });

    controller.world.npcs.forEach((npc) => {
      const key = `${npc.positionX},${npc.positionY}`;
      const npcData = mapData.npcs.find(
        (n) => n.x === npc.positionX && n.y === npc.positionY
      );
      this.addObject(
        npc.positionX,
        npc.positionY,
        key,
        npcData?.emoji || '🐰',
        'npc'
      );
    });

    controller.world.predators.forEach((pred) => {
      const key = `${pred.positionX},${pred.positionY}`;
      const predData = mapData.predators.find(
        (p) => p.x === pred.positionX && p.y === pred.positionY
      );
      this.addObject(
        pred.positionX,
        pred.positionY,
        key,
        predData?.emoji || '🐺',
        'predator'
      );
      const objectEl = this.currentObjects.get(key);
      if (objectEl && objectEl.classList.contains('predator')) {
        objectEl.dataset.predatorName = pred.name;
      }
    });

    controller.world.bushes.forEach((bushData, key) => {
      const [x, y] = key.split(',').map(Number);
      this.addObject(x, y, key, '🌿', 'bush');
    });
  }

  addObject(gridX, gridY, key, emoji, type) {
    const objectEl = document.createElement('div');
    objectEl.className = `game-object ${type}`;
    objectEl.textContent = emoji;
    objectEl.dataset.key = key;
    objectEl.dataset.gridX = gridX;
    objectEl.dataset.gridY = gridY;
    objectEl.title = `${emoji} ${type} (${gridX},${gridY})`;

    const posX = gridX * this.cellSize;
    const baseBottom = 24;
    const bottomPos = baseBottom + gridY * 30;

    let fontSize = 40;

    if (type === 'food') {
      fontSize = 35;
    } else if (type === 'npc') {
      fontSize = 50;
    } else if (type === 'predator') {
      fontSize = 55;
    } else if (type === 'bush') {
      fontSize = 45;
    }

    objectEl.style.cssText = `
      position: absolute;
      left: ${posX}px;
      bottom: ${bottomPos}px;
      font-size: ${fontSize}px;
      z-index: 15;
      pointer-events: auto;
      cursor: pointer;
      filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.8));
    `;

    this.objectsLayer.appendChild(objectEl);
    this.currentObjects.set(key, objectEl);
  }

  updateWorldPosition(hedgehogX) {
    const offsetX = -hedgehogX * this.cellSize;
    this.worldTrack.style.transform = `translateX(${offsetX}px)`;
  }

  updatePredatorPositions(world) {
    const activePredatorNames = new Set(world.predators.map((p) => p.name));

    world.predators.forEach((predator) => {
      const newKey = `${predator.positionX},${predator.positionY}`;
      const allEntries = Array.from(this.currentObjects.entries());
      const existingEntry = allEntries.find(
        ([, el]) =>
          el.classList.contains('predator') &&
          el.dataset.predatorName === predator.name
      );

      if (existingEntry) {
        const [oldKey, objectEl] = existingEntry;

        if (oldKey !== newKey) {
          this.currentObjects.delete(oldKey);
          this.currentObjects.set(newKey, objectEl);
        }

        const posX = predator.positionX * this.cellSize;
        const baseBottom = 24;
        const bottomPos = baseBottom + predator.positionY * 30;
        objectEl.style.left = `${posX}px`;
        objectEl.style.bottom = `${bottomPos}px`;
      } else {
        const predData = mapData.predators.find(
          (p) => p.name === predator.name
        );
        this.addObject(
          predator.positionX,
          predator.positionY,
          newKey,
          predData?.emoji || '🐺',
          'predator'
        );
        const objectEl = this.currentObjects.get(newKey);
        if (objectEl) {
          objectEl.dataset.predatorName = predator.name;
        }
      }
    });

    const entriesToRemove = Array.from(this.currentObjects.entries()).filter(
      ([, el]) =>
        el.classList.contains('predator') &&
        !activePredatorNames.has(el.dataset.predatorName)
    );
    entriesToRemove.forEach(([key, el]) => {
      this.currentObjects.delete(key);
      el.remove();
    });
  }

  syncFoodObjects(world) {
    const activeFoodKeys = new Set(world.food.keys());
    const foodObjectsToRemove = Array.from(
      this.currentObjects.entries()
    ).filter(
      ([k, el]) => el.classList.contains('food') && !activeFoodKeys.has(k)
    );

    foodObjectsToRemove.forEach(([k, el]) => {
      this.currentObjects.delete(k);
      el.remove();
    });
  }

  removeObject(posX, posY, withAnimation = true) {
    const key = `${posX},${posY}`;
    const objectEl = this.currentObjects.get(key);

    if (objectEl) {
      if (withAnimation) {
        objectEl.classList.add('collected');
        setTimeout(() => {
          objectEl.remove();
          this.currentObjects.delete(key);
        }, 600);
      } else {
        objectEl.remove();
        this.currentObjects.delete(key);
      }
    }
  }

  showChat(speaker, message, npcName = null) {
    this.clearChat();

    const msg = document.createElement('div');
    msg.className = `chat-message ${speaker}`;
    msg.textContent = message;
    if (npcName) {
      msg.dataset.name = npcName;
    }
    this.chatContainer.appendChild(msg);

    setTimeout(() => this.clearChat(), 8000);
  }

  clearChat() {
    this.chatContainer.innerHTML = '';
  }

  animateWalk() {
    if (this.hedgehogEl.classList.contains('curled')) {
      return;
    }
    this.hedgehogEl.classList.remove('walk', 'jump', 'fall');
    this.hedgehogEl.classList.add('walk');
    setTimeout(() => this.hedgehogEl.classList.remove('walk'), 500);
  }

  animateBounce() {
    this.hedgehogEl.classList.remove('walk', 'jump', 'fall', 'bounce');
    this.hedgehogEl.classList.add('bounce');
    setTimeout(() => this.hedgehogEl.classList.remove('bounce'), 300);
  }

  setHedgehogDirection(direction) {
    this.lastDirection = direction;
  }

  initializeHedgehog() {
    this.hedgehogEl.classList.add('facing-right');
    this.hedgehogEl.style.transform = 'translateX(-50%) scaleX(-1)';
    this.lastDirection = 'right';
  }

  animateJump() {
    this.hedgehogEl.classList.remove('walk', 'jump', 'fall');
    this.hedgehogEl.classList.add('jump');
    this.createParticles('⭐', 5);
    setTimeout(() => this.hedgehogEl.classList.remove('jump'), 600);
  }

  animateFall() {
    this.hedgehogEl.classList.remove('walk', 'jump', 'fall');
    this.hedgehogEl.classList.add('fall');
    this.createParticles('💀', 3);
  }

  updateCurledState(isCurled) {
    if (isCurled) {
      this.hedgehogEl.classList.add('curled');
    } else {
      this.hedgehogEl.classList.remove('curled');
      this.hedgehogEl.classList.remove('facing-left');
      this.hedgehogEl.classList.add('facing-right');
      this.hedgehogEl.style.transform = 'translateX(-50%) scaleX(-1)';
    }
  }

  createParticles(emoji, count) {
    const hedgehogRect = this.hedgehogEl.getBoundingClientRect();
    const layerRect = this.animationLayer.getBoundingClientRect();

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = emoji;

      const angle = (Math.PI * 2 * i) / count;
      const distance = 50 + Math.random() * 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.left = `${
        hedgehogRect.left - layerRect.left + hedgehogRect.width / 2
      }px`;
      particle.style.top = `${
        hedgehogRect.top - layerRect.top + hedgehogRect.height / 2
      }px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);

      this.animationLayer.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  updateEnergyBar(energy) {
    this.energyFill.style.width = `${energy}%`;

    this.energyFill.classList.remove('high', 'medium', 'low');
    if (energy > 70) {
      this.energyFill.classList.add('high');
    } else if (energy > 30) {
      this.energyFill.classList.add('medium');
    } else {
      this.energyFill.classList.add('low');
    }
  }

  updateLives(lives) {
    if (this.livesEl) {
      this.livesEl.textContent = lives;
    }
  }

  showGameOver(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    `;

    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: scaleIn 0.5s ease;
    `;

    messageBox.innerHTML = `
      <h2 style="font-size: 2em; margin-bottom: 20px; color: #333;">${message}</h2>
      <p style="font-size: 1.2em; color: #666; margin-bottom: 30px;">
        Натисніть 'Нова гра' щоб спробувати ще раз
      </p>
    `;

    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 5000);
  }
}

class Game {
  constructor() {
    this.rng = new RNG();
    this.controller = new GameController(mapData, this.rng, 200);
    this.renderer = new UIRenderer();
    this.ui = new GameUI(mapData.width, mapData.height);
    this.predatorMoveInterval = null;

    this.setupEventListeners();
    this.setupGameEvents();
    this.ui.initializeObjects(this.controller);
    this.ui.updateWorldPosition(
      this.controller.hedgehog.positionX,
      this.controller.hedgehog.positionY
    );
    this.updateUI();

    this.startPredatorMovement();
    this.renderer.addLog('🎮 Гра розпочалася! Дослідіть ліс.', 'success');
    this.renderer.addLog(`🦔 У вас є ${this.controller.lives} життів.`, 'info');
  }

  startPredatorMovement() {
    this.predatorMoveInterval = setInterval(() => {
      if (this.controller.isGameOver()) {
        return;
      }

      this.controller.world.predators.forEach((predator) => {
        predator.move(this.controller.world);
      });

      this.updateUI();
    }, 500);
  }

  stopPredatorMovement() {
    if (this.predatorMoveInterval) {
      clearInterval(this.predatorMoveInterval);
      this.predatorMoveInterval = null;
    }
  }

  setupEventListeners() {
    const buttons = {
      up: document.getElementById('btn-up'),
      down: document.getElementById('btn-down'),
      left: document.getElementById('btn-left'),
      right: document.getElementById('btn-right'),
      talk: document.getElementById('btn-talk'),
      curl: document.getElementById('btn-curl'),
      uncurl: document.getElementById('btn-uncurl'),
      restart: document.getElementById('btn-restart'),
    };

    buttons.up?.addEventListener('click', () => this.handleMove('up'));
    buttons.down?.addEventListener('click', () => this.handleMove('down'));
    buttons.left?.addEventListener('click', () => this.handleMove('left'));
    buttons.right?.addEventListener('click', () => this.handleMove('right'));
    buttons.talk?.addEventListener('click', () => this.handleTalk());
    buttons.curl?.addEventListener('click', () => this.handleCurl());
    buttons.uncurl?.addEventListener('click', () => this.handleUncurl());
    buttons.restart?.addEventListener('click', () => this.handleRestart());

    document.addEventListener('keydown', (event) => {
      if (this.controller.isGameOver()) {
        return;
      }

      if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.handleCollectFood();
        return;
      }

      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        a: 'left',
        d: 'right',
      };

      const direction = keyMap[event.key];
      if (direction) {
        event.preventDefault();
        this.handleMove(direction);
      }

      if (event.key === 't' || event.key === 'T') {
        this.handleTalk();
      }
    });

    let lastDownClick = 0;
    let lastUpClick = 0;

    document.addEventListener('keydown', (event) => {
      if (this.controller.isGameOver()) {
        return;
      }

      const now = Date.now();

      if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
        if (now - lastDownClick < 300) {
          this.handleCurl();
          event.preventDefault();
          lastDownClick = 0;
        } else {
          lastDownClick = now;
        }
      }

      if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        if (now - lastUpClick < 300) {
          this.handleUncurl();
          event.preventDefault();
          lastUpClick = 0;
        } else {
          lastUpClick = now;
        }
      }
    });
  }

  setupGameEvents() {
    this.controller.eventBus.on('invalidMove', () => {
      this.renderer.addLog('⛔ Не можна вийти за межі лісу!', 'error');
    });

    this.controller.eventBus.on('foodCollected', (data) => {
      this.ui.animateJump();
      this.ui.removeObject(data.positionX, data.positionY, true);
      this.renderer.addLog(
        `🍎 Знайдено їжу! +${data.value} енергії, +${data.value} очок`,
        'success'
      );
    });

    this.controller.eventBus.on('pitSurvived', () => {
      this.ui.animateWalk();
      this.renderer.addLog(
        '😰 Ви впали в пастку, але змогли вибратися!',
        'info'
      );
    });

    this.controller.eventBus.on('pitDeath', () => {
      this.ui.animateFall();
      this.renderer.addLog('💀 Ви впали в пастку і загинули...', 'error');
      setTimeout(() => this.handleGameOver(true), 1000);
    });

    this.controller.eventBus.on('predatorDeath', (data) => {
      this.ui.animateFall();
      this.renderer.addLog(
        `🐺 ${data.predator} напав на вас! Ви загинули...`,
        'error'
      );
      setTimeout(() => this.handleGameOver(true), 1000);
    });

    this.controller.eventBus.on('predatorSurvived', (data) => {
      this.ui.animateWalk();
      this.renderer.addLog(
        `🛡️ ${data.predator} не зміг вас атакувати, бо ви у клубку!`,
        'success'
      );
    });

    this.controller.eventBus.on('npcTalk', (data) => {
      this.ui.showChat(data.npc, data.dialog, 'Дякую за пораду!');
      if (data.warning) {
        if (data.warning.isWarning) {
          this.renderer.addLog(`⚠️ ${data.npc}: '${data.dialog}'`, 'error');
        } else {
          this.renderer.addLog(`💬 ${data.npc}: '${data.dialog}'`, 'success');
        }
      } else {
        this.renderer.addLog(`💬 ${data.npc}: '${data.dialog}'`, 'info');
      }
    });

    this.controller.eventBus.on('hedgehogCurl', () => {
      this.ui.updateCurledState(true);
      this.renderer.addLog('🔵 Ви згорнулися в клубок.', 'info');
    });

    this.controller.eventBus.on('hedgehogUncurl', () => {
      this.ui.updateCurledState(false);
      this.renderer.addLog('🔴 Ви розгорнулися.', 'info');
    });

    this.controller.eventBus.on('bushSurvived', () => {
      this.ui.animateWalk();
      this.renderer.addLog(
        '🛡️ Ви скрутились і безпечно пройшли через кущ з пасткою лисиці!',
        'success'
      );
    });

    this.controller.eventBus.on('bushTrapDeath', () => {
      this.ui.animateFall();
      this.renderer.addLog(
        '🦊 Ви потрапили в пастку лисиці в кущі! Ви загинули...',
        'error'
      );
      setTimeout(() => this.handleGameOver(true), 1000);
    });

    this.controller.eventBus.on('timeOut', () => {
      this.renderer.addLog('⏱️ Час вийшов! Гру завершено.', 'error');
      setTimeout(() => this.handleGameOver(false), 500);
    });

    this.controller.eventBus.on('gameRestart', () => {
      this.renderer.clearLog();
      this.ui.hedgehogEl.classList.remove('walk', 'jump', 'fall', 'curled');
      this.ui.updateCurledState(false);
      this.ui.clearChat();
      this.ui.initializeDecorations();
      this.ui.initializeObjects(this.controller);
      this.ui.initializeHedgehog();
      this.renderer.addLog('🔄 Нова гра розпочалася!', 'success');
    });
  }

  handleMove(direction) {
    if (this.controller.isGameOver()) {
      return;
    }

    const isCurled = !this.controller.hedgehog.isVulnerable();
    if (!isCurled) {
      this.ui.animateBounce();
    }

    this.controller.moveHedgehog(direction);

    if (this.controller.isGameOver()) {
      return;
    }

    this.ui.updateWorldPosition(
      this.controller.hedgehog.positionX,
      this.controller.hedgehog.positionY
    );
    this.updateUI();
    this.checkWinCondition();
    this.checkCurrentPosition();
  }

  checkCurrentPosition() {
    const { positionX, positionY } = this.controller.hedgehog;

    const npc = this.controller.world.getNPCInRadius(positionX, positionY, 1);
    if (npc) {
      this.renderer.addLog(
        `👋 Ви біля ${npc.name}. Натисніть T щоб поговорити.`,
        'info'
      );
    }

    const nearbyFood = this.controller.world.getFoodInRadius(
      positionX,
      positionY,
      1
    );
    if (nearbyFood) {
      this.renderer.addLog('🍎 Поруч є їжа! Натисніть S щоб зібрати.', 'info');
    }

    const predator = this.controller.world.getPredatorAt(positionX, positionY);
    if (predator) {
      if (this.controller.hedgehog.isVulnerable()) {
        this.renderer.addLog(
          `⚠️ Обережно! Поруч ${predator.name}! Згорніться (C) щоб захиститися!`,
          'error'
        );
      } else {
        this.renderer.addLog(
          `🛡️ Поруч ${predator.name}, але ви у клубку - безпечно!`,
          'success'
        );
      }
    }

    const bush = this.controller.world.getBush(positionX, positionY);
    if (bush) {
      const hasFox = this.controller.world.checkBushTrap(positionX, positionY);
      if (hasFox) {
        this.renderer.addLog(
          '🌿 Кущ перед яким стоїть лисиця! Скрутіться (C) щоб безпечно пройти через нього!',
          'error'
        );
      } else {
        this.renderer.addLog('🌿 Ви пройшли через кущ безпечно.', 'info');
      }
    }
  }

  checkWinCondition() {
    if (
      this.controller.hedgehog.score >= 1000 &&
      !this.controller.isGameOver()
    ) {
      this.controller.gameOverFlag = true;
      this.renderer.addLog('🎉 Ви зібрали 1000 очок їжі! Перемога!', 'success');
      setTimeout(() => {
        this.ui.showGameOver(
          `🎉 Перемога! Зібрано 1000 очок їжі! Рахунок: ${this.controller.hedgehog.score}`
        );
        setTimeout(() => {
          this.controller.restart(mapData);
          this.ui.updateWorldPosition(
            this.controller.hedgehog.positionX,
            this.controller.hedgehog.positionY
          );
          this.updateUI();
        }, 3000);
      }, 500);
    }
  }

  handleCollectFood() {
    if (this.controller.isGameOver()) {
      return;
    }

    const success = this.controller.collectFood();

    if (!success) {
      this.renderer.addLog('🤷 Тут немає їжі для збору.', 'info');
    } else {
      this.renderer.addLog('🍎 Їжа зібрана!', 'success');
    }

    this.updateUI();
  }

  handleTalk() {
    if (this.controller.isGameOver()) {
      return;
    }

    const result = this.controller.talkToNPC();

    if (!result) {
      if (!this.controller.hedgehog.canTalk()) {
        this.renderer.addLog(
          '❌ Не можна говорити у згорнутому стані!',
          'error'
        );
      } else {
        this.renderer.addLog('🤷 Тут немає нікого для розмови.', 'info');
      }
    } else {
      this.ui.showChat('npc', result.dialog, result.npc);
      setTimeout(() => {
        this.ui.showChat('hedgehog', 'Дякую за пораду!');
      }, 1000);
      if (result.warning) {
        if (result.warning.isWarning) {
          this.renderer.addLog(`⚠️ ${result.npc}: ${result.dialog}`, 'error');
          if (result.warning.shouldCurl) {
            this.renderer.addLog(
              `⚠️ Обов'язково скрутись (C) перед зустріччю з ${result.warning.predator.name} щоб не померти!`,
              'error'
            );
          }
        } else {
          this.renderer.addLog(`💬 ${result.npc}: ${result.dialog}`, 'success');
          if (!result.warning.shouldCurl) {
            this.renderer.addLog(
              `✅ Можна проходити повз ${result.warning.predator.name} безпечно!`,
              'success'
            );
          }
        }
      } else {
        this.renderer.addLog(`💬 ${result.npc}: ${result.dialog}`, 'info');
      }
    }

    this.updateUI();
  }

  handleCurl() {
    if (this.controller.isGameOver()) {
      return;
    }

    this.controller.curlHedgehog();
    this.updateUI();
  }

  handleUncurl() {
    if (this.controller.isGameOver()) {
      return;
    }

    this.controller.uncurlHedgehog();
    this.updateUI();
  }

  handleRestart() {
    if (this.controller.lives > 0) {
      this.controller.lives -= 1;
      this.controller.lives = Math.max(0, this.controller.lives);

      if (this.controller.lives <= 0) {
        const state = this.controller.getGameState();
        const finalScore = state.hedgehog.score;
        this.ui.showGameOver(
          `💀 Ви програли остаточно! Рахунок: ${finalScore}`
        );
        this.renderer.addLog(
          `☠️ Ви використали всі життя! Фінальний рахунок: ${finalScore}`,
          'error'
        );
        return;
      }

      this.renderer.addLog(
        `💔 Втрачено життя! Залишилось: ${this.controller.lives}`,
        'error'
      );
    } else {
      this.controller.lives = 5;
      this.renderer.addLog('🔄 Нова гра! Життя відновлено до 5', 'success');
    }

    this.controller.restart(mapData);

    this.renderer.clearLog();
    this.ui.hedgehogEl.classList.remove(
      'walk',
      'jump',
      'fall',
      'curled',
      'moving',
      'facing-left'
    );
    this.ui.hedgehogEl.classList.add('facing-right');
    this.ui.updateCurledState(false);
    this.ui.clearChat();
    this.ui.initializeDecorations();
    this.ui.initializeObjects(this.controller);
    this.ui.initializeHedgehog();

    if (this.ui.worldTrack) {
      this.ui.worldTrack.style.transform = 'translateX(0px)';
    }

    this.ui.updateWorldPosition(
      this.controller.hedgehog.positionX,
      this.controller.hedgehog.positionY
    );

    const overlays = document.querySelectorAll(
      'body > div:not(#app):not(script)'
    );
    overlays.forEach((overlay) => overlay.remove());

    this.updateUI();
    this.renderer.addLog(
      `🔄 Нова спроба! Життя: ${this.controller.lives}`,
      'success'
    );

    this.stopPredatorMovement();
    this.startPredatorMovement();
  }

  handleGameOver(autoRestart = false) {
    this.updateUI();

    const state = this.controller.getGameState();
    const finalScore = state.hedgehog.score;

    if (this.controller.hedgehog.isAlive()) {
      this.ui.showGameOver(`⏱️ Час закінчився! Рахунок: ${finalScore}`);
      this.renderer.addLog(
        `🏁 Гру завершено! Фінальний рахунок: ${finalScore}`,
        'info'
      );
    } else if (autoRestart) {
      if (this.controller.lives > 0) {
        this.controller.lives -= 1;
        this.controller.lives = Math.max(0, this.controller.lives);
      }
      this.ui.updateLives(this.controller.lives);

      if (this.controller.lives <= 0) {
        this.ui.showGameOver(
          `💀 Ви програли остаточно! Рахунок: ${finalScore}`
        );
        this.renderer.addLog(
          `☠️ Ви використали всі життя! Фінальний рахунок: ${finalScore}`,
          'error'
        );
      } else {
        this.renderer.addLog(
          `💔 Втрачено життя! Залишилось: ${this.controller.lives}`,
          'error'
        );
        setTimeout(() => {
          this.handleRestart();
        }, 1000);
      }
    } else if (!autoRestart) {
      this.ui.showGameOver(`💀 Гру програно! Рахунок: ${finalScore}`);
      this.renderer.addLog(
        `☠️ Гру програно! Фінальний рахунок: ${finalScore}`,
        'error'
      );
    }
  }

  updateUI() {
    const state = this.controller.getGameState();
    this.renderer.render(state);
    this.ui.updateEnergyBar(state.hedgehog.energy);
    this.ui.updateLives(state.lives);
    this.ui.updatePredatorPositions(this.controller.world);
    this.ui.syncFoodObjects(this.controller.world);
  }
}

new Game();
