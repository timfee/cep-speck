# API Routes Instructions

This directory contains Next.js API routes for the CEP Spec Validation application.

## API Development Guidelines

### Route Handler Standards

- Use **Next.js 15 App Router** patterns
- Implement proper **HTTP method handlers** (GET, POST, etc.)
- Follow **streaming response** patterns for long operations
- Use **TypeScript** for all route implementations

### Streaming API Pattern

The main `/api/run` route uses NDJSON streaming for real-time updates:

```typescript
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Stream progress updates as NDJSON
      const enqueue = (data: StreamFrame) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        // Your streaming logic here
        enqueue({ type: "phase", phase: "generating" });
        // ... more updates
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
```

### Error Handling

- Use try-catch blocks around all async operations
- Return proper HTTP status codes (200, 400, 500, etc.)
- Provide meaningful error messages
- Log errors appropriately for debugging

### Request/Response Types

```typescript
interface RequestBody {
  specText: string;
  // other fields
}

interface StreamFrame {
  type: "phase" | "generation" | "validation" | "result";
  // frame-specific data
}
```

### Security Considerations

- Validate all input parameters
- Sanitize user-provided content
- Use environment variables for sensitive data
- Implement rate limiting if needed

### Performance Guidelines

- Stream responses for long-running operations
- Use appropriate timeouts for external APIs
- Implement circuit breaker patterns for resilience
- Cache responses when appropriate

### AI Integration

- Use resilient AI provider patterns
- Handle API failures gracefully
- Implement retry logic with exponential backoff
- Monitor API usage and costs

## Magic Numbers Exception

API routes can use magic numbers for:

- HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Timeouts (1000, 2000, 3000, 5000ms)
- Retry counts (3, 5, 10)
- Port numbers (3000, 8000, etc.)

## Testing API Routes

```bash
# Start development server
pnpm dev

# Test API endpoints
curl -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{"specText": "Project: Test\nTarget SKU: premium"}'

# Or test in browser interface at localhost:3000
```

## Package Manager

- Use `pnpm` exclusively for dependencies
- Add API-related packages with `pnpm add package-name`
