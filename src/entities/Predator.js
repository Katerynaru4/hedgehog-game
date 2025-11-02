export class Predator {
  static INITIAL_DIRECTION_CHANCE = 0.5;
  static MOVE_INTERVAL = 10;
  static MAX_DISTANCE_FROM_START = 10;

  static RESET_COUNTER = 0;

  constructor(name, positionX, positionY, isFull = false) {
    this.name = name;
    this.positionX = positionX;
    this.positionY = positionY;
    this.isFull = isFull;
    this.startX = positionX;
    this.startY = positionY;
    this.direction = Math.random() > Predator.INITIAL_DIRECTION_CHANCE ? 1 : -1;
    this.moveCounter = Predator.RESET_COUNTER;
  }

  calculateManhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  move(world) {
    this.moveCounter += 1;
    if (this.moveCounter % Predator.MOVE_INTERVAL !== 0) {
      return;
    }

    const distanceFromStart = this.calculateManhattanDistance(
      this.positionX,
      this.positionY,
      this.startX,
      this.startY
    );

    if (distanceFromStart >= Predator.MAX_DISTANCE_FROM_START) {
      this.direction *= -1;
    }

    const directions = [
      { x: this.direction, y: 0 },
      { x: -this.direction, y: 0 },
    ];

    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const newX = this.positionX + randomDir.x;
    const newY = this.positionY + randomDir.y;

    if (world.isValidPosition(newX, newY)) {
      const distance = this.calculateManhattanDistance(
        newX,
        newY,
        this.startX,
        this.startY
      );
      if (distance <= Predator.MAX_DISTANCE_FROM_START) {
        this.positionX = newX;
        this.positionY = newY;
      }
    }
  }

  attack(hedgehog) {
    if (this.isFull) {
      return false;
    }
    if (hedgehog.isVulnerable()) {
      hedgehog.die();
      return true;
    }
    return false;
  }

  getPosition() {
    return { x: this.positionX, y: this.positionY };
  }
}
