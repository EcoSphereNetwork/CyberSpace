import { EventEmitter } from '../EventEmitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  it('should add and emit events', () => {
    const handler = jest.fn();
    emitter.on('test', handler);
    emitter.emit('test', 'data');
    expect(handler).toHaveBeenCalledWith('data');
  });

  it('should remove event listeners', () => {
    const handler = jest.fn();
    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test', 'data');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle once events', () => {
    const handler = jest.fn();
    emitter.once('test', handler);
    emitter.emit('test', 'data');
    emitter.emit('test', 'data');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should remove all listeners', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    emitter.on('test1', handler1);
    emitter.on('test2', handler2);
    emitter.removeAllListeners();
    emitter.emit('test1', 'data');
    emitter.emit('test2', 'data');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should remove listeners for specific event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    emitter.on('test1', handler1);
    emitter.on('test2', handler2);
    emitter.removeAllListeners('test1');
    emitter.emit('test1', 'data');
    emitter.emit('test2', 'data');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should get listener count', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    emitter.on('test', handler1);
    emitter.on('test', handler2);
    expect(emitter.listenerCount('test')).toBe(2);
  });

  it('should get event names', () => {
    const handler = jest.fn();
    emitter.on('test1', handler);
    emitter.on('test2', handler);
    expect(emitter.eventNames()).toEqual(['test1', 'test2']);
  });

  it('should get listeners for event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    emitter.on('test', handler1);
    emitter.on('test', handler2);
    expect(emitter.listeners('test')).toEqual([handler1, handler2]);
  });
});
