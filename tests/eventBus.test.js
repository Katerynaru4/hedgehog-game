import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../src/core/EventBus.js';

describe('EventBus - Observer Pattern', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should create event bus', () => {
    expect(eventBus).toBeDefined();
  });

  it('should subscribe to event', () => {
    const callback = vi.fn();
    eventBus.on('test', callback);

    eventBus.emit('test', { data: 'value' });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ data: 'value' });
  });

  it('should handle multiple subscribers', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    eventBus.on('event', callback1);
    eventBus.on('event', callback2);

    eventBus.emit('event', { value: 42 });

    expect(callback1).toHaveBeenCalledWith({ value: 42 });
    expect(callback2).toHaveBeenCalledWith({ value: 42 });
  });

  it('should unsubscribe from event', () => {
    const callback = vi.fn();

    eventBus.on('test', callback);
    eventBus.emit('test');
    expect(callback).toHaveBeenCalledTimes(1);

    eventBus.off('test', callback);
    eventBus.emit('test');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not fail when emitting event with no subscribers', () => {
    expect(() => {
      eventBus.emit('nonexistent', { data: 'test' });
    }).not.toThrow();
  });

  it('should pass multiple arguments to subscribers', () => {
    const callback = vi.fn();

    eventBus.on('multi', callback);
    eventBus.emit('multi', 'arg1', 'arg2', 'arg3');

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });
});
