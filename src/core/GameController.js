import { Hedgehog } from '../entities/Hedgehog.js';
import { MapBuilder } from '../world/MapBuilder.js';
import { EventBus } from './EventBus.js';
import { DirectionUtil } from '../utils/Directions.js';

const DEFAULT_NPC_ADVICE_DIRECTION = 'north';

export class GameController {
  static PIT_SURVIVAL_CHANCE = 0.5;

  static CURLED_MOVE_INTERVAL = 2;

  static DEFAULT_MAX_TIME = 100;

  static DEFAULT_LIVES = 5;

  static DEFAULT_START_X = 0;

  static DEFAULT_START_Y = 0;

  static RESET_COUNTER = 0;

  constructor(mapData, rng, maxTime = GameController.DEFAULT_MAX_TIME) {
    this.rng = rng;
    this.eventBus = new EventBus();
    this.maxTime = maxTime;

    const builder = new MapBuilder();
    this.world = builder.fromJSON(mapData).build();

    this.hedgehog = new Hedgehog(
      GameController.DEFAULT_START_X,
      GameController.DEFAULT_START_Y
    );
    this.timeRemaining = maxTime;
    this.gameOverFlag = false;
    this.curledMoveCounter = GameController.RESET_COUNTER;
    this.lives = GameController.DEFAULT_LIVES;
  }

  moveHedgehog(direction) {
    if (this.isGameOver()) {
      return;
    }

    const delta = DirectionUtil.getDelta(direction);

    const newX = this.hedgehog.positionX + delta.x;
    const newY = this.hedgehog.positionY + delta.y;

    if (!this.world.isValidPosition(newX, newY)) {
      this.eventBus.emit('invalidMove', { direction });
      return;
    }

    const isCurled = !this.hedgehog.isVulnerable();

    if (isCurled) {
      this.curledMoveCounter += 1;
      if (this.curledMoveCounter % GameController.CURLED_MOVE_INTERVAL !== 0) {
        return;
      }
      this.curledMoveCounter = GameController.RESET_COUNTER;
    } else {
      this.curledMoveCounter = GameController.RESET_COUNTER;
    }

    if (this.isGameOver()) {
      return;
    }

    this.hedgehog.move(delta.x, delta.y);
    this.decreaseTime();

    if (this.isGameOver()) {
      return;
    }

    if (this.checkDangerOnPosition()) {
      return;
    }

    this.checkPosition();
  }

  checkDangerOnPosition() {
    const position = this.getHedgehogPosition();
    const isVulnerable = this.hedgehog.isVulnerable();

    if (this.checkPredatorDanger(position, isVulnerable)) {
      return true;
    }

    return this.checkBushTrap(position, isVulnerable);
  }

  checkPredatorDanger(position, isVulnerable) {
    const predator = this.world.getPredatorAt(position.x, position.y);
    if (predator && isVulnerable && !predator.isFull) {
      this.hedgehog.die();
      this.eventBus.emit(
        'predatorDeath',
        this.createPositionEventData({ predator: predator.name })
      );
      return true;
    }
    return false;
  }

  checkBushTrap(position, isVulnerable) {
    if (this.world.hasBush(position.x, position.y)) {
      const bush = this.world.getBush(position.x, position.y);

      if (bush && bush.hasFox) {
        if (isVulnerable) {
          this.hedgehog.die();
          this.eventBus.emit('bushTrapDeath', this.createPositionEventData());
          return true;
        }
        this.eventBus.emit('bushSurvived', this.createPositionEventData());
      }
    }
    return false;
  }

  getHedgehogPosition() {
    return {
      x: this.hedgehog.positionX,
      y: this.hedgehog.positionY,
    };
  }

  createPositionEventData(additionalData = {}) {
    const position = this.getHedgehogPosition();
    return {
      ...additionalData,
      positionX: position.x,
      positionY: position.y,
    };
  }

  checkPosition() {
    const position = this.getHedgehogPosition();

    this.collectFood();

    if (this.world.hasPit(position.x, position.y)) {
      this.handlePit();
    }
  }

  handlePit() {
    const survived = this.rng.chance(GameController.PIT_SURVIVAL_CHANCE);

    if (survived) {
      this.eventBus.emit('pitSurvived', this.createPositionEventData());
    } else {
      this.hedgehog.die();
      this.eventBus.emit('pitDeath', this.createPositionEventData());
    }
  }

  handlePredator(predator) {
    const attacked = predator.attack(this.hedgehog);

    if (attacked) {
      this.eventBus.emit(
        'predatorDeath',
        this.createPositionEventData({ predator: predator.name })
      );
    } else {
      this.eventBus.emit(
        'predatorSurvived',
        this.createPositionEventData({ predator: predator.name })
      );
    }
  }

  collectFood() {
    if (!this.hedgehog.canTalk()) {
      return false;
    }

    const position = this.getHedgehogPosition();

    const nearbyFood = this.world.getFoodInRadius(position.x, position.y, 1);
    if (nearbyFood) {
      const foodValue = this.world.collectFood(nearbyFood.x, nearbyFood.y);
      this.hedgehog.eat(foodValue);
      this.hedgehog.addScore(foodValue);
      this.eventBus.emit('foodCollected', {
        value: foodValue,
        positionX: nearbyFood.x,
        positionY: nearbyFood.y,
      });
      return true;
    }

    return false;
  }

  talkToNPC() {
    if (!this.hedgehog.canTalk()) {
      return null;
    }

    const position = this.getHedgehogPosition();

    const npc = this.world.getNPCInRadius(position.x, position.y, 1);

    if (!npc) {
      return null;
    }

    const dialog = npc.getDialog(this.rng);
    const advice = npc.giveAdvice(DEFAULT_NPC_ADVICE_DIRECTION, this.rng);

    const warningMessage = npc.getPredatorWarningMessage(this.world);

    const talkResult = {
      npc: npc.name,
      dialog: warningMessage ? warningMessage.message : dialog,
      advice,
      warning: warningMessage,
    };

    this.eventBus.emit('npcTalk', talkResult);

    return talkResult;
  }

  curlHedgehog() {
    this.hedgehog.curl();
    this.eventBus.emit('hedgehogCurl', {});
  }

  uncurlHedgehog() {
    this.hedgehog.uncurl();
    this.eventBus.emit('hedgehogUncurl', {});
  }

  decreaseTime() {
    this.timeRemaining -= 1;

    if (this.timeRemaining <= 0) {
      this.gameOverFlag = true;
      this.eventBus.emit('timeOut', {});
    }
  }

  isGameOver() {
    return this.gameOverFlag || !this.hedgehog.isAlive();
  }

  getGameState() {
    return {
      hedgehog: {
        position: this.hedgehog.getPosition(),
        energy: this.hedgehog.energy,
        score: this.hedgehog.score,
        state: this.hedgehog.getStateName(),
      },
      timeRemaining: this.timeRemaining,
      isGameOver: this.isGameOver(),
      lives: this.lives,
    };
  }

  restart(mapData) {
    const builder = new MapBuilder();
    this.world = builder.fromJSON(mapData).build();
    this.hedgehog = new Hedgehog(
      GameController.DEFAULT_START_X,
      GameController.DEFAULT_START_Y
    );
    this.timeRemaining = this.maxTime;
    this.gameOverFlag = false;
    this.curledMoveCounter = GameController.RESET_COUNTER;
  }
}
