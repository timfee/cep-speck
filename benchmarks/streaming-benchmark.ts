import { fileURLToPath } from "node:url";

import {
  createGenerationFrame,
  createPhaseFrame,
  encodeStreamFrame,
} from "../src/lib/spec/streaming";

import type { StreamFrame, StreamPhase } from "../src/lib/spec/types";
import { FramePerformanceMonitor } from "../tests/browser/compatibility";

interface BenchmarkResult {
  name: string;
  value: number;
  unit?: string;
  threshold?: number;
  comparator?: "<" | ">";
  details?: Record<string, unknown>;
}

function recordResult(
  results: BenchmarkResult[],
  result: BenchmarkResult
): void {
  results.push(result);
}

function formatValue(value: number, unit?: string): string {
  const rounded = Number.isFinite(value) ? value.toFixed(2) : String(value);
  return unit ? `${rounded}${unit}` : rounded;
}

function evaluateResult(result: BenchmarkResult): boolean {
  const { threshold, value, comparator = "<" } = result;

  if (typeof threshold !== "number") {
    return Number.isFinite(value);
  }

  if (!Number.isFinite(value)) {
    return false;
  }

  return comparator === "<" ? value < threshold : value > threshold;
}

async function benchmarkFrameCreation(
  results: BenchmarkResult[]
): Promise<void> {
  const runCount = 5;
  const durations: number[] = [];
  let frames: StreamFrame[] = [];

  for (let run = 0; run < runCount; run++) {
    const startTime = performance.now();
    frames = [];
    for (let i = 0; i < 10000; i++) {
      frames.push(createGenerationFrame(`token${i}`, `content${i}`, i));
    }
    const endTime = performance.now();
    durations.push(endTime - startTime);
  }

  const avgDuration =
    durations.reduce((a, b) => a + b, 0) / Math.max(1, durations.length);

  recordResult(results, {
    name: "Frame creation (10k tokens)",
    value: avgDuration,
    unit: "ms",
    threshold: 1200,
  });
  recordResult(results, {
    name: "Frame creation output length",
    value: frames.length,
    comparator: ">",
    threshold: 9999,
  });
}

async function benchmarkLargeFrameCreation(
  results: BenchmarkResult[]
): Promise<void> {
  const largeContent = "A".repeat(100000);
  const startTime = performance.now();

  const frame = createGenerationFrame(
    largeContent,
    largeContent,
    largeContent.length
  );

  const endTime = performance.now();
  const duration = endTime - startTime;

  recordResult(results, {
    name: "Large frame creation (100KB)",
    value: duration,
    unit: "ms",
    threshold: 100,
  });
  recordResult(results, {
    name: "Large frame delta length",
    value: frame.type === "generation" ? frame.data.delta.length : 0,
    comparator: ">",
    threshold: 99999,
    unit: "chars",
  });
}

async function benchmarkMixedFrameCreation(
  results: BenchmarkResult[]
): Promise<void> {
  const startTime = performance.now();
  const frames: StreamFrame[] = [];

  for (let i = 0; i < 1000; i++) {
    frames.push(createPhaseFrame("generating", (i % 3) + 1, `Message ${i}`));
    frames.push(createGenerationFrame(`chunk${i}`, `content${i}`, i));

    if (i % 10 === 0) {
      frames.push(createPhaseFrame("healing", 1, `Error ${i}`));
    }
  }

  const endTime = performance.now();

  recordResult(results, {
    name: "Mixed frame creation (phase/generation)",
    value: endTime - startTime,
    unit: "ms",
    threshold: 500,
  });
  recordResult(results, {
    name: "Mixed frame output count",
    value: frames.length,
    comparator: ">",
    threshold: 2000,
  });
}

async function benchmarkEncoding(results: BenchmarkResult[]): Promise<void> {
  const frames: StreamFrame[] = [];
  for (let i = 0; i < 1000; i++) {
    frames.push(createGenerationFrame(`token${i}`, `content${i}`, i));
  }

  const startTime = performance.now();
  const encoded = frames.map((frame) => encodeStreamFrame(frame));
  const endTime = performance.now();

  recordResult(results, {
    name: "Frame encoding (1000 frames)",
    value: endTime - startTime,
    unit: "ms",
    threshold: 200,
  });
  recordResult(results, {
    name: "Encoded frame count",
    value: encoded.length,
    comparator: ">",
    threshold: 999,
  });
}

async function benchmarkLargeEncoding(
  results: BenchmarkResult[]
): Promise<void> {
  const largeContent = "B".repeat(1_000_000);
  const frame = createGenerationFrame(
    largeContent,
    largeContent,
    largeContent.length
  );

  const startTime = performance.now();
  const encoded = encodeStreamFrame(frame);
  const endTime = performance.now();

  recordResult(results, {
    name: "Large frame encoding (1MB)",
    value: endTime - startTime,
    unit: "ms",
    threshold: 1000,
  });
  recordResult(results, {
    name: "Large encoded size",
    value: encoded.length,
    comparator: ">",
    threshold: 1_000_000,
    unit: "bytes",
  });
}

async function benchmarkEncodingLoad(
  results: BenchmarkResult[]
): Promise<void> {
  const frames: StreamFrame[] = [];
  for (let i = 0; i < 100; i++) {
    const size = 1000 + Math.floor((10000 * i) / 99);
    const content = "X".repeat(size);
    frames.push(createGenerationFrame(content, content, size));
  }

  const startTime = performance.now();
  for (let round = 0; round < 10; round++) {
    for (const frame of frames) {
      encodeStreamFrame(frame);
    }
  }
  const endTime = performance.now();

  recordResult(results, {
    name: "Sustained encoding load (100 frames x10)",
    value: endTime - startTime,
    unit: "ms",
    threshold: 2000,
  });
}

async function benchmarkConcurrentCreation(
  results: BenchmarkResult[]
): Promise<void> {
  const startTime = performance.now();

  const promises = [] as Array<Promise<StreamFrame[]>>;
  for (let worker = 0; worker < 10; worker++) {
    promises.push(
      new Promise<StreamFrame[]>((resolve) => {
        const frames: StreamFrame[] = [];
        for (let i = 0; i < 100; i++) {
          frames.push(
            createGenerationFrame(
              `worker${worker}_chunk${i}`,
              `worker${worker}_content${i}`,
              i
            )
          );
        }
        resolve(frames);
      })
    );
  }

  const resultsList = await Promise.all(promises);
  const endTime = performance.now();

  recordResult(results, {
    name: "Concurrent frame creation (10 workers)",
    value: endTime - startTime,
    unit: "ms",
    threshold: 1000,
  });
  recordResult(results, {
    name: "Concurrent creation worker outputs",
    value: resultsList.reduce((sum, frames) => sum + frames.length, 0),
    comparator: ">",
    threshold: 999,
  });
}

async function benchmarkConcurrentEncoding(
  results: BenchmarkResult[]
): Promise<void> {
  const baseFrames: StreamFrame[] = [];
  for (let i = 0; i < 50; i++) {
    baseFrames.push(createGenerationFrame(`base${i}`, `content${i}`, i));
  }

  const startTime = performance.now();

  const encodingPromises: Array<Promise<Uint8Array[]>> = [];
  for (let worker = 0; worker < 5; worker++) {
    encodingPromises.push(
      new Promise<Uint8Array[]>((resolve) => {
        const encoded = baseFrames.map((frame) => encodeStreamFrame(frame));
        resolve(encoded);
      })
    );
  }

  const resultsList = await Promise.all(encodingPromises);
  const endTime = performance.now();

  recordResult(results, {
    name: "Concurrent encoding (5 workers)",
    value: endTime - startTime,
    unit: "ms",
    threshold: 500,
  });
  recordResult(results, {
    name: "Concurrent encoding outputs",
    value: resultsList.reduce((sum, encoded) => sum + encoded.length, 0),
    comparator: ">",
    threshold: 249,
  });
}

async function benchmarkRealWorldScenario(
  results: BenchmarkResult[]
): Promise<void> {
  const monitor = new FramePerformanceMonitor();
  const phases: StreamPhase[] = [
    "loading-knowledge",
    "performing-research",
    "generating",
    "validating",
    "healing",
    "done",
  ];

  let totalContent = "";
  const startTime = performance.now();

  for (const phase of phases) {
    const phaseStart = monitor.startFrameProcessing();
    createPhaseFrame(phase, 1, `Processing ${phase}`);

    if (phase === "generating" || phase === "healing") {
      for (let i = 0; i < 50; i++) {
        const chunk = `Content chunk ${i} for ${phase}. `.repeat(10);
        totalContent += chunk;
        const frame = createGenerationFrame(
          chunk,
          totalContent,
          totalContent.length
        );
        encodeStreamFrame(frame);
      }
    }

    monitor.endFrameProcessing(phaseStart);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const endTime = performance.now();
  const stats = monitor.getStatistics();

  recordResult(results, {
    name: "Realistic workflow duration",
    value: endTime - startTime,
    unit: "ms",
    threshold: 2000,
  });
  recordResult(results, {
    name: "Realistic workflow avg processing",
    value: stats.avgProcessingTime,
    unit: "ms",
    threshold: 50,
  });
  recordResult(results, {
    name: "Realistic workflow frame count",
    value: stats.totalFrames,
    comparator: ">",
    threshold: phases.length - 1,
  });
  recordResult(results, {
    name: "Realistic workflow content length",
    value: totalContent.length,
    comparator: ">",
    threshold: 1000,
    unit: "chars",
  });
}

async function benchmarkScaling(results: BenchmarkResult[]): Promise<void> {
  const contentSizes = [1000, 5000, 10000, 50000, 100000];
  const durations: number[] = [];

  for (const size of contentSizes) {
    const content = "A".repeat(size);
    const startTime = performance.now();

    const frame = createGenerationFrame(content, content, size);
    const encoded = encodeStreamFrame(frame);
    const decoded = new TextDecoder().decode(encoded);
    JSON.parse(decoded.trim());

    const endTime = performance.now();
    durations.push(endTime - startTime);
  }

  const maxDuration = Math.max(...durations);
  const scalingRatio = maxDuration / Math.max(durations[0], 1);

  recordResult(results, {
    name: "Scaling max duration",
    value: maxDuration,
    unit: "ms",
    threshold: 100,
  });
  recordResult(results, {
    name: "Scaling ratio (largest/smallest)",
    value: scalingRatio,
    threshold: 50,
  });
}

async function benchmarkEnvironment(results: BenchmarkResult[]): Promise<void> {
  const frames: StreamFrame[] = [];
  const startTime = performance.now();

  for (let i = 0; i < 1000; i++) {
    frames.push(createGenerationFrame(`test${i}`, `content${i}`, i));
  }

  const encoded = frames.map((f) => encodeStreamFrame(f));
  const endTime = performance.now();

  recordResult(results, {
    name: "Environment frame creation duration",
    value: endTime - startTime,
    unit: "ms",
    threshold: 1000,
  });
  recordResult(results, {
    name: "Environment encoded frames",
    value: encoded.length,
    comparator: ">",
    threshold: 999,
  });
}

async function runBenchmarks(): Promise<void> {
  const results: BenchmarkResult[] = [];

  await benchmarkFrameCreation(results);
  await benchmarkLargeFrameCreation(results);
  await benchmarkMixedFrameCreation(results);
  await benchmarkEncoding(results);
  await benchmarkLargeEncoding(results);
  await benchmarkEncodingLoad(results);
  await benchmarkConcurrentCreation(results);
  await benchmarkConcurrentEncoding(results);
  await benchmarkRealWorldScenario(results);
  await benchmarkScaling(results);
  await benchmarkEnvironment(results);

  const strictMode = process.argv.includes("--strict");
  let hasFailure = false;

  for (const result of results) {
    const pass = evaluateResult(result);
    const status = pass ? "PASS" : "WARN";
    if (!pass) {
      hasFailure = true;
    }

    const thresholdText =
      typeof result.threshold === "number"
        ? ` (threshold ${result.comparator ?? "<"} ${formatValue(
            result.threshold,
            result.unit
          )})`
        : "";

    console.log(
      `${status}: ${result.name} -> ${formatValue(result.value, result.unit)}${thresholdText}`
    );

    if (result.details) {
      console.log(`  details: ${JSON.stringify(result.details)}`);
    }
  }

  if (strictMode && hasFailure) {
    process.exitCode = 1;
  }
}

const isDirectExecution = fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  runBenchmarks().catch((error) => {
    console.error("Benchmark run failed", error);
    process.exitCode = 1;
  });
}
