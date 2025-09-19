/**
 * Tests for enhanced error handling system
 */

import { classifyError, formatErrorForSupport, ERROR_CLASSIFICATIONS } from '../../src/lib/error/classification';

import type { ErrorCode } from '../../src/lib/error/types';

describe('Error Classification System', () => {
  test('should classify MISSING_API_KEY errors correctly', () => {
    const error = {
      message: 'Missing GOOGLE_GENERATIVE_AI_API_KEY on server',
      code: 'MISSING_API_KEY'
    };
    
    const classification = classifyError(error);
    
    expect(classification.code).toBe('MISSING_API_KEY');
    expect(classification.severity).toBe('critical');
    expect(classification.recoverable).toBe(false);
    expect(classification.status).toBe('offline');
    expect(classification.actions).toContain('configure-api-key');
  });

  test('should classify NETWORK_TIMEOUT errors correctly', () => {
    const error = {
      message: 'Request timed out while connecting to service',
      code: 'NETWORK_TIMEOUT'
    };
    
    const classification = classifyError(error);
    
    expect(classification.code).toBe('NETWORK_TIMEOUT');
    expect(classification.severity).toBe('warning');
    expect(classification.recoverable).toBe(true);
    expect(classification.status).toBe('degraded');
    expect(classification.actions).toContain('retry');
  });

  test('should handle unknown errors with fallback classification', () => {
    const error = {
      message: 'Some unknown error occurred',
      code: 'UNKNOWN_ERROR'
    };
    
    const classification = classifyError(error);
    
    expect(classification.code).toBe('UNEXPECTED_ERROR');
    expect(classification.severity).toBe('critical');
    expect(classification.recoverable).toBe(false);
    expect(classification.status).toBe('offline');
  });

  test('should detect timeout errors by message content', () => {
    const error = {
      message: 'Operation timeout after 30 seconds'
    };
    
    const classification = classifyError(error);
    
    expect(classification.code).toBe('NETWORK_TIMEOUT');
    expect(classification.recoverable).toBe(true);
  });

  test('should format error details for support correctly', () => {
    const error = {
      code: 'NETWORK_TIMEOUT',
      message: 'Request timed out',
      timestamp: 1640995200000, // Fixed timestamp for testing
      context: { phase: 'generating', attempt: 2 }
    };
    
    const formatted = formatErrorForSupport(error);
    
    expect(formatted).toContain('Error Code: NETWORK_TIMEOUT');
    expect(formatted).toContain('Message: Request timed out');
    expect(formatted).toContain('Timestamp: 2022-01-01T00:00:00.000Z');
    expect(formatted).toContain('Context:');
    expect(formatted).toContain('"phase": "generating"');
    expect(formatted).toContain('"attempt": 2');
  });

  test('should provide appropriate recovery actions for each error type', () => {
    const errorTypes: ErrorCode[] = [
      'MISSING_API_KEY',
      'NETWORK_TIMEOUT', 
      'RATE_LIMITED',
      'VALIDATION_FAILED',
      'SERVICE_UNAVAILABLE',
      'INVALID_INPUT',
      'UNEXPECTED_ERROR'
    ];

    for (const errorCode of errorTypes) {
      const classification = ERROR_CLASSIFICATIONS[errorCode];
      expect(classification).toBeDefined();
      expect(classification.actions).toBeDefined();
      expect(classification.actions.length).toBeGreaterThan(0);
      expect(typeof classification.title).toBe('string');
      expect(typeof classification.message).toBe('string');
    }
  });

  test('should have consistent severity and status mapping', () => {
    // Critical errors should be offline
    expect(ERROR_CLASSIFICATIONS.MISSING_API_KEY.status).toBe('offline');
    expect(ERROR_CLASSIFICATIONS.UNEXPECTED_ERROR.status).toBe('offline');
    expect(ERROR_CLASSIFICATIONS.SERVICE_UNAVAILABLE.status).toBe('offline');
    
    // Warning/Info errors should be degraded
    expect(ERROR_CLASSIFICATIONS.NETWORK_TIMEOUT.status).toBe('degraded');
    expect(ERROR_CLASSIFICATIONS.RATE_LIMITED.status).toBe('degraded');
    expect(ERROR_CLASSIFICATIONS.VALIDATION_FAILED.status).toBe('degraded');
    expect(ERROR_CLASSIFICATIONS.INVALID_INPUT.status).toBe('degraded');
  });
});