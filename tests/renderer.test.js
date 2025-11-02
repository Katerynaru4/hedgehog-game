import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIRenderer } from '../src/ui/UIRenderer.js';

describe('UIRenderer - Facade Pattern', () => {
  let renderer;
  let mockElements;

  beforeEach(() => {
    mockElements = {
      state: { textContent: '' },
      energy: { textContent: '' },
      score: { textContent: '' },
      time: { textContent: '' },
      log: {
        innerHTML: '',
        scrollTop: 0,
        scrollHeight: 100,
        appendChild: vi.fn(),
      },
    };

    global.document = {
      getElementById: vi.fn((id) => mockElements[id]),
      createElement: vi.fn((tag) => ({
        className: '',
        textContent: '',
        tagName: tag.toUpperCase(),
      })),
    };

    renderer = new UIRenderer();
  });

  it('should create renderer', () => {
    expect(renderer).toBeDefined();
  });

  it('should render game state', () => {
    const gameState = {
      hedgehog: {
        position: { x: 5, y: 3 },
        energy: 75,
        score: 50,
        state: 'Normal',
      },
      timeRemaining: 80,
      isGameOver: false,
    };

    renderer.render(gameState);

    expect(mockElements.state.textContent).toBe('🦔 Normal');
    expect(mockElements.energy.textContent).toBe(75);
    expect(mockElements.score.textContent).toBe(50);
    expect(mockElements.time.textContent).toBe(80);
  });

  it('should add log message', () => {
    renderer.addLog('Test message');

    expect(mockElements.log.appendChild).toHaveBeenCalled();
  });

  it('should add log message with type', () => {
    renderer.addLog('Error message', 'error');

    expect(mockElements.log.appendChild).toHaveBeenCalled();
  });

  it('should clear log', () => {
    mockElements.log.innerHTML = 'Some content';

    renderer.clearLog();

    expect(mockElements.log.innerHTML).toBe('');
  });

  it('should handle missing DOM elements gracefully', () => {
    global.document.getElementById = vi.fn(() => null);

    const newRenderer = new UIRenderer();
    const gameState = {
      hedgehog: {
        position: { x: 0, y: 0 },
        energy: 100,
        score: 0,
        state: 'Normal',
      },
      timeRemaining: 100,
      isGameOver: false,
    };

    expect(() => {
      newRenderer.render(gameState);
    }).not.toThrow();
  });
});
