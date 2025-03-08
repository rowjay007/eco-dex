import { EventEmitter } from 'events';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitorInterval?: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    super();
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000,
      monitorInterval: options.monitorInterval || 5000
    };

    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => {
      if (this.state === CircuitState.OPEN &&
          Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.transitionToHalfOpen();
      }
    }, this.options.monitorInterval);
  }

  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastFailureTime = Date.now();
    this.emit('open');
  }

  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.emit('half-open');
  }

  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.emit('closed');
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await operation();
      if (this.state === CircuitState.HALF_OPEN) {
        this.transitionToClosed();
      }
      return result;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= this.options.failureThreshold) {
        this.transitionToOpen();
      }
      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.transitionToClosed();
  }
}