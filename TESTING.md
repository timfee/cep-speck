# Streaming Protocol Testing Guide

This document provides comprehensive testing procedures for the CEP Speck streaming protocol, covering browser compatibility, network conditions, and performance validation.

## Overview

The streaming protocol testing framework validates:
- **Frame Creation**: All 7 StreamFrame types (phase, generation, validation, self-review, healing, result, error)
- **NDJSON Encoding**: Protocol compliance and parsing reliability
- **Browser Compatibility**: Cross-browser functionality and feature support
- **Network Conditions**: Various network speeds, interruptions, and recovery
- **Performance**: Memory usage, throughput, and scalability
- **Error Handling**: Graceful failure and recovery scenarios

## Quick Start

### Running All Tests
```bash
npm test
```

### Running Specific Test Suites
```bash
# Core streaming utilities
npm test src/lib/spec/streaming.test.ts

# Integration tests
npm test tests/integration/streaming.test.ts

# Performance tests
npm test tests/performance/streaming.test.ts
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Categories

### 1. Core Streaming Tests (`src/lib/spec/streaming.test.ts`)

**Frame Creation Tests**
- Validates all 7 StreamFrame types are created correctly
- Tests TypeScript discriminated union type safety
- Verifies frame data structure integrity

**Frame Encoding Tests**
- NDJSON format compliance (newline-delimited JSON)
- Encoding/decoding round-trip integrity
- Malformed data handling

**Error Handling Tests**
- StreamingError class functionality
- Error recovery utilities
- Error frame conversion

**Performance Tests**
- Large frame handling (50KB+ content)
- Rapid frame creation (1000+ frames)
- Memory efficiency validation

### 2. Integration Tests (`tests/integration/streaming.test.ts`)

**End-to-End Workflows**
- ✅ Complete successful workflow (knowledge → research → generate → validate → result)
- 🩹 Healing workflow with validation issues and retry
- ❌ Error scenarios with graceful failure
- 📊 Large content performance testing

**Network Condition Testing**
- Slow network simulation (high latency)
- Packet loss simulation (10% drop rate)
- Network interruption and recovery
- Chunked frame delivery

**Browser Compatibility**
- Streaming feature support detection
- Browser environment information
- Memory constraint handling

**Frame Processing Performance**
- Real-time frame processing speed
- Rapid frame succession handling
- Malformed frame resilience

**Error Recovery**
- Temporary error handling
- Stream interruption management
- Graceful degradation

**Memory Management**
- Memory leak detection
- Component cleanup validation
- Concurrent processing

### 3. Performance Tests (`tests/performance/streaming.test.ts`)

**Frame Creation Performance**
- 10,000 frame creation in <1 second
- Large content (100KB) frame creation
- Mixed frame type performance

**Frame Encoding Performance**
- 1,000 frame encoding in <200ms
- 1MB content encoding in <1 second
- Sustained encoding load testing

**Memory Performance**
- Memory leak detection
- Garbage collection validation
- Memory-efficient streaming

**Concurrent Processing**
- Multi-worker frame creation
- Concurrent encoding performance
- Thread safety validation

**Real-world Scenarios**
- Realistic PRD generation load
- High-frequency frame updates (10ms intervals)
- Content size scaling (1KB to 100KB)

**Browser Environment**
- Cross-browser performance comparison
- Memory-constrained environment handling
- Environment capability detection

## Manual Testing Procedures

### Browser Compatibility Testing

#### Chrome (Primary Target)
1. Open Chrome DevTools (F12)
2. Navigate to http://localhost:3000
3. Run complete workflow with "Run" button
4. Monitor Network tab for streaming requests
5. Check Console for any errors
6. Verify phase indicators update correctly

#### Safari (macOS/iOS)
1. Open Safari Web Inspector
2. Test on macOS Safari latest version
3. Test on iOS Safari (simulator or device)
4. Verify streaming functionality
5. Check for iOS-specific issues

#### Firefox (Standards Compliance)
1. Open Firefox Developer Tools
2. Test streaming protocol compliance
3. Verify NDJSON parsing
4. Check memory usage in Performance tab

#### Edge (Enterprise Environment)
1. Test in Microsoft Edge
2. Verify enterprise compatibility
3. Check corporate proxy compatibility
4. Validate security policy compliance

### Network Condition Testing

#### Fast Connection
- Expected: No frame drops, smooth streaming
- Test: Monitor for real-time updates
- Verify: Phase transitions are immediate

#### Slow Connection
1. Chrome DevTools → Network → Throttling → "Slow 3G"
2. Run workflow and verify graceful handling
3. Expected: Delayed but complete frame delivery

#### Intermittent Connection
1. Use Network throttling to simulate drops
2. Test connection interruption during streaming
3. Verify recovery when connection restored

#### Connection Timeout
1. Simulate request timeout scenarios
2. Verify error handling and user feedback
3. Test retry mechanisms

### Frame Flow Validation

#### Successful Workflow Pattern
```
phase → generation → validation → result
```

#### Healing Workflow Pattern
```
phase → generation → validation → healing → generation → validation → result
```

#### Error Workflow Pattern
```
phase → error (with recovery metadata)
```

### Performance Testing

#### Memory Usage Monitoring
1. Open Chrome DevTools → Performance
2. Start recording
3. Run complete workflow
4. Monitor memory allocation and cleanup
5. Verify no memory leaks

#### Frame Rate Analysis
1. Monitor frame processing speed
2. Verify UI remains responsive
3. Check for frame drops or delays
4. Measure total workflow duration

#### Large Content Testing
1. Test with large specification inputs
2. Monitor streaming performance
3. Verify memory efficiency
4. Check for UI freezing

## Automated Testing Tools

### Browser Testing Utilities

**BrowserCompatibilityChecker**
- Detects streaming feature support
- Reports browser environment info
- Checks memory constraints

**NetworkSimulator**
- Simulates various network conditions
- Configurable latency and bandwidth
- Packet drop simulation

**FramePerformanceMonitor**
- Tracks frame processing performance
- Memory usage monitoring
- Frame rate calculation

### Integration Testing Tools

**StreamingAPISimulator**
- Simulates server-side streaming
- Configurable delays and errors
- ReadableStream generation

**ClientFrameProcessor**
- Simulates real client behavior
- Frame parsing and state management
- Performance metrics collection

**EndToEndTestRunner**
- Complete workflow testing
- Performance benchmarking
- Error scenario validation

## Expected Performance Benchmarks

### Frame Processing
- **Frame Creation**: 10,000 frames in <1 second
- **Frame Encoding**: 1,000 frames in <200ms
- **Frame Parsing**: <10ms average per frame
- **Large Content**: 100KB frames in <100ms

### Memory Usage
- **Memory Growth**: <50MB for 5,000 frames
- **Memory Leaks**: Minimal growth after cleanup
- **Concurrent Processing**: Scales linearly

### Network Performance
- **Throughput**: >50 frames per second
- **Latency Tolerance**: Works with 500ms+ delays
- **Recovery Time**: <1 second after interruption

### Browser Performance
- **Cross-browser**: Consistent performance ±20%
- **Mobile Safari**: Functional with reduced performance
- **Memory Constrained**: Works with <100MB available

## Common Issues and Solutions

### NDJSON Parsing Errors
- **Issue**: Malformed JSON in stream
- **Solution**: Graceful error handling, frame skipping
- **Test**: `should handle malformed frames gracefully`

### Memory Leaks
- **Issue**: Accumulating frame data
- **Solution**: Efficient cleanup, garbage collection
- **Test**: Memory performance test suite

### Network Interruption
- **Issue**: Stream disconnection
- **Solution**: Error detection, retry mechanisms
- **Test**: Network recovery test scenarios

### Cross-browser Compatibility
- **Issue**: Feature support differences
- **Solution**: Feature detection, fallbacks
- **Test**: Browser compatibility test suite

## Debugging Tools

### Console Logging
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'streaming');
```

### Performance Monitoring
```javascript
// Monitor frame processing
const monitor = new FramePerformanceMonitor();
// ... use monitor during workflow
console.log(monitor.getStatistics());
```

### Network Analysis
```javascript
// Simulate network conditions
const sim = new NetworkSimulator({
  latency: 100,
  dropRate: 0.1
});
```

## Test Data Generation

### Realistic Workflows
- Use `IntegrationTestScenarios.createSuccessfulWorkflow()`
- Test healing with `createHealingWorkflow()`
- Simulate errors with `createErrorScenario()`

### Performance Testing
- Large content: `createLargeContentScenario()`
- Custom frame sequences for specific tests
- Configurable delays and error injection

## Continuous Integration

### GitHub Actions
```yaml
- name: Run Streaming Tests
  run: |
    npm test
    npm run test:coverage
```

### Performance Monitoring
- Track performance metrics over time
- Alert on performance regressions
- Memory usage trend analysis

## Success Criteria

### ✅ All Tests Pass
- Unit tests: StreamFrame creation and encoding
- Integration tests: End-to-end workflows
- Performance tests: Memory and speed benchmarks

### ✅ Browser Compatibility
- Chrome: Full functionality
- Safari: Core features working
- Firefox: Standards compliance
- Edge: Enterprise compatibility

### ✅ Performance Requirements
- Frame processing: <10ms average
- Memory usage: Efficient cleanup
- Network resilience: Handles interruptions
- Scalability: Supports large content

### ✅ Error Handling
- Graceful failure modes
- Clear error messages
- Recovery mechanisms
- User feedback

The streaming protocol testing framework ensures robust, performant, and compatible real-time communication for the CEP Speck application across all supported environments.