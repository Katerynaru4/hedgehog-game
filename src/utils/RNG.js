export class RNG {
  static MULTIPLIER = 9301;

  static INCREMENT = 49297;

  static MODULUS = 233280;

  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * RNG.MULTIPLIER + RNG.INCREMENT) % RNG.MODULUS;
    return this.seed / RNG.MODULUS;
  }

  chance(probability) {
    return this.next() < probability;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(array) {
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }
}
