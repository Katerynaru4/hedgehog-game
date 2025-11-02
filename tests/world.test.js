import { describe, it, expect, beforeEach } from 'vitest';
import { MapBuilder } from '../src/world/MapBuilder.js';

describe('World and MapBuilder', () => {
  let world;

  beforeEach(() => {
    const mapData = {
      width: 10,
      height: 10,
      pits: [
        { x: 2, y: 2 },
        { x: 5, y: 5 },
      ],
      food: [
        { x: 1, y: 1, value: 10 },
        { x: 3, y: 3, value: 15 },
      ],
      npcs: [
        { name: 'Rabbit', type: 'honest', x: 4, y: 4, dialogs: ['Hello!'] },
      ],
      predators: [{ name: 'Wolf', x: 7, y: 7 }],
    };

    const builder = new MapBuilder();
    world = builder.fromJSON(mapData).build();
  });

  it('should create world with dimensions', () => {
    expect(world.width).toBe(10);
    expect(world.height).toBe(10);
  });

  it('should check if position is valid', () => {
    expect(world.isValidPosition(5, 5)).toBe(true);
    expect(world.isValidPosition(-1, 5)).toBe(false);
    expect(world.isValidPosition(5, 15)).toBe(false);
    expect(world.isValidPosition(15, 5)).toBe(false);
  });

  it('should detect pits at positions', () => {
    expect(world.hasPit(2, 2)).toBe(true);
    expect(world.hasPit(5, 5)).toBe(true);
    expect(world.hasPit(3, 3)).toBe(false);
  });

  it('should detect food at positions', () => {
    expect(world.hasFood(1, 1)).toBe(true);
    expect(world.hasFood(3, 3)).toBe(true);
    expect(world.hasFood(5, 5)).toBe(false);
  });

  it('should collect food', () => {
    const food = world.collectFood(1, 1);
    expect(food).toBe(10);
    expect(world.hasFood(1, 1)).toBe(false);
  });

  it('should return 0 when collecting food from empty cell', () => {
    const food = world.collectFood(9, 9);
    expect(food).toBe(0);
  });

  it('should find NPC at position', () => {
    const npc = world.getNPCAt(4, 4);
    expect(npc).toBeDefined();
    expect(npc.name).toBe('Rabbit');
  });

  it('should return null when no NPC at position', () => {
    const npc = world.getNPCAt(9, 9);
    expect(npc).toBeNull();
  });

  it('should find predator at position', () => {
    const predator = world.getPredatorAt(7, 7);
    expect(predator).toBeDefined();
    expect(predator.name).toBe('Wolf');
  });

  it('should return null when no predator at position', () => {
    const predator = world.getPredatorAt(1, 1);
    expect(predator).toBeNull();
  });
});

describe('MapBuilder - Builder Pattern', () => {
  it('should build empty world', () => {
    const builder = new MapBuilder();
    const world = builder.setDimensions(5, 5).build();

    expect(world.width).toBe(5);
    expect(world.height).toBe(5);
  });

  it('should build world with pits', () => {
    const builder = new MapBuilder();
    const world = builder
      .setDimensions(10, 10)
      .addPit(3, 3)
      .addPit(7, 7)
      .build();

    expect(world.hasPit(3, 3)).toBe(true);
    expect(world.hasPit(7, 7)).toBe(true);
  });

  it('should build world with food', () => {
    const builder = new MapBuilder();
    const world = builder.setDimensions(10, 10).addFood(2, 2, 20).build();

    expect(world.hasFood(2, 2)).toBe(true);
  });

  it('should build world from JSON', () => {
    const mapData = {
      width: 8,
      height: 8,
      pits: [{ x: 1, y: 1 }],
      food: [{ x: 2, y: 2, value: 5 }],
      npcs: [],
      predators: [],
    };

    const builder = new MapBuilder();
    const world = builder.fromJSON(mapData).build();

    expect(world.width).toBe(8);
    expect(world.height).toBe(8);
    expect(world.hasPit(1, 1)).toBe(true);
    expect(world.hasFood(2, 2)).toBe(true);
  });
});
