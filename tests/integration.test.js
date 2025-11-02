import { describe, it, expect, beforeEach } from 'vitest';
import { GameController } from '../src/core/GameController.js';
import { RNG } from '../src/utils/RNG.js';
import { MapBuilder } from '../src/world/MapBuilder.js';
import { Hedgehog } from '../src/entities/Hedgehog.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Integration Tests', () => {
  let controller;
  let rng;

  beforeEach(() => {
    rng = new RNG(42);
    const mapData = {
      width: 5,
      height: 5,
      pits: [{ x: 2, y: 2 }],
      food: [
        { x: 1, y: 0, value: 10 },
        { x: 3, y: 3, value: 15 },
      ],
      npcs: [
        {
          name: 'Rabbit',
          type: 'honest',
          x: 4,
          y: 4,
          dialogs: ['Hello!', 'Be careful!'],
        },
        {
          name: 'Fox',
          type: 'deceptive',
          x: 3,
          y: 0,
          dialogs: ['Trust me...', 'Or not...'],
        },
      ],
      predators: [{ name: 'Wolf', x: 4, y: 0 }],
    };
    controller = new GameController(mapData, rng);
  });

  it('should complete full game scenario with food collection', () => {
    controller.hedgehog.positionX = 0;
    controller.hedgehog.positionY = 0;

    controller.moveHedgehog('right');

    expect(controller.hedgehog.score).toBeGreaterThan(0);
    expect(controller.hedgehog.energy).toBeGreaterThan(90);
  });

  it('should handle curling before encountering predator', () => {
    controller.hedgehog.positionX = 3;
    controller.hedgehog.positionY = 0;

    controller.curlHedgehog();
    expect(controller.hedgehog.getStateName()).toBe('Curled');

    controller.moveHedgehog('right');
    expect(controller.hedgehog.isAlive()).toBe(true);
  });

  it('should handle talking to multiple NPCs', () => {
    controller.hedgehog.positionX = 4;
    controller.hedgehog.positionY = 4;

    const result1 = controller.talkToNPC();
    expect(result1).not.toBeNull();
    expect(result1.npc).toBe('Rabbit');

    controller.hedgehog.positionX = 3;
    controller.hedgehog.positionY = 0;

    const result2 = controller.talkToNPC();
    expect(result2).not.toBeNull();
    expect(result2.npc).toBe('Fox');
  });

  it('should handle energy depletion to zero', () => {
    controller.hedgehog.consumeEnergy(100);

    expect(controller.hedgehog.energy).toBe(0);
    expect(controller.hedgehog.isAlive()).toBe(false);
    expect(controller.isGameOver()).toBe(true);
  });

  it('should handle time running out naturally', () => {
    controller.timeRemaining = 2;

    controller.moveHedgehog('right');
    expect(controller.timeRemaining).toBe(1);
    expect(controller.isGameOver()).toBe(false);

    controller.moveHedgehog('right');
    expect(controller.timeRemaining).toBe(0);
    expect(controller.isGameOver()).toBe(true);
  });

  it('should emit events during gameplay', () => {
    const events = [];

    controller.eventBus.on('foodCollected', (data) => {
      events.push({ type: 'food', data });
    });

    controller.eventBus.on('invalidMove', () => {
      events.push({ type: 'invalid' });
    });

    controller.hedgehog.positionX = 0;
    controller.hedgehog.positionY = 0;

    controller.moveHedgehog('right');

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe('food');
  });

  it('should restart game correctly', () => {
    controller.hedgehog.die();
    controller.timeRemaining = 0;

    const mapData = {
      width: 5,
      height: 5,
      pits: [],
      food: [],
      npcs: [],
      predators: [],
    };

    controller.restart(mapData);

    expect(controller.hedgehog.isAlive()).toBe(true);
    expect(controller.hedgehog.energy).toBe(100);
    expect(controller.hedgehog.score).toBe(0);
    expect(controller.timeRemaining).toBe(100);
    expect(controller.isGameOver()).toBe(false);
  });

  it('should not move outside boundaries in all directions', () => {
    controller.hedgehog.positionX = 0;
    controller.hedgehog.positionY = 0;

    controller.moveHedgehog('left');
    expect(controller.hedgehog.positionX).toBe(0);

    controller.moveHedgehog('up');
    expect(controller.hedgehog.positionY).toBe(0);

    controller.hedgehog.positionX = 4;
    controller.hedgehog.positionY = 4;

    controller.moveHedgehog('right');
    expect(controller.hedgehog.positionX).toBe(4);

    controller.moveHedgehog('down');
    expect(controller.hedgehog.positionY).toBe(4);
  });

  it('should handle eating when energy is already high', () => {
    controller.hedgehog.energy = 95;
    controller.hedgehog.eat(20);

    expect(controller.hedgehog.energy).toBe(100);
  });

  it('should handle dead state transitions', () => {
    controller.hedgehog.die();

    controller.curlHedgehog();
    expect(controller.hedgehog.getStateName()).toBe('Dead');

    controller.uncurlHedgehog();
    expect(controller.hedgehog.getStateName()).toBe('Dead');
  });
});

describe('MapBuilder Edge Cases', () => {
  it('should build world with default dimensions', () => {
    const builder = new MapBuilder();
    const world = builder.build();

    expect(world.width).toBe(10);
    expect(world.height).toBe(10);
  });

  it('should handle empty JSON data', () => {
    const builder = new MapBuilder();
    const world = builder.fromJSON({}).build();

    expect(world.width).toBe(10);
    expect(world.height).toBe(10);
  });

  it('should chain builder methods', () => {
    const builder = new MapBuilder();
    const world = builder
      .setDimensions(6, 6)
      .addPit(1, 1)
      .addFood(2, 2, 10)
      .addPredator('Bear', 5, 5)
      .build();

    expect(world.width).toBe(6);
    expect(world.hasPit(1, 1)).toBe(true);
    expect(world.hasFood(2, 2)).toBe(true);
    expect(world.getPredatorAt(5, 5)).not.toBeNull();
  });

  it('should add NPC with honest strategy', () => {
    const builder = new MapBuilder();
    const world = builder
      .setDimensions(5, 5)
      .addNPC('Squirrel', 'honest', 2, 2, ['Hi there!'])
      .build();

    const npc = world.getNPCAt(2, 2);
    expect(npc).not.toBeNull();
    expect(npc.name).toBe('Squirrel');
  });

  it('should add NPC with deceptive strategy', () => {
    const builder = new MapBuilder();
    const world = builder
      .setDimensions(5, 5)
      .addNPC('Fox', 'deceptive', 3, 3, ['Hmm...'])
      .build();

    const npc = world.getNPCAt(3, 3);
    expect(npc).not.toBeNull();
    expect(npc.name).toBe('Fox');
  });
});

describe('EventBus Advanced Cases', () => {
  it('should handle unsubscribe from non-existent event', () => {
    const eventBus = new EventBus();
    const callback = () => {};

    expect(() => {
      eventBus.off('nonexistent', callback);
    }).not.toThrow();
  });

  it('should clear all events', () => {
    const eventBus = new EventBus();

    eventBus.on('event1', () => {});
    eventBus.on('event2', () => {});

    eventBus.clear();

    expect(eventBus.events).toEqual({});
  });
});

describe('States Edge Cases', () => {
  it('should not uncurl when in Normal state', () => {
    const hedgehog = new Hedgehog(0, 0);

    const initialState = hedgehog.getStateName();
    hedgehog.uncurl();

    expect(hedgehog.getStateName()).toBe(initialState);
  });

  it('should not curl when in Curled state', () => {
    const hedgehog = new Hedgehog(0, 0);

    hedgehog.curl();
    const curledState = hedgehog.state;
    hedgehog.curl();

    expect(hedgehog.state).toBe(curledState);
  });
});
