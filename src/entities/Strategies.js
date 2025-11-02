import { DirectionUtil } from '../utils/Directions.js';

export class AdviceStrategy {
  giveAdvice(actualDirection) {
    return actualDirection;
  }
}

export class HonestStrategy extends AdviceStrategy {
  giveAdvice(actualDirection) {
    return actualDirection;
  }
}

export class DeceptiveStrategy extends AdviceStrategy {
  static DEFAULT_HONESTY_RATE = 0.6;

  constructor() {
    super();
    this.honestyRate = DeceptiveStrategy.DEFAULT_HONESTY_RATE;
  }

  giveAdvice(actualDirection, rng) {
    if (rng.chance(this.honestyRate)) {
      return actualDirection;
    }

    const otherDirections = DirectionUtil.DIRECTIONS.filter(
      (dir) => dir !== actualDirection
    );
    return rng.pick(otherDirections);
  }
}
