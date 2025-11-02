import { World } from './World.js';
import { NPC } from '../entities/NPC.js';
import { Predator } from '../entities/Predator.js';
import { HonestStrategy, DeceptiveStrategy } from '../entities/Strategies.js';

export class MapBuilder {
  static DEFAULT_WIDTH = 10;

  static DEFAULT_HEIGHT = 10;

  static NPC_TYPE_HONEST = 'honest';

  static NPC_TYPE_DECEPTIVE = 'deceptive';

  constructor() {
    this.width = MapBuilder.DEFAULT_WIDTH;
    this.height = MapBuilder.DEFAULT_HEIGHT;
    this.pitsData = [];
    this.foodData = [];
    this.npcsData = [];
    this.predatorsData = [];
    this.bushesData = [];
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  addPit(positionX, positionY) {
    this.pitsData.push({ x: positionX, y: positionY });
    return this;
  }

  addFood(positionX, positionY, value) {
    this.foodData.push({ x: positionX, y: positionY, value });
    return this;
  }

  addNPC(name, type, positionX, positionY, dialogs = []) {
    this.npcsData.push({ name, type, x: positionX, y: positionY, dialogs });
    return this;
  }

  addPredator(name, positionX, positionY) {
    this.predatorsData.push({ name, x: positionX, y: positionY });
    return this;
  }

  fromJSON(data) {
    this.width = data.width || MapBuilder.DEFAULT_WIDTH;
    this.height = data.height || MapBuilder.DEFAULT_HEIGHT;
    this.pitsData = data.pits || [];
    this.foodData = data.food || [];
    this.npcsData = data.npcs || [];
    this.predatorsData = data.predators || [];
    this.bushesData = data.bushes || [];
    return this;
  }

  createStrategy(type) {
    return type === MapBuilder.NPC_TYPE_HONEST
      ? new HonestStrategy()
      : new DeceptiveStrategy();
  }

  build() {
    const world = new World(this.width, this.height);

    this.pitsData.forEach((pit) => {
      world.addPit(pit.x, pit.y);
    });

    this.foodData.forEach((food) => {
      world.addFood(food.x, food.y, food.value);
    });

    this.npcsData.forEach((npcData) => {
      const strategy = this.createStrategy(npcData.type);
      const npc = new NPC(npcData.name, strategy, npcData.x, npcData.y);
      npcData.dialogs.forEach((dialog) => npc.addDialog(dialog));
      world.addNPC(npc);
    });

    this.predatorsData.forEach((predatorData) => {
      const predator = new Predator(
        predatorData.name,
        predatorData.x,
        predatorData.y
      );
      world.addPredator(predator);
    });

    this.bushesData.forEach((bushData) => {
      world.addBush(bushData.x, bushData.y, bushData.hasFox || false);
    });

    return world;
  }
}
