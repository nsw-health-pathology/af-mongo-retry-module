/* eslint-disable no-magic-numbers */
import { IRetryPolicy } from './retry-policy';

/**
 * Default retry policy
 */
export class DefaultRetryPolicy implements IRetryPolicy {

  private currentRetryCount = 0;

  constructor(
    private readonly maxRetryCount: number = 10,
    public retryAfterMilliSec: number = 1000
  ) { }

  /**
   * Check if the operation should be retried
   */
  public async shouldRetry(): Promise<boolean> {
    if (this.currentRetryCount < this.maxRetryCount) {
      this.currentRetryCount++;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
