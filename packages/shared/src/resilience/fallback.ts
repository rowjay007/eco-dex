export interface FallbackOptions<T> {
  defaultValue?: T;
  fallbackFunction?: () => Promise<T>;
}

export class Fallback<T> {
  private readonly options: FallbackOptions<T>;

  constructor(options: FallbackOptions<T>) {
    this.options = options;
  }

  async execute(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.options.fallbackFunction) {
        return this.options.fallbackFunction();
      }
      if ('defaultValue' in this.options) {
        return this.options.defaultValue as T;
      }
      throw error;
    }
  }

  static async withFallback<T>(
    operation: () => Promise<T>,
    options: FallbackOptions<T>
  ): Promise<T> {
    const fallback = new Fallback(options);
    return fallback.execute(operation);
  }
}