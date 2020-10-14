import { IRetryPolicy } from './retry-policy';

/**
 * Default retry policy
 */
export class DefaultRetryPolicy implements IRetryPolicy {

  private currentRetryCount: number = 0;

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
      return true;
    }
    return false;
  }
}
