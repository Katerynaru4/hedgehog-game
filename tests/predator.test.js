import { describe, it, expect } from 'vitest';
import { Predator } from '../src/entities/Predator.js';

describe('Predator', () => {
  it('should create predator at position', () => {
    const predator = new Predator('Wolf', 5, 5);
    expect(predator.name).toBe('Wolf');
    expect(predator.positionX).toBe(5);
    expect(predator.positionY).toBe(5);
  });

  it('should attack vulnerable hedgehog', () => {
    const predator = new Predator('Wolf', 3, 3);
    const hedgehog = { isVulnerable: () => true, die: () => {} };

    const result = predator.attack(hedgehog);
    expect(result).toBe(true);
  });

  it('should not attack curled hedgehog', () => {
    const predator = new Predator('Wolf', 3, 3);
    const hedgehog = { isVulnerable: () => false };

    const result = predator.attack(hedgehog);
    expect(result).toBe(false);
  });

  it('should have position', () => {
    const predator = new Predator('Fox', 2, 8);
    const position = predator.getPosition();
    expect(position.x).toBe(2);
    expect(position.y).toBe(8);
  });
});
