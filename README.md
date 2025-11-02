# 🦔 Hedgehog in the Forest

A browser-based game built with Vite and JavaScript (ES6 modules), featuring a hedgehog navigating through a forest while avoiding predators, collecting food, and interacting with NPCs.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# Navigate to http://localhost:5173
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

## 🎮 How to Play

### Objective

Collect **1000 food points** while avoiding predators and traps. You have **5 lives** to complete the challenge.

### Controls

#### Movement
- **Arrow Keys** or **WASD**: Move the hedgehog in four directions (↑ ↓ ← →)
- **S** or **↓**: Collect food (when standing next to it)

#### Actions
- **T**: Talk to NPCs when nearby
- **Double-click ↓↓ or SS**: Curl up (protects from predators)
- **Double-click ↑↑ or WW**: Uncurl (return to normal state)

#### Special
- **R**: Restart the game

### Game Mechanics

#### States
The hedgehog has three states:
- **Normal** 🦔: Can move, talk, and collect food normally. Vulnerable to predators.
- **Curled** 🔵: Protected from predators, but moves 2x slower. Cannot talk or collect food.
- **Dead** 💀: Game over (unless you have remaining lives).

#### Food Collection
- Food is collected automatically when you stand next to it (1 cell radius)
- Different food items give different point values (40-70 points)
- Collecting food restores energy and increases score

#### NPCs (Non-Player Characters)
- **Honest NPCs**: Always tell the truth about nearby predators
- **Deceptive NPCs (Fox)**: 50% chance to lie about predators
- Talk to NPCs by pressing **T** when nearby
- NPCs warn you about predators and give advice

#### Predators
- **Wolves** 🐺 and **Bears** 🐻 roam the forest
- They kill you if you're in Normal state and encounter them
- **Solution**: Curl up (double-click ↓↓) before encountering a predator
- Predators move slowly within a 10-cell radius

#### Traps
- **Pits**: 50% chance to die, 50% chance to survive
- **Bush Traps**: Some bushes have fox traps. If a fox is nearby, the bush kills you unless you're curled up

#### Lives System
- You start with **5 lives**
- Each death reduces lives by 1
- Game restarts automatically after death (if lives remain)
- Game over when all lives are lost

#### Energy & Time
- Each move consumes energy
- Energy is restored by collecting food
- Time decreases with each move
- Game ends if time runs out or energy reaches zero

## 📋 Game Rules

1. **Win Condition**: Collect 1000 food points
2. **Lose Condition**: Run out of lives or time
3. **Curl Protection**: Must be curled to survive predator encounters
4. **Food Radius**: Can collect food within 1 cell radius
5. **Movement Speed**: Curled hedgehog moves 2x slower
6. **NPC Advice**: Listen carefully - foxes may lie!
7. **Bush Traps**: Be careful around bushes with foxes nearby

## 🏗️ Architecture

### Project Structure

```
src/
├── core/           # Core game logic
│   ├── GameController.js    # Main game controller
│   └── EventBus.js          # Event system (Observer pattern)
├── entities/       # Game entities
│   ├── Hedgehog.js          # Player character
│   ├── NPC.js               # Non-player characters
│   ├── Predator.js          # Enemy entities
│   ├── States.js            # State pattern implementation
│   └── Strategies.js        # Strategy pattern for NPCs
├── world/          # World management
│   ├── World.js             # Game world and map
│   └── MapBuilder.js        # Builder pattern for world creation
├── ui/             # User interface
│   └── UIRenderer.js        # Facade for UI rendering
├── utils/          # Utilities
│   └── RNG.js               # Random number generator
└── data/           # Game data
    └── map.json             # Map configuration
```

### Key Components

- **GameController**: Orchestrates all game interactions (GRASP Controller pattern)
- **EventBus**: Implements Observer pattern for loose coupling between components
- **Hedgehog**: Player entity with State pattern (Normal, Curled, Dead states)
- **World**: Manages map, food, NPCs, predators, and collisions
- **UIRenderer**: Facade pattern simplifying DOM manipulation
- **MapBuilder**: Builder pattern for creating the game world from JSON

## 🧩 Design Patterns

| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| **State** | Manage hedgehog states (Normal, Curled, Dead) | `States.js`, `Hedgehog.js` |
| **Strategy** | Different NPC advice strategies (Honest 100%, Deceptive 60%) | `Strategies.js`, `NPC.js` |
| **Observer** | Event-driven communication between components | `EventBus.js` |
| **Builder** | Construct game world from JSON configuration | `MapBuilder.js` |
| **Facade** | Simplify complex UI rendering operations | `UIRenderer.js` |
| **Controller (GRASP)** | Centralize game logic coordination | `GameController.js` |

### Pattern Benefits

- **State**: Easy to add new hedgehog states without modifying existing code
- **Strategy**: Runtime strategy switching for NPCs, extensible advice system
- **Observer**: Loose coupling, easy to add new event listeners
- **Builder**: Flexible world creation, readable construction process
- **Facade**: Simplified UI interface, encapsulates DOM complexity
- **Controller**: Single point of entry for game logic, clear responsibility

## 🛠️ Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Tech Stack

- **Vite**: Build tool and dev server
- **JavaScript ES6+**: Modern JavaScript with modules
- **Vitest**: Testing framework
- **ESLint**: Code linting (Airbnb base config)
- **Prettier**: Code formatting

## 📝 Testing

The project uses Test-Driven Development (TDD) approach:
- **96 tests** covering all core functionality
- **Coverage**: 80%+ for critical game logic
- Unit tests for entities, controllers, and utilities
- Integration tests for complete game scenarios

## 🎯 SOLID Principles

- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Open for extension, closed for modification (states, strategies)
- **Liskov Substitution**: States and strategies are interchangeable
- **Interface Segregation**: Minimal, focused interfaces
- **Dependency Inversion**: Depend on abstractions (Strategy, State)

## 📄 License

This project is for educational purposes.

## 🎮 Enjoy the Game!

Good luck navigating the forest! Remember: when in doubt, curl up! 🦔
