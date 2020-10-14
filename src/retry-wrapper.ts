import { MongoError } from 'mongodb';

import { DefaultRetryPolicy } from './default-retry-policy';
import { IRetryPolicy } from './retry-policy';

const tooManyRequests = 16500;

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Handle retries for MongoDB
 */
export async function RetryWrapper<T>(
  fn: () => Promise<T>,
  retryPolicy?: IRetryPolicy
): Promise<T> {
  if (!retryPolicy) {
    retryPolicy = new DefaultRetryPolicy();
  }
  try {
    const response = await fn();
    return response;
  } catch (error) {
    const mongoError = error as MongoError;
    if (mongoError.code === tooManyRequests) {
      const shouldRetry = await retryPolicy.shouldRetry();
      if (shouldRetry) {
        await delay(retryPolicy.retryAfterMilliSec);
        return RetryWrapper(fn, retryPolicy);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}
