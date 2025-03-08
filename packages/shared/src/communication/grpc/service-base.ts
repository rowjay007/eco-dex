import * as grpc from '@grpc/grpc-js';
import { CircuitBreaker, withRetry, Fallback } from '../../resilience';

export interface GrpcServiceOptions {
  serviceName: string;
  host: string;
  port: number;
  circuitBreaker?: {
    failureThreshold: number;
    resetTimeout: number;
  };
  retry?: {
    maxAttempts: number;
    initialDelay: number;
  };
}

export abstract class GrpcServiceBase {
  protected readonly server: grpc.Server;
  protected readonly circuitBreaker: CircuitBreaker;
  protected readonly options: GrpcServiceOptions;

  constructor(options: GrpcServiceOptions) {
    this.options = options;
    this.server = new grpc.Server();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: options.circuitBreaker?.failureThreshold || 5,
      resetTimeout: options.circuitBreaker?.resetTimeout || 30000
    });
  }

  protected async executeWithResilience<T>(
    operation: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T> {
    return Fallback.withFallback(
      () => this.circuitBreaker.execute(
        () => withRetry(
          operation,
          {
            maxAttempts: this.options.retry?.maxAttempts || 3,
            initialDelay: this.options.retry?.initialDelay || 1000,
            maxDelay: 5000,
            backoffFactor: 2
          }
        )
      ),
      { defaultValue: fallbackValue }
    );
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `${this.options.host}:${this.options.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            reject(error);
            return;
          }
          this.server.start();
          resolve();
        }
      );
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => resolve());
    });
  }
}