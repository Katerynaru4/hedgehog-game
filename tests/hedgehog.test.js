import { describe, it, expect, beforeEach } from 'vitest';
import { Hedgehog } from '../src/entities/Hedgehog.js';
import { NormalState, CurledState, DeadState } from '../src/entities/States.js';

describe('Hedgehog - State Pattern', () => {
  let hedgehog;

  beforeEach(() => {
    hedgehog = new Hedgehog(0, 0);
  });

  it('should create hedgehog at position', () => {
    expect(hedgehog.positionX).toBe(0);
    expect(hedgehog.positionY).toBe(0);
    expect(hedgehog.energy).toBe(100);
    expect(hedgehog.score).toBe(0);
  });

  it('should start in Normal state', () => {
    expect(hedgehog.state).toBeInstanceOf(NormalState);
    expect(hedgehog.getStateName()).toBe('Normal');
  });

  it('should curl up when in Normal state', () => {
    hedgehog.curl();
    expect(hedgehog.state).toBeInstanceOf(CurledState);
    expect(hedgehog.getStateName()).toBe('Curled');
  });

  it('should uncurl when in Curled state', () => {
    hedgehog.curl();
    hedgehog.uncurl();
    expect(hedgehog.state).toBeInstanceOf(NormalState);
    expect(hedgehog.getStateName()).toBe('Normal');
  });

  it('should not curl when already curled', () => {
    hedgehog.curl();
    const stateBefore = hedgehog.state;
    hedgehog.curl();
    expect(hedgehog.state).toBe(stateBefore);
  });

  it('should move and consume energy in Normal state', () => {
    hedgehog.move(1, 0);
    expect(hedgehog.positionX).toBe(1);
    expect(hedgehog.positionY).toBe(0);
    expect(hedgehog.energy).toBe(99);
  });

  it('should move and consume more energy in Curled state', () => {
    hedgehog.curl();
    hedgehog.move(1, 0);
    expect(hedgehog.positionX).toBe(1);
    expect(hedgehog.energy).toBe(98);
  });

  it('should not move when dead', () => {
    hedgehog.die();
    hedgehog.move(1, 1);
    expect(hedgehog.positionX).toBe(0);
    expect(hedgehog.positionY).toBe(0);
  });

  it('should die and change to Dead state', () => {
    hedgehog.die();
    expect(hedgehog.state).toBeInstanceOf(DeadState);
    expect(hedgehog.getStateName()).toBe('Dead');
    expect(hedgehog.isAlive()).toBe(false);
  });

  it('should not curl when dead', () => {
    hedgehog.die();
    hedgehog.curl();
    expect(hedgehog.state).toBeInstanceOf(DeadState);
  });

  it('should add score', () => {
    hedgehog.addScore(10);
    expect(hedgehog.score).toBe(10);
    hedgehog.addScore(5);
    expect(hedgehog.score).toBe(15);
  });

  it('should consume energy', () => {
    hedgehog.consumeEnergy(20);
    expect(hedgehog.energy).toBe(80);
  });

  it('should die when energy reaches zero', () => {
    hedgehog.consumeEnergy(100);
    expect(hedgehog.energy).toBe(0);
    expect(hedgehog.isAlive()).toBe(false);
  });

  it('should restore energy when eating', () => {
    hedgehog.consumeEnergy(30);
    hedgehog.eat(20);
    expect(hedgehog.energy).toBe(90);
  });

  it('should not restore energy above 100', () => {
    hedgehog.eat(50);
    expect(hedgehog.energy).toBe(100);
  });

  it('should be vulnerable in Normal state', () => {
    expect(hedgehog.isVulnerable()).toBe(true);
  });

  it('should not be vulnerable in Curled state', () => {
    hedgehog.curl();
    expect(hedgehog.isVulnerable()).toBe(false);
  });

  it('should be able to talk in Normal state', () => {
    expect(hedgehog.canTalk()).toBe(true);
  });

  it('should not be able to talk in Curled state', () => {
    hedgehog.curl();
    expect(hedgehog.canTalk()).toBe(false);
  });
});
