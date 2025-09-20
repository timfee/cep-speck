import { test, expect } from "@playwright/test";

test.describe("Legacy System Baseline Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Traditional Mode - Legacy Flow", async ({ page }) => {
    // Switch to Traditional Mode
    await page.click('button:has-text("Traditional Mode")');

    // Wait for Traditional Mode to load
    await expect(page.locator("text=Traditional Mode")).toBeVisible();

    // Find the spec input area (it should be a textarea or similar)
    const specInput = page
      .locator(
        'textarea[placeholder*="spec"], textarea[placeholder*="input"], .code-editor, [role="textbox"]'
      )
      .first();
    await expect(specInput).toBeVisible();

    // Clear and enter a simple brief
    await specInput.clear();
    await specInput.fill(
      "Project: Test\nTarget SKU: Premium\nObjective: A simple tool for testing"
    );

    // Find and click the Run button
    const runButton = page
      .locator(
        'button:has-text("Run"), button[aria-label*="run"], button[aria-label*="generate"]'
      )
      .first();
    await expect(runButton).toBeVisible();
    await runButton.click();

    // Wait for the generation process to start (look for loading states)
    await expect(
      page
        .locator(
          'text=Generating, text=🔄, [aria-label*="loading"], [aria-label*="generating"]'
        )
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Wait for the entire generation/validation/healing loop to complete
    // This could take up to 60 seconds as mentioned in the specs
    await expect(
      page
        .locator(
          'text=Complete, text=✅, [aria-label*="complete"], [aria-label*="done"]'
        )
        .first()
    ).toBeVisible({ timeout: 120000 });

    // Assert that final generated content exists and is not empty
    const outputArea = page
      .locator('[data-testid="output"], .output, .generated-content, .result')
      .first();
    await expect(outputArea).toBeVisible();

    const outputText = await outputArea.textContent();
    expect(outputText).toBeTruthy();
    expect(outputText!.length).toBeGreaterThan(100); // Should be substantial content

    // Take a snapshot of the final result for comparison
    await page.screenshot({
      path: "tests/e2e/baseline-traditional-mode.png",
      fullPage: true,
    });
  });

  test("Structured Mode - Serialization Flow", async ({ page }) => {
    // Ensure we're in Structured Mode (default)
    await expect(
      page.locator("text=Structured Mode, .structured-wizard, .wizard")
    ).toBeVisible();

    // Step 1: Enter an idea in the IdeaCaptureStep
    const ideaInput = page
      .locator(
        'textarea[placeholder*="idea"], textarea[placeholder*="brief"], input[placeholder*="idea"]'
      )
      .first();
    await expect(ideaInput).toBeVisible();
    await ideaInput.fill(
      "A tool to manage browser bookmarks for enterprise teams with advanced security features"
    );

    // Proceed to the next step (outline generation)
    const nextButton = page
      .locator(
        'button:has-text("Next"), button:has-text("Continue"), button[aria-label*="next"]'
      )
      .first();
    await nextButton.click();

    // Step 2: Wait for outline to be generated (ContentOutlineStep)
    await expect(
      page.locator("text=Outline, text=outline, .outline").first()
    ).toBeVisible({ timeout: 30000 });

    // Look for generated outline sections
    await expect(
      page
        .locator("text=TL;DR, text=Problems, text=Requirements, text=Metrics")
        .first()
    ).toBeVisible({ timeout: 30000 });

    // Proceed to parameters step
    const continueButton = page
      .locator(
        'button:has-text("Continue"), button:has-text("Next"), button[aria-label*="continue"]'
      )
      .first();
    await continueButton.click();

    // Step 3: Enterprise Parameters (EnterpriseParametersStep)
    await expect(
      page.locator("text=Parameters, text=Enterprise, .parameters").first()
    ).toBeVisible();

    // Proceed to generation step
    const generateButton = page
      .locator(
        'button:has-text("Generate"), button:has-text("Generate PRD"), button[aria-label*="generate"]'
      )
      .first();
    await generateButton.click();

    // Step 4: Wait for PRD generation (GenerateStep)
    // This triggers serializeToSpecText and calls the same /api/run endpoint
    await expect(
      page
        .locator('text=Generating, text=🔄, [aria-label*="generating"]')
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Wait for the complete workflow to finish
    await expect(
      page.locator("text=Complete, text=✅, .complete").first()
    ).toBeVisible({ timeout: 120000 });

    // Step 5: Verify final PRD is rendered (CompleteStep)
    const finalPrd = page
      .locator('[data-testid="final-prd"], .final-prd, .generated-prd')
      .first();
    await expect(finalPrd).toBeVisible();

    const prdText = await finalPrd.textContent();
    expect(prdText).toBeTruthy();
    expect(prdText!.length).toBeGreaterThan(200); // Should be substantial PRD content

    // Take a snapshot of the final result for comparison
    await page.screenshot({
      path: "tests/e2e/baseline-structured-mode.png",
      fullPage: true,
    });
  });

  test("Error Handling - Missing API Key", async ({ page }) => {
    // Switch to Traditional Mode for simpler testing
    await page.click('button:has-text("Traditional Mode")');

    const specInput = page
      .locator(
        'textarea[placeholder*="spec"], textarea[placeholder*="input"], .code-editor, [role="textbox"]'
      )
      .first();
    await specInput.clear();
    await specInput.fill(
      "Project: Test\nTarget SKU: Premium\nObjective: A simple tool"
    );

    const runButton = page
      .locator('button:has-text("Run"), button[aria-label*="run"]')
      .first();
    await runButton.click();

    // Should show error about missing API key
    await expect(
      page
        .locator(
          "text=Missing GOOGLE_GENERATIVE_AI_API_KEY, text=API key, .error"
        )
        .first()
    ).toBeVisible({ timeout: 30000 });

    // Should show error state indicator
    await expect(
      page.locator('text=❌, text=Error, [aria-label*="error"]').first()
    ).toBeVisible();
  });
});
