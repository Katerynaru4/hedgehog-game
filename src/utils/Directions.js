export class DirectionUtil {
  static DIRECTION_DELTAS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    north: { x: 0, y: -1 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 },
    east: { x: 1, y: 0 },
  };

  static DIRECTIONS = ['north', 'south', 'east', 'west'];

  static getDelta(direction) {
    return this.DIRECTION_DELTAS[direction] || this.DIRECTION_DELTAS.right;
  }
}

