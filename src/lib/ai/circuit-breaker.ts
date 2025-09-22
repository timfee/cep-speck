import { CIRCUIT_BREAKER } from "@/lib/constants";

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half-open",
}

/**
 * Circuit breaker for AI provider resilience
 */
export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttempt = Date.now();

  constructor(
    private readonly failureThreshold: number = CIRCUIT_BREAKER.FAILURE_THRESHOLD,
    private readonly recoveryTimeout: number = CIRCUIT_BREAKER.RECOVERY_TIMEOUT,
    private readonly successThreshold: number = CIRCUIT_BREAKER.SUCCESS_THRESHOLD
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker is OPEN. Next attempt at ${new Date(
            this.nextAttempt
          ).toISOString()}`
        );
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }
  }

  getState() {
    return this.state;
  }
}
