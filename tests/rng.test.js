import { describe, it, expect, beforeEach } from 'vitest';
import { RNG } from '../src/utils/RNG.js';

describe('RNG - Random Number Generator', () => {
  let rng;

  beforeEach(() => {
    rng = new RNG(12345);
  });

  it('should create RNG with seed', () => {
    expect(rng).toBeDefined();
  });

  it('should generate reproducible random numbers with seed', () => {
    const rng1 = new RNG(42);
    const rng2 = new RNG(42);

    const value1 = rng1.next();
    const value2 = rng2.next();

    expect(value1).toBe(value2);
  });

  it('should generate numbers between 0 and 1', () => {
    for (let index = 0; index < 100; index += 1) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should check chance correctly for 50%', () => {
    const rng50 = new RNG(100);
    const results = [];

    for (let index = 0; index < 1000; index += 1) {
      results.push(rng50.chance(0.5) ? 1 : 0);
    }

    const successRate =
      results.reduce((acc, val) => acc + val, 0) / results.length;
    expect(successRate).toBeGreaterThan(0.4);
    expect(successRate).toBeLessThan(0.6);
  });

  it('should return random integer in range', () => {
    for (let index = 0; index < 50; index += 1) {
      const value = rng.nextInt(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('should pick random element from array', () => {
    const array = ['a', 'b', 'c', 'd'];
    const picked = rng.pick(array);
    expect(array).toContain(picked);
  });
});
