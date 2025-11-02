import { NormalState, DeadState } from './States.js';

export class Hedgehog {
  static MAX_ENERGY = 100;

  static MIN_ENERGY = 0;

  static RESET_SCORE = 0;

  constructor(startX, startY) {
    this.positionX = startX;
    this.positionY = startY;
    this.energy = Hedgehog.MAX_ENERGY;
    this.score = Hedgehog.RESET_SCORE;
    this.state = new NormalState(this);
  }

  setState(newState) {
    this.state = newState;
  }

  getStateName() {
    return this.state.getName();
  }

  curl() {
    this.state.curl();
  }

  uncurl() {
    this.state.uncurl();
  }

  move(deltaX, deltaY) {
    const energyCost = this.state.move();

    if (energyCost === Hedgehog.MIN_ENERGY) {
      return;
    }

    if (this.energy < energyCost) {
      this.energy = Hedgehog.MIN_ENERGY;
      this.die();
      return;
    }

    this.positionX += deltaX;
    this.positionY += deltaY;
    this.consumeEnergy(energyCost);
  }

  consumeEnergy(amount) {
    this.energy -= amount;
    if (this.energy < Hedgehog.MIN_ENERGY) {
      this.energy = Hedgehog.MIN_ENERGY;
    }

    if (this.energy === Hedgehog.MIN_ENERGY) {
      this.die();
    }
  }

  eat(amount) {
    this.energy += amount;
    if (this.energy > Hedgehog.MAX_ENERGY) {
      this.energy = Hedgehog.MAX_ENERGY;
    }
  }

  addScore(points) {
    this.score += points;
  }

  die() {
    this.state = new DeadState(this);
  }

  isAlive() {
    return !(this.state instanceof DeadState);
  }

  isVulnerable() {
    return this.state.isVulnerable();
  }

  canTalk() {
    return this.state.canTalk();
  }

  getPosition() {
    return { x: this.positionX, y: this.positionY };
  }
}
