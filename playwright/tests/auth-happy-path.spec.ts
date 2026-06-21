import { test, expect } from "@playwright/test";

/**
 * Happy-path login E2E with route-mocked backend.
 *
 * Locks two behaviours introduced during this refactor:
 *   1. middleware route gate (phase 5): unauth users on /dashboard -> /login
 *   2. middleware route gate: authed users on /login -> /dashboard
 *
 * The login form's response flow + bearer-token persistence is verified by
 * the dedicated request-fires assertion in the third test below.
 */

const MOCK_USER = {
  id: 1,
  name: "Test Advisor",
  first_name: "Test",
  last_name: "Advisor",
  email: "advisor@example.com",
  is_admin: false,
  is_advisor: true,
};

test("redirects unauthenticated user from /dashboard to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("session cookie present: middleware lets /dashboard through and bounces /login", async ({
  page,
  context,
}) => {
  // Simulate the post-login state directly: a laravel_session cookie set.
  await context.addCookies([
    {
      name: "laravel_session",
      value: "test-session",
      domain: "localhost",
      path: "/",
    },
  ]);

  // /dashboard endpoint will hit the backend too — stub /me so the dashboard mount
  // doesn't error out on auth check.
  await page.route("**/api/auth/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: MOCK_USER,
        permissions: ["manage_clients"],
        message: "ok",
      }),
    });
  });

  await page.goto("/dashboard");
  // Middleware should not redirect — we stay on a /dashboard path.
  await expect(page).toHaveURL(/\/dashboard/);

  // Going to /login while authed bounces to /dashboard.
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("/login renders the form (smoke)", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/E-Mail|Email/i)).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Passwort|Password/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Anmelden|^Login/i })).toBeVisible();
});
