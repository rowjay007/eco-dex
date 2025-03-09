export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors?: Array<string | RegExp>;
}

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOptions = { ...defaultOptions, ...options };
  let lastError: Error = new Error('Operation failed');
  let delay = retryOptions.initialDelay;

  for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === retryOptions.maxAttempts) {
        break;
      }

      if (retryOptions.retryableErrors && 
          !isRetryableError(error as Error, retryOptions.retryableErrors)) {
        throw error;
      }

      await sleep(delay);
      delay = Math.min(
        delay * retryOptions.backoffFactor,
        retryOptions.maxDelay
      );
    }
  }

  throw lastError;
}

function isRetryableError(error: Error, retryableErrors: Array<string | RegExp>): boolean {
  return retryableErrors.some(pattern => {
    if (typeof pattern === 'string') {
      return error.message.includes(pattern);
    }
    return pattern.test(error.message);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}