import { DirectionUtil } from '../utils/Directions.js';

export class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pits = new Set();
    this.food = new Map();
    this.npcs = [];
    this.predators = [];
    this.bushes = new Map();
  }

  isValidPosition(positionX, positionY) {
    return (
      positionX >= 0 &&
      positionX < this.width &&
      positionY >= 0 &&
      positionY < this.height
    );
  }

  addPit(positionX, positionY) {
    this.pits.add(`${positionX},${positionY}`);
  }

  hasPit(positionX, positionY) {
    return this.pits.has(`${positionX},${positionY}`);
  }

  addFood(positionX, positionY, value) {
    this.food.set(`${positionX},${positionY}`, value);
  }

  hasFood(positionX, positionY) {
    const key = `${positionX},${positionY}`;
    return this.food.has(key);
  }

  collectFood(positionX, positionY) {
    const key = `${positionX},${positionY}`;
    if (this.food.has(key)) {
      const value = this.food.get(key);
      this.food.delete(key);
      return value;
    }
    return 0;
  }

  getFoodInRadius(positionX, positionY, radius) {
    if (this.hasFood(positionX, positionY)) {
      if (!this.hasBush(positionX, positionY)) {
        return { x: positionX, y: positionY };
      }
    }

    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        if (dx !== 0 || dy !== 0) {
          const distance = Math.abs(dx) + Math.abs(dy);
          if (distance <= radius) {
            const checkX = positionX + dx;
            const checkY = positionY + dy;

            if (this.hasFood(checkX, checkY)) {
              if (!this.hasBush(checkX, checkY)) {
                return { x: checkX, y: checkY };
              }
            }
          }
        }
      }
    }

    return null;
  }

  addNPC(npc) {
    this.npcs.push(npc);
  }

  getNPCAt(positionX, positionY) {
    return this.getNPCInRadius(positionX, positionY, 1);
  }

  getNPCInRadius(positionX, positionY, radius) {
    let found = this.npcs.find(
      (npc) => npc.positionX === positionX && npc.positionY === positionY
    );

    if (!found) {
      found = this.npcs.find((npc) => {
        const distance =
          Math.abs(npc.positionX - positionX) +
          Math.abs(npc.positionY - positionY);
        return distance <= radius;
      });
    }

    return found || null;
  }

  addPredator(predator) {
    this.predators.push(predator);
  }

  getPredatorAt(positionX, positionY) {
    return (
      this.predators.find(
        (predator) =>
          predator.positionX === positionX && predator.positionY === positionY
      ) || null
    );
  }

  getDirectionDelta(direction) {
    return DirectionUtil.getDelta(direction);
  }

  getPredatorInFrontOf(npcX, npcY, direction = 'right', maxDistance = 10) {
    const delta = this.getDirectionDelta(direction);

    for (let distance = 1; distance <= maxDistance; distance += 1) {
      const checkX = npcX + delta.x * distance;
      const checkY = npcY + delta.y * distance;

      if (!this.isValidPosition(checkX, checkY)) {
        break;
      }

      const predator = this.getPredatorAt(checkX, checkY);
      if (predator) {
        return predator;
      }
    }

    return null;
  }

  getAllPredatorsInDirection(
    npcX,
    npcY,
    direction = 'right',
    maxDistance = 10
  ) {
    const delta = this.getDirectionDelta(direction);
    const found = [];

    for (let distance = 1; distance <= maxDistance; distance += 1) {
      const checkX = npcX + delta.x * distance;
      const checkY = npcY + delta.y * distance;

      if (!this.isValidPosition(checkX, checkY)) {
        break;
      }

      const predator = this.getPredatorAt(checkX, checkY);
      if (predator) {
        found.push({ predator, distance });
      }
    }

    return found;
  }

  getNearestPredator(npcX, npcY, maxDistance = 15) {
    let nearestPredator = null;
    let nearestDistance = maxDistance + 1;

    this.predators.forEach((predator) => {
      const distance =
        Math.abs(predator.positionX - npcX) +
        Math.abs(predator.positionY - npcY);
      if (distance <= maxDistance && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPredator = predator;
      }
    });

    return nearestPredator;
  }

  addBush(positionX, positionY, hasFox = false) {
    this.bushes.set(`${positionX},${positionY}`, { hasFox });
  }

  hasBush(positionX, positionY) {
    return this.bushes.has(`${positionX},${positionY}`);
  }

  getBush(positionX, positionY) {
    return this.bushes.get(`${positionX},${positionY}`) || null;
  }

  hasFoxBeforeBush(bushX, bushY, hedgehogX, hedgehogY) {
    if (!this.hasBush(bushX, bushY)) {
      return false;
    }

    const hedgehogToBushDirection = {
      x: bushX - hedgehogX,
      y: bushY - hedgehogY,
    };

    let checkX;
    let checkY;

    if (
      Math.abs(hedgehogToBushDirection.x) > Math.abs(hedgehogToBushDirection.y)
    ) {
      if (hedgehogToBushDirection.x > 0) {
        checkX = bushX - 1;
        checkY = bushY;
      } else {
        checkX = bushX + 1;
        checkY = bushY;
      }
    } else if (hedgehogToBushDirection.y > 0) {
      checkX = bushX;
      checkY = bushY - 1;
    } else {
      checkX = bushX;
      checkY = bushY + 1;
    }

    const npc = this.npcs.find(
      (n) => n.positionX === checkX && n.positionY === checkY
    );

    const hasFox =
      npc && npc.name.includes('🦊') && npc.name.includes('Лисиця');

    return hasFox;
  }

  checkBushTrap(bushX, bushY) {
    const bush = this.getBush(bushX, bushY);
    return bush && bush.hasFox;
  }
}
