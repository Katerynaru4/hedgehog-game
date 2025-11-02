export class NPC {
  static HASH_MODULO = 1000;

  static POSITION_MULTIPLIER = 1000;

  static HASH_MULTIPLIER = 32;

  static BOOLEAN_CHOICE_DIVISOR = 2;

  static SEED_OFFSET_PREDATOR_INDEX = 1;

  static SEED_OFFSET_SHOULD_WARN = 2;

  static SEED_OFFSET_SHOULD_LIE = 3;

  static SEED_OFFSET_WARN_DECEPTIVE = 10;

  static SEED_OFFSET_WARN_HONEST = 11;

  static SEED_OFFSET_SAFE_DECEPTIVE = 12;

  static SEED_OFFSET_SAFE_HONEST = 13;

  static SEED_OFFSET_NO_THREAT = 14;

  static MAX_PREDATOR_DISTANCE = 15;

  static DECEPTIVE_STRATEGY_NAME = 'DeceptiveStrategy';

  constructor(name, strategy, positionX, positionY) {
    this.name = name;
    this.strategy = strategy;
    this.positionX = positionX;
    this.positionY = positionY;
    this.dialogs = [];
  }

  giveAdvice(actualDirection, rng) {
    return this.strategy.giveAdvice(actualDirection, rng);
  }

  addDialog(text) {
    this.dialogs.push(text);
  }

  isDeceptiveStrategy() {
    return this.strategy.constructor.name === NPC.DECEPTIVE_STRATEGY_NAME;
  }

  getDialog(rng) {
    if (this.dialogs.length === 0) {
      return `${this.name} has nothing to say.`;
    }
    return rng.pick(this.dialogs);
  }

  getDeterministicValue(seed) {
    let hash = seed;
    hash = hash * NPC.HASH_MULTIPLIER - hash + seed;
    hash = Math.abs(hash);
    return hash % NPC.HASH_MODULO;
  }

  getNPCSeed() {
    return this.positionX * NPC.POSITION_MULTIPLIER + this.positionY;
  }

  getFakePredatorWarning(world, npcSeed) {
    const fakePredators = world.predators;
    if (fakePredators.length === 0) {
      return null;
    }

    const predatorIndex = this.getDeterministicValue(
      npcSeed + NPC.SEED_OFFSET_PREDATOR_INDEX
    ) % fakePredators.length;
    const fakePredator = fakePredators[predatorIndex];
    const shouldWarn = this.getDeterministicValue(
      npcSeed + NPC.SEED_OFFSET_SHOULD_WARN
    ) % NPC.BOOLEAN_CHOICE_DIVISOR === 0;

    return {
      predator: fakePredator,
      shouldWarn,
      isTruthful: false,
    };
  }

  getPredatorWarning(world) {
    const predator = world.getNearestPredator(
      this.positionX,
      this.positionY,
      NPC.MAX_PREDATOR_DISTANCE
    );

    const isDeceptive = this.isDeceptiveStrategy();
    const npcSeed = this.getNPCSeed();

    if (!predator) {
      if (isDeceptive) {
        return this.getFakePredatorWarning(world, npcSeed);
      }
      return null;
    }

    let shouldWarn = !predator.isFull;

    if (isDeceptive) {
      const shouldLie = this.getDeterministicValue(
        npcSeed + NPC.SEED_OFFSET_SHOULD_LIE
      ) % NPC.BOOLEAN_CHOICE_DIVISOR === 0;
      if (shouldLie) {
        shouldWarn = !shouldWarn;
      }
    }

    return {
      predator,
      shouldWarn,
      isTruthful: shouldWarn === !predator.isFull,
    };
  }

  getWarningMessages(predatorName) {
    return {
      warn: [
        `⚠️ Обережно! Поруч ${predatorName}! Скрутись, щоб не померти!`,
        `🦅 Стережись ${predatorName}! Він небезпечний!`,
        `⚡ ${predatorName} шукає їжу! Будь обережним!`,
      ],
      safe: [
        `😊 Все добре! ${predatorName} ситий, не бійся його!`,
        `✅ ${predatorName} не небезпечний зараз, можна проходити!`,
        `👍 Не хвилюйся, ${predatorName} вже наївся!`,
      ],
      noThreat: [
        '😊 Все добре! Немає небезпеки навколо!',
        '✅ Можна спокійно йти, тут безпечно!',
        '👍 Не хвилюйся, все гаразд!',
      ],
    };
  }

  getPredatorWarningMessage(world) {
    const warning = this.getPredatorWarning(world);
    const isDeceptive = this.isDeceptiveStrategy();

    if (!warning && !isDeceptive) {
      return null;
    }

    if (!warning && isDeceptive) {
      const npcSeed = this.getNPCSeed();
      const messages = this.getWarningMessages(null).noThreat;
      const messageIndex =
        this.getDeterministicValue(npcSeed + NPC.SEED_OFFSET_NO_THREAT) % messages.length;
      return {
        message: messages[messageIndex],
        shouldCurl: false,
        isWarning: false,
        predator: null,
      };
    }

    const npcSeed = this.getNPCSeed();
    const messages = this.getWarningMessages(warning.predator.name);

    if (warning.shouldWarn) {
      const messageSet = isDeceptive
        ? npcSeed + NPC.SEED_OFFSET_WARN_DECEPTIVE
        : npcSeed + NPC.SEED_OFFSET_WARN_HONEST;
      const messageIndex = this.getDeterministicValue(messageSet) % messages.warn.length;
      return {
        message: messages.warn[messageIndex],
        shouldCurl: isDeceptive ? warning.isTruthful : true,
        isWarning: true,
        predator: warning.predator,
      };
    }
    const messageSet = isDeceptive
      ? npcSeed + NPC.SEED_OFFSET_SAFE_DECEPTIVE
      : npcSeed + NPC.SEED_OFFSET_SAFE_HONEST;
    const messageIndex = this.getDeterministicValue(messageSet) % messages.safe.length;
    return {
      message: messages.safe[messageIndex],
      shouldCurl: isDeceptive ? !warning.isTruthful : false,
      isWarning: false,
      predator: warning.predator,
    };
  }

  getPosition() {
    return { x: this.positionX, y: this.positionY };
  }
}
