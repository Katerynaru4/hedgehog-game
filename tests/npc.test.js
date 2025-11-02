import { describe, it, expect, beforeEach } from 'vitest';
import { NPC } from '../src/entities/NPC.js';
import {
  HonestStrategy,
  DeceptiveStrategy,
} from '../src/entities/Strategies.js';
import { RNG } from '../src/utils/RNG.js';

describe('NPC - Strategy Pattern', () => {
  let rng;

  beforeEach(() => {
    rng = new RNG(12345);
  });

  it('should create NPC with name and strategy', () => {
    const npc = new NPC('Rabbit', new HonestStrategy(), 1, 1);
    expect(npc.name).toBe('Rabbit');
    expect(npc.positionX).toBe(1);
    expect(npc.positionY).toBe(1);
  });

  it('should give honest advice with HonestStrategy', () => {
    const npc = new NPC('Rabbit', new HonestStrategy(), 1, 1);
    const actualDirection = 'north';

    const advice = npc.giveAdvice(actualDirection, rng);
    expect(advice).toBe(actualDirection);
  });

  it('should give deceptive advice 40% of time with DeceptiveStrategy', () => {
    const npc = new NPC('Fox', new DeceptiveStrategy(), 2, 2);
    const actualDirection = 'north';
    const testRng = new RNG(100);

    const results = [];
    for (let index = 0; index < 1000; index += 1) {
      const advice = npc.giveAdvice(actualDirection, testRng);
      results.push(advice === actualDirection ? 1 : 0);
    }

    const honestyRate =
      results.reduce((acc, val) => acc + val, 0) / results.length;

    expect(honestyRate).toBeGreaterThan(0.5);
    expect(honestyRate).toBeLessThan(0.7);
  });

  it('should provide dialog', () => {
    const npc = new NPC('Squirrel', new HonestStrategy(), 3, 3);
    npc.addDialog('Hello, hedgehog!');
    npc.addDialog('Watch out for the fox!');

    const dialog = npc.getDialog(rng);
    expect(['Hello, hedgehog!', 'Watch out for the fox!']).toContain(dialog);
  });

  it('should have position', () => {
    const npc = new NPC('Rabbit', new HonestStrategy(), 5, 7);
    const position = npc.getPosition();
    expect(position.x).toBe(5);
    expect(position.y).toBe(7);
  });
});

describe('Strategies', () => {
  let rng;

  beforeEach(() => {
    rng = new RNG(42);
  });

  it('HonestStrategy should always return true direction', () => {
    const strategy = new HonestStrategy();
    const actualDirection = 'south';

    for (let index = 0; index < 100; index += 1) {
      const result = strategy.giveAdvice(actualDirection, rng);
      expect(result).toBe(actualDirection);
    }
  });

  it('DeceptiveStrategy should lie sometimes', () => {
    const strategy = new DeceptiveStrategy();
    const actualDirection = 'east';
    const testRng = new RNG(200);

    let lies = 0;
    for (let index = 0; index < 1000; index += 1) {
      const result = strategy.giveAdvice(actualDirection, testRng);
      if (result !== actualDirection) {
        lies += 1;
      }
    }

    const lieRate = lies / 1000;
    expect(lieRate).toBeGreaterThan(0.3);
    expect(lieRate).toBeLessThan(0.5);
  });
});
