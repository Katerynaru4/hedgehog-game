import { describe, it, expect, beforeEach } from 'vitest';
import { GameController } from '../src/core/GameController.js';
import { RNG } from '../src/utils/RNG.js';

describe('GameController - GRASP Controller', () => {
  let controller;
  let rng;

  beforeEach(() => {
    rng = new RNG(12345);

    const mapData = {
      width: 10,
      height: 10,
      pits: [{ x: 2, y: 2 }],
      food: [{ x: 1, y: 1, value: 20 }],
      npcs: [
        {
          name: 'Rabbit',
          type: 'honest',
          x: 3,
          y: 3,
          dialogs: ['Hello!'],
        },
      ],
      predators: [{ name: 'Wolf', x: 5, y: 5 }],
    };

    controller = new GameController(mapData, rng);
  });

  it('should create game controller', () => {
    expect(controller).toBeDefined();
    expect(controller.isGameOver()).toBe(false);
  });

  it('should move hedgehog in valid direction', () => {
    const initialX = controller.hedgehog.positionX;
    const initialY = controller.hedgehog.positionY;

    controller.moveHedgehog('right');

    expect(controller.hedgehog.positionX).toBe(initialX + 1);
    expect(controller.hedgehog.positionY).toBe(initialY);
  });

  it('should not move hedgehog outside boundaries', () => {
    controller.hedgehog.positionX = 0;
    controller.hedgehog.positionY = 0;

    controller.moveHedgehog('left');

    expect(controller.hedgehog.positionX).toBe(0);
    expect(controller.hedgehog.positionY).toBe(0);
  });

  it('should collect food when moving to food position', () => {
    controller.hedgehog.positionX = 0;
    controller.hedgehog.positionY = 1;
    controller.hedgehog.consumeEnergy(30);

    controller.moveHedgehog('right');

    expect(controller.hedgehog.energy).toBeGreaterThan(50);
  });

  it('should handle pit with 50% survival chance', () => {
    controller.hedgehog.positionX = 1;
    controller.hedgehog.positionY = 2;

    const results = [];
    for (let index = 0; index < 100; index += 1) {
      const testRng = new RNG(index);
      const testMapData = {
        width: 10,
        height: 10,
        pits: [{ x: 2, y: 2 }],
        food: [],
        npcs: [],
        predators: [],
      };
      const testController = new GameController(testMapData, testRng);
      testController.hedgehog.positionX = 1;
      testController.hedgehog.positionY = 2;

      testController.moveHedgehog('right');
      results.push(testController.hedgehog.isAlive() ? 1 : 0);
    }

    const survivalRate =
      results.reduce((acc, val) => acc + val, 0) / results.length;
    expect(survivalRate).toBeGreaterThan(0.3);
    expect(survivalRate).toBeLessThan(0.7);
  });

  it('should handle predator attack when vulnerable', () => {
    controller.hedgehog.positionX = 4;
    controller.hedgehog.positionY = 5;

    controller.moveHedgehog('right');

    expect(controller.hedgehog.isAlive()).toBe(false);
  });

  it('should survive predator when curled', () => {
    controller.hedgehog.positionX = 4;
    controller.hedgehog.positionY = 5;
    controller.hedgehog.curl();

    controller.moveHedgehog('right');

    expect(controller.hedgehog.isAlive()).toBe(true);
  });

  it('should talk to NPC', () => {
    controller.hedgehog.positionX = 3;
    controller.hedgehog.positionY = 3;

    const result = controller.talkToNPC();

    expect(result).toBeDefined();
    expect(result.npc).toBe('Rabbit');
  });

  it('should not talk when no NPC present', () => {
    controller.hedgehog.positionX = 9;
    controller.hedgehog.positionY = 9;

    const result = controller.talkToNPC();

    expect(result).toBeNull();
  });

  it('should not talk when curled', () => {
    controller.hedgehog.positionX = 3;
    controller.hedgehog.positionY = 3;
    controller.hedgehog.curl();

    const result = controller.talkToNPC();

    expect(result).toBeNull();
  });

  it('should curl and uncurl hedgehog', () => {
    controller.curlHedgehog();
    expect(controller.hedgehog.getStateName()).toBe('Curled');

    controller.uncurlHedgehog();
    expect(controller.hedgehog.getStateName()).toBe('Normal');
  });

  it('should decrease time with each action', () => {
    const initialTime = controller.timeRemaining;

    controller.moveHedgehog('right');

    expect(controller.timeRemaining).toBe(initialTime - 1);
  });

  it('should end game when time runs out', () => {
    controller.timeRemaining = 1;

    controller.moveHedgehog('right');

    expect(controller.isGameOver()).toBe(true);
  });

  it('should end game when hedgehog dies', () => {
    controller.hedgehog.die();

    expect(controller.isGameOver()).toBe(true);
  });

  it('should get game state', () => {
    const state = controller.getGameState();

    expect(state).toHaveProperty('hedgehog');
    expect(state).toHaveProperty('timeRemaining');
    expect(state).toHaveProperty('isGameOver');
  });
});
