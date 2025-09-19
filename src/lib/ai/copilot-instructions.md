# AI & Research Libraries Instructions

This directory contains AI integration and research capabilities for the CEP Spec Validation application.

## AI Provider Development

### Resilient AI Pattern

Implement circuit breaker patterns for AI provider reliability:

```typescript
export interface AIProvider {
  name: string;
  generate(messages: CoreMessage[]): Promise<StreamTextResult>;
  isAvailable(): Promise<boolean>;
}

class ResilientAIProvider implements AIProvider {
  private readonly circuitBreaker = new CircuitBreaker();

  async generate(messages: CoreMessage[]) {
    return await this.circuitBreaker.execute(async () => {
      return Promise.resolve(
        streamText({
          model: google("gemini-2.5-pro"),
          messages,
        })
      );
    });
  }
}
```

### AI Integration Guidelines

- **Error handling**: Wrap all AI calls in try-catch
- **Timeouts**: Implement reasonable timeouts for API calls
- **Fallbacks**: Provide graceful degradation when AI unavailable
- **Cost awareness**: Monitor token usage and implement limits
- **Streaming**: Use streaming responses for real-time feedback
- **Resilient provider**: All calls to `generateObject` or `streamText` must use an instance from `getResilientAI()`, not the base `geminiModel()`. Use the resilient AI provider for circuit breaker and retry logic.

### Circuit Breaker Pattern

- **Closed state**: Normal operation, calls pass through
- **Open state**: Failures detected, calls fail fast
- **Half-open state**: Testing recovery, limited calls allowed
- **Failure threshold**: Configure based on acceptable error rates
- **Recovery timeout**: Allow time for service recovery

## Research Integration

### Competitive Research

- **Static data sources**: Use local knowledge base files
- **Real citations**: Include verifiable source information
- **Fact checking**: Never invent unverifiable market claims
- **Structured output**: Return consistent data formats

### Knowledge Base Management

- **File organization**: Use clear directory structure in `/knowledge`
- **Data freshness**: Mark data with last updated timestamps
- **Source attribution**: Include original source URLs/references
- **Format consistency**: Use markdown for documentation

### Research Guidelines

```typescript
interface CompetitorInfo {
  vendor: string;
  product?: string;
  keyFeatures?: string[];
  marketPosition?: string;
  source?: string; // Always include for citations
}

// Always provide fallback for missing data
const fallbackInfo: CompetitorInfo = {
  vendor: vendorName,
  product: `[PM_INPUT_NEEDED: ${vendorName} product name]`,
  keyFeatures: [`[PM_INPUT_NEEDED: ${vendorName} key features]`],
  marketPosition: `[PM_INPUT_NEEDED: ${vendorName} market position]`,
  source: `[PM_INPUT_NEEDED: ${vendorName} research source]`,
};
```

## Performance Requirements

- **Response times**: AI calls should complete within reasonable timeouts
- **Memory usage**: Avoid loading large models unnecessarily
- **Caching**: Cache expensive operations when appropriate
- **Concurrency**: Handle multiple simultaneous requests safely

## Error Recovery Strategies

- **Retry logic**: Implement exponential backoff
- **Graceful degradation**: Continue operation with reduced functionality
- **User feedback**: Provide clear error messages
- **Logging**: Log failures for debugging and monitoring

## Testing AI Components

```bash
# Test with API key
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env.local
pnpm dev

# Test without API key (should show graceful error)
# Remove .env.local
pnpm dev
```

## Package Manager

- Use `pnpm` for AI/ML package installations
- Large dependencies may take longer to install - be patient
