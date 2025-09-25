# AI Agent Guide (`tests`)

This guide provides context for the `tests` directory. All tests must adhere to the standards in the [root `AGENTS.md` guide](../AGENTS.md).

## Testing Strategy

The project uses a multi-layered testing strategy to ensure code quality and correctness.

## Structure

- **`e2e/`**: End-to-end tests using Playwright. These simulate real user flows from the browser.
- **`integration/`**: Integration tests that verify the interaction between multiple components or modules.
- **`unit/`**: Unit tests that isolate and test individual functions or components in detail.
