import { expect, test } from "@playwright/test";

async function delay(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe("Agentic structured workflow", () => {
  test("generates and renders outline via /api/generate", async ({ page }) => {
    const outlineResponse = {
      sections: [
        { id: "1", title: "Executive Summary", notes: "" },
        { id: "2", title: "Success Metrics", notes: "" },
      ],
    };

    let outlineCall: unknown;

    await page.route("**/api/generate", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}") as {
        phase?: string;
      };
      const phase = body.phase ?? "unknown";

      if (phase !== "outline") {
        throw new Error(`Unexpected phase ${phase}`);
      }

      outlineCall = { phase };

      await delay(100);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(outlineResponse),
      });
    });

    await page.goto("/");

    const promptInput = page.getByPlaceholder(
      /Describe your product idea here/
    );
    await promptInput.fill(
      "Project Falcon: AI assistant for enterprise security reviews with guided workflows and audit trails."
    );

    const nextButton = page.getByRole("button", { name: "Next", exact: true });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    await expect(
      page.getByRole("heading", { name: "Review & Edit Outline" })
    ).toBeVisible();
    await expect(
      page.locator('input[value="Executive Summary"]').first()
    ).toBeVisible();
    await expect(
      page.locator('input[value="Success Metrics"]').first()
    ).toBeVisible();

    expect(outlineCall).toMatchObject({ phase: "outline" });
  });

  test("streams draft text and finalizes the PRD", async ({ page }) => {
    const outlineResponse = {
      sections: [
        { id: "1", title: "TL;DR", notes: "Highlight automation" },
        { id: "2", title: "Functional Requirements", notes: "" },
      ],
    };

    const draftText = "Initial PRD draft text with actionable requirements.";
    const calls: string[] = [];

    await page.route("**/api/generate", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}") as {
        phase?: string;
      };
      const phase = body.phase ?? "unknown";
      calls.push(phase);

      switch (phase) {
        case "outline":
          await delay(50);
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(outlineResponse),
          });
          return;
        case "draft":
          await delay(150);
          await route.fulfill({
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
            body: draftText,
          });
          return;
        case "evaluate":
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: "[]",
          });
          return;
        default:
          throw new Error(`Unexpected phase ${phase}`);
      }
    });

    await page.goto("/");
    await page
      .getByPlaceholder(/Describe your product idea here/)
      .fill(
        "Enterprise automation workspace for compliance reporting with detailed RBAC and audit logs."
      );
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.locator('input[value="TL;DR"]').first()).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    const generateButton = page.getByRole("button", { name: "Generate Draft" });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    await expect(page.getByText(/Draft in progress/)).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "PRD Complete" })
    ).toBeVisible();
    await expect(page.locator("pre").last()).toContainText(draftText);

    expect(calls).toEqual(["outline", "draft", "evaluate"]);
  });

  test("runs iterative evaluate → refine loop until issues clear", async ({
    page,
  }) => {
    const outlineResponse = {
      sections: [
        { id: "1", title: "Goals", notes: "" },
        { id: "2", title: "Success Metrics", notes: "Quantify" },
      ],
    };

    const initialDraft = "Draft v1 with vague success metrics.";
    const refinedDraft = "Draft v2 with quantified metrics and clear goals.";

    const calls: string[] = [];
    let evaluateCount = 0;

    await page.route("**/api/generate", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}") as {
        phase?: string;
      };
      const phase = body.phase ?? "unknown";
      calls.push(phase);

      switch (phase) {
        case "outline":
          await delay(50);
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(outlineResponse),
          });
          return;
        case "draft":
          await delay(100);
          await route.fulfill({
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
            body: initialDraft,
          });
          return;
        case "evaluate":
          evaluateCount += 1;
          if (evaluateCount === 1) {
            await delay(200);
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify([
                {
                  section: "Success Metrics",
                  issue: "Metric lacks quantifiable target",
                  suggestion: "Add baseline and target with timeframe.",
                },
              ]),
            });
            return;
          }

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: "[]",
          });
          return;
        case "refine":
          await delay(300);
          await route.fulfill({
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
            body: refinedDraft,
          });
          return;
        default:
          throw new Error(`Unexpected phase ${phase}`);
      }
    });

    await page.goto("/");
    await page
      .getByPlaceholder(/Describe your product idea here/)
      .fill(
        "Workflow analytics product that recommends actions and reports adoption with target KPIs."
      );
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Review & Edit Outline" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Generate Draft" }).click();

    await expect(page.getByText(/Draft in progress/)).toBeVisible();
    await expect(page.getByText(/Evaluating the draft/)).toBeVisible();
    await expect(
      page.getByText(/Applying refinements \(iteration 1\)/)
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "PRD Complete" })
    ).toBeVisible();
    await expect(page.locator("pre").last()).toContainText(refinedDraft);
    await expect(page.getByText("✅ Quality Check Passed")).toBeVisible();

    expect(calls).toEqual([
      "outline",
      "draft",
      "evaluate",
      "refine",
      "evaluate",
    ]);
  });
});
