import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * Happy-path E2E for the 5-step rentencheck wizard.
 *
 * All backend calls are mocked via page.route() — no real server needed.
 * Strategy mirrors auth-happy-path.spec.ts: mock /api/** routes, add the
 * laravel_session cookie to pass middleware, then drive the wizard.
 */

const CLIENT_ID = 7;
const RENTENCHECK_ID = 42;

const MOCK_USER = {
  id: 1,
  name: "Test Advisor",
  first_name: "Test",
  last_name: "Advisor",
  full_name: "Test Advisor",
  email: "advisor@example.com",
  phone: null,
  company: null,
  plan: "premium",
  status: "active",
  newsletter: false,
  roles: ["financial_advisor"],
  is_admin: false,
  is_advisor: true,
  is_active: true,
  is_blocked: false,
  email_verified_at: "2024-01-01T00:00:00Z",
};

const MOCK_CLIENT = {
  id: CLIENT_ID,
  first_name: "Maria",
  last_name: "Muster",
  full_name: "Maria Muster",
  email: "maria@example.com",
  birth_date: "1980-05-15",
  user_id: 1,
};

/** Minimal rentencheck in draft state */
function makeDraftRentencheck(overrides: Record<string, unknown> = {}) {
  return {
    id: RENTENCHECK_ID,
    user_id: 1,
    client_id: CLIENT_ID,
    status: "draft",
    title: "Rentencheck für Maria Muster",
    notes: null,
    completed_steps: [] as number[],
    step_1_data: null,
    step_2_data: null,
    step_3_data: null,
    step_4_data: null,
    step_5_data: null,
    progress_percentage: 0,
    is_complete: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    files: [],
    ...overrides,
  };
}

const MOCK_PENSION_PARAMS = {
  data: {
    parameters: {
      economic_assumptions: { inflation_rate: 0.02, investment_return_rate: 0.04 },
      demographics: { retirement_age: 67, life_expectancy: 85 },
      social_insurance: { total_insurance_rate: 0.088 },
    },
  },
};

/**
 * Shared setup: auth cookie + route mocks that every wizard test needs.
 * Step-specific PUT mocks are added inside each test.
 */
async function setupWizardMocks(page: Page) {
  // Simulate post-login session — middleware checks for this cookie.
  await page
    .context()
    .addCookies([
      { name: "laravel_session", value: "test-session", domain: "localhost", path: "/" },
    ]);

  // Auth
  await page.route("**/api/auth/user", (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { user: MOCK_USER },
        permissions: ["manage_clients"],
        message: "ok",
      }),
    }),
  );

  // Client details
  await page.route(`**/api/clients/${CLIENT_ID}`, (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { client: MOCK_CLIENT }, message: "ok" }),
    }),
  );

  // Rentenchecks list — initially empty, page will create one
  await page.route(`**/api/clients/${CLIENT_ID}/rentenchecks`, (route: Route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { rentenchecks: [], client: MOCK_CLIENT },
          message: "ok",
        }),
      });
    }
    // POST — create draft
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          rentencheck: makeDraftRentencheck(),
          client: MOCK_CLIENT,
        },
        message: "created",
      }),
    });
  });

  // Single rentencheck GET
  await page.route(`**/api/clients/${CLIENT_ID}/rentenchecks/${RENTENCHECK_ID}`, (route: Route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            rentencheck: makeDraftRentencheck(),
            client: MOCK_CLIENT,
          },
          message: "ok",
        }),
      });
    }
    // DELETE (if triggered)
    return route.fulfill({ status: 200, body: JSON.stringify({ message: "deleted" }) });
  });

  // Pension parameters (used by useRentenblickForm on mount)
  await page.route("**/api/pension-parameters", (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_PENSION_PARAMS }),
    }),
  );
}

test("wizard page loads for authenticated advisor", async ({ page }) => {
  await setupWizardMocks(page);

  await page.goto(`/dashboard/clients/${CLIENT_ID}/rentencheck/${RENTENCHECK_ID}`);

  // The page title should contain the client name
  await expect(page.getByText(/Maria Muster/)).toBeVisible({ timeout: 10_000 });
});

test("wizard renders Step 1 (Persönliche und finanzielle Angaben) on load", async ({ page }) => {
  await setupWizardMocks(page);

  await page.goto(`/dashboard/clients/${CLIENT_ID}/rentencheck/${RENTENCHECK_ID}`);

  await expect(page.getByText(/Persönliche und finanzielle Angaben/i)).toBeVisible({
    timeout: 10_000,
  });
});

test("confirming Step 1 unlocks Step 2 navigation", async ({ page }) => {
  await setupWizardMocks(page);

  // Mock the step 1 save endpoint
  await page.route(
    `**/api/clients/${CLIENT_ID}/rentenchecks/${RENTENCHECK_ID}/step/1`,
    (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            rentencheck: makeDraftRentencheck({ completed_steps: [1], progress_percentage: 20 }),
            client: MOCK_CLIENT,
          },
          message: "ok",
        }),
      }),
  );

  await page.goto(`/dashboard/clients/${CLIENT_ID}/rentencheck/${RENTENCHECK_ID}`);

  // Wait for wizard to render
  await expect(page.getByText(/Persönliche und finanzielle Angaben/i)).toBeVisible({
    timeout: 10_000,
  });

  // Click the confirm/weiter button for step 1
  const confirmBtn = page
    .getByRole("button", { name: /Schritt bestätigen|Bestätigen|Weiter/i })
    .first();
  await confirmBtn.click();

  // After saving step 1, the "Ihre Erwartungen" step header or stepper item should be accessible
  await expect(page.getByText(/Ihre Erwartungen/i)).toBeVisible({ timeout: 8_000 });
});

test("full wizard happy path — all 5 steps confirmed → results view", async ({ page }) => {
  await setupWizardMocks(page);

  // Mock all 5 step PUT endpoints
  for (let step = 1; step <= 5; step++) {
    const completedSoFar = Array.from({ length: step }, (_, i) => i + 1);
    await page.route(
      `**/api/clients/${CLIENT_ID}/rentenchecks/${RENTENCHECK_ID}/step/${step}`,
      (route: Route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              rentencheck: makeDraftRentencheck({
                completed_steps: completedSoFar,
                progress_percentage: step * 20,
                is_complete: step === 5,
              }),
              client: MOCK_CLIENT,
            },
            message: "ok",
          }),
        }),
    );
  }

  // Mock the complete endpoint
  await page.route(
    `**/api/clients/${CLIENT_ID}/rentenchecks/${RENTENCHECK_ID}/complete`,
    (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            rentencheck: makeDraftRentencheck({
              status: "completed",
              completed_steps: [1, 2, 3, 4, 5],
              progress_percentage: 100,
              is_complete: true,
            }),
            client: MOCK_CLIENT,
          },
          message: "completed",
        }),
      }),
  );

  await page.goto(`/dashboard/clients/${CLIENT_ID}/rentencheck/${RENTENCHECK_ID}`);

  await expect(page.getByText(/Persönliche und finanzielle Angaben/i)).toBeVisible({
    timeout: 10_000,
  });

  // Drive through all 5 steps by clicking the primary action button
  for (let step = 1; step <= 5; step++) {
    const btn = page
      .getByRole("button", { name: /Schritt bestätigen|Bestätigen|Weiter|PDF|Abschließen/i })
      .first();
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await btn.click();
    // Brief pause for async state to settle
    await page.waitForTimeout(300);
  }

  // After step 5 is confirmed (generatePDF called), results view should appear.
  // The results component renders some summary text.
  await expect(page.getByText(/Ergebnis|Zusammenfassung|PDF|Auswertung/i).first()).toBeVisible({
    timeout: 10_000,
  });
});
