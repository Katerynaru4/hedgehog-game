export class HedgehogState {
  constructor(hedgehog) {
    this.hedgehog = hedgehog;
  }

  getName() {
    return 'Unknown';
  }

  curl() {}

  uncurl() {}

  move() {
    return true;
  }

  isVulnerable() {
    return false;
  }

  canTalk() {
    return false;
  }
}

export class NormalState extends HedgehogState {
  static ENERGY_COST = 1;

  getName() {
    return 'Normal';
  }

  curl() {
    this.hedgehog.setState(new CurledState(this.hedgehog));
  }

  move() {
    return NormalState.ENERGY_COST;
  }

  isVulnerable() {
    return true;
  }

  canTalk() {
    return true;
  }
}

export class CurledState extends HedgehogState {
  static ENERGY_COST = 2;

  getName() {
    return 'Curled';
  }

  uncurl() {
    this.hedgehog.setState(new NormalState(this.hedgehog));
  }

  move() {
    return CurledState.ENERGY_COST;
  }

  isVulnerable() {
    return false;
  }

  canTalk() {
    return false;
  }
}

export class DeadState extends HedgehogState {
  static ENERGY_COST = 0;

  getName() {
    return 'Dead';
  }

  move() {
    return DeadState.ENERGY_COST;
  }

  isVulnerable() {
    return false;
  }

  canTalk() {
    return false;
  }
}
